import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { io, Socket } from 'socket.io-client'
import { showToast } from '../components/Toast'
import { listMessages, listUsers } from '../lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

type Message = {
  id: string
  userId: string
  userName: string
  text: string
}

export default function CandidateNotes() {
  const { id } = useParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [mentions, setMentions] = useState<string[]>([])
  const [users, setUsers] = useState<{ id: string; name: string }[]>([])
  const endRef = useRef<HTMLDivElement | null>(null)
  const [search] = useSearchParams()
  const highlightId = search.get('highlight')

  const socket: Socket | null = useMemo(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!id) return null
    const s = io('http://localhost:4000', { 
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })
    
    s.on('connect', () => {
      console.log('Socket connected:', s.id)
      s.emit('join', { roomId: `candidate:${id}`, user })
    })
    
    s.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
    })
    
    s.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })
    
    s.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts')
      s.emit('join', { roomId: `candidate:${id}`, user })
    })
    
    s.on('message', (msg: Message) => {
      console.log('Received message:', msg)
      setMessages(prev => [...prev, msg])
    })
    
    s.on('tag', (payload: any) => {
      console.log('Received tag:', payload)
      const current = JSON.parse(localStorage.getItem('user') || '{}')
      if (payload.to === current.id) {
        showToast('You were tagged', `by ${payload.from} in candidate ${payload.candidateName}`)
      }
    })
    
    return s
  }, [id])

  useEffect(() => {
    return () => {
      socket?.disconnect()
    }
  }, [socket])

  useEffect(() => {
    async function boot() {
      if (!id) return
      const { messages } = await listMessages(id)
      setMessages(messages)
      const { users } = await listUsers()
      setUsers(users)
    }
    boot()
  }, [id])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send() {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const text = input.trim()
    if (!text) {
      console.log('No text to send')
      return
    }
    if (!socket) {
      console.log('No socket connection')
      return
    }
    console.log('Sending message:', { roomId: `candidate:${id}`, text, user })
    console.log('Socket connected?', socket.connected)
    
    if (!socket.connected) {
      console.log('Socket not connected, attempting to reconnect...')
      socket.connect()
      // Wait a bit for reconnection
      setTimeout(() => {
        if (socket.connected) {
          socket.emit('message', { roomId: `candidate:${id}`, text, user })
          setInput('')
        } else {
          console.log('Still not connected after retry')
        }
      }, 1000)
    } else {
      socket.emit('message', { roomId: `candidate:${id}`, text, user })
      setInput('')
    }
  }

  function onChange(v: string) {
    setInput(v)
    const tags = Array.from(v.matchAll(/@([a-zA-Z0-9_]+)/g)).map(m => m[1])
    setMentions(tags)
  }

  return (
    <div className="grid gap-4">
      <Card className="h-[60dvh] sm:h-[70dvh]">
        <CardContent className="p-3 h-full overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-sm text-neutral-500">No messages yet. Start the conversation!</div>
        )}
        <div className="space-y-3">
          {messages.map(m => {
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
            const isOwnMessage = m.userId === currentUser.id
            
            return (
              <div key={m.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-lg px-3 py-2 text-sm ${
                  highlightId === m.id 
                    ? 'bg-yellow-50 border border-yellow-200' 
                    : isOwnMessage 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-neutral-100 text-neutral-800'
                }`}>
                  {!isOwnMessage && (
                    <div className="font-medium text-xs opacity-75 mb-1">{m.userName}</div>
                  )}
                  <div className="whitespace-pre-wrap">{m.text}</div>
                </div>
              </div>
            )
          })}
        </div>
        <div ref={endRef} />
        </CardContent>
      </Card>
      <div className="text-xs text-neutral-500">
        {mentions.length > 0 ? (
          <div>Tagging: {mentions.join(', ')}</div>
        ) : (
          <div>Type @ to tag users</div>
        )}
      </div>
      {input.includes('@') && (
        <Card className="max-w-sm">
          <CardContent className="p-2">
            <div className="font-medium mb-1">Users</div>
            <ul className="max-h-40 overflow-y-auto">
              {users.map(u => (
                <li key={u.id} className="py-1 text-muted-foreground">@{u.name.replace(/\s+/g, '')}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardContent className="p-2">
          <div className="flex gap-2">
            <Input className="flex-1" value={input} onChange={e => onChange(e.target.value)} placeholder="Type a message with @username" />
            <Button onClick={send}>Send</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


