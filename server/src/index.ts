import express from 'express'
import cors from 'cors'
import http from 'http'
import { Server } from 'socket.io'
import { randomUUID } from 'crypto'
import sanitizeHtml from 'sanitize-html'
import dotenv from 'dotenv'
import { connectMongo, CandidateModel, MessageModel, NotificationModel, UserModel } from './models'

dotenv.config()
const app = express()
app.use(cors({ origin: ['http://localhost:5173'], credentials: true }))
app.use(express.json())

type User = { id: string; name: string; email: string }
type Candidate = { id: string; name: string; email: string }
type Message = { id: string; candidateId: string; userId: string; userName: string; text: string }
type Notification = { id: string; userId: string; candidateId: string; messageId: string; preview: string; createdAt: number; read: boolean }

// Mongo-backed storage

app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body || {}
  if (!name || !email || !password) return res.status(400).json({ error: 'missing fields' })
  UserModel.findOne({ email: sanitizeHtml(email) }).then(existing => {
    if (existing) return res.status(409).json({ error: 'email exists' })
    return UserModel.create({ name: sanitizeHtml(name), email: sanitizeHtml(email) }).then(doc => res.json({ user: { id: String(doc._id), name: doc.name, email: doc.email } }))
  }).catch(() => res.status(500).json({ error: 'server error' }))
})

app.post('/api/login', (req, res) => {
  const { email } = req.body || {}
  UserModel.findOne({ email: sanitizeHtml(email) }).then(doc => {
    if (!doc) return res.status(401).json({ error: 'invalid credentials' })
    return res.json({ user: { id: String(doc._id), name: doc.name, email: doc.email } })
  }).catch(() => res.status(500).json({ error: 'server error' }))
})

app.get('/api/users', (_req, res) => {
  UserModel.find().then(list => res.json({ users: list.map(u => ({ id: String(u._id), name: u.name, email: u.email })) }))
})

app.get('/api/candidates', (_req, res) => {
  CandidateModel.find().then(list => res.json({ candidates: list.map(c => ({ id: String(c._id), name: c.name, email: c.email })) }))
})
app.post('/api/candidates', (req, res) => {
  const { name, email } = req.body || {}
  if (!name || !email) return res.status(400).json({ error: 'missing fields' })
  CandidateModel.create({ name: sanitizeHtml(name), email: sanitizeHtml(email) }).then(doc => res.json({ candidate: { id: String(doc._id), name: doc.name, email: doc.email } }))
})

app.get('/api/messages', (req, res) => {
  const { candidateId } = req.query as { candidateId?: string }
  if (!candidateId) return res.status(400).json({ error: 'candidateId required' })
  MessageModel.find({ candidateId }).sort({ createdAt: 1 }).then(list => res.json({ messages: list.map(m => ({ id: String(m._id), candidateId: m.candidateId, userId: m.userId, userName: m.userName, text: m.text })) }))
})

app.get('/api/notifications', (req, res) => {
  const { userId } = req.query as { userId?: string }
  if (!userId) return res.status(400).json({ error: 'userId required' })
  NotificationModel.find({ userId }).sort({ createdAt: -1 }).then(list => res.json({ notifications: list.map(n => ({ id: String(n._id), userId: n.userId, candidateId: n.candidateId, messageId: n.messageId, preview: n.preview, createdAt: n.createdAt, read: n.read })) }))
})

app.post('/api/notifications/read', (req, res) => {
  const { userId } = req.body || {}
  if (!userId) return res.status(400).json({ error: 'userId required' })
  NotificationModel.updateMany({ userId }, { $set: { read: true } }).then(() => res.json({ ok: true }))
})

const server = http.createServer(app)
const io = new Server(server, { cors: { origin: ['http://localhost:5173'] } })

io.on('connection', socket => {
  socket.on('join', ({ roomId, user }: { roomId: string; user: User }) => {
    socket.join(roomId)
    socket.data.user = user
  })
  socket.on('message', async (payload: { roomId: string; text: string; user: User }) => {
    console.log('Received message payload:', payload)
    const { roomId, text, user } = payload
    const candidateId = roomId.split(':')[1]
    const safe = sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} })
    console.log('Sanitized text:', safe)
    
    let msg: any = null
    try {
      const doc = await MessageModel.create({ candidateId, userId: user.id, userName: user.name, text: safe })
      console.log('Message saved to DB:', doc)
      msg = { id: String(doc._id), candidateId, userId: user.id, userName: user.name, text: safe }
      io.to(roomId).emit('message', msg)
      console.log('Message broadcasted to room:', roomId)
    } catch (error) {
      console.error('Error saving message:', error)
      return
    }
    
    // detect @tags and notify
    const tags = Array.from(safe.matchAll(/@([a-zA-Z0-9_]+)/g)).map(m => (m as RegExpMatchArray)[1])
    console.log('Detected tags:', tags)
    if (tags.length && msg) {
      const allUsers = await UserModel.find()
      console.log('All users:', allUsers.map(u => ({ name: u.name, handle: u.name.replace(/\s+/g, '').toLowerCase() })))
      tags.forEach(async t => {
        const tagged = allUsers.find(u => u.name.replace(/\s+/g, '').toLowerCase() === t.toLowerCase())
        console.log(`Looking for tag "${t}" - found user:`, tagged ? { name: tagged.name, id: tagged._id } : 'NOT FOUND')
        if (tagged) {
          const preview = safe.length > 80 ? safe.slice(0, 77) + '...' : safe
          await NotificationModel.create({ userId: String(tagged._id), candidateId, messageId: msg.id, preview, createdAt: Date.now(), read: false })
          io.to(roomId).emit('tag', { to: String(tagged._id), from: user.name, candidateName: candidateId, messageId: msg.id })
          console.log('Notification created and tag event sent')
        }
      })
    }
  })
})

const PORT = process.env.PORT || 4000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/collab-notes'
connectMongo(MONGO_URI).then(() => {
  server.listen(PORT, () => console.log(`server listening on ${PORT}`))
}).catch(err => {
  console.error('Mongo connection failed', err)
  process.exit(1)
})


