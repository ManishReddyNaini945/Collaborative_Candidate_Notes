import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createCandidate, listCandidates, listNotifications } from '../lib/api'
import { io, Socket } from 'socket.io-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Dashboard() {
  const [cands, setCands] = useState<{ id: string; name: string; email: string }[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [notifs, setNotifs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  async function refresh() {
    const { candidates } = await listCandidates()
    setCands(candidates)
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user?.id) {
      const { notifications } = await listNotifications(user.id)
      setNotifs(notifications)
    }
  }

  useEffect(() => {
    refresh()
    
    // Set up Socket.IO for real-time notifications
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user?.id) {
      const socket: Socket = io('http://localhost:4000', { 
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      })
      
      socket.on('connect', () => {
        console.log('Dashboard socket connected:', socket.id)
      })
      
      socket.on('tag', (payload: any) => {
        console.log('Dashboard received tag notification:', payload)
        if (payload.to === user.id) {
          // Refresh notifications when tagged
          refresh()
        }
      })
      
      return () => {
        socket.disconnect()
      }
    }
  }, [])

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email) return
    setLoading(true)
    try {
      await createCandidate(name, email)
      setName('')
      setEmail('')
      refresh()
    } catch (error) {
      console.error('Failed to create candidate:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <section className="md:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Candidates</h2>
        </div>
        <Card>
          <CardContent className="p-4">
            <form onSubmit={onCreate} className="flex flex-col sm:flex-row gap-2">
              <Input className="flex-1" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
              <Input className="flex-1" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
              <Button disabled={loading} type="submit">
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                {loading ? 'Adding...' : 'Add'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y">
              {cands.map(c => (
                <li key={c.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.email}</div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/candidates/${c.id}`}>Open notes</Link>
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <Card>
          <CardContent className="p-0">
            {notifs.length === 0 ? (
              <div className="p-4 text-muted-foreground">No notifications yet</div>
            ) : (
              <ul className="divide-y">
                {notifs.map(n => (
                  <li key={n.id} className="p-4">
                    <Link to={`/candidates/${n.candidateId}?highlight=${n.messageId}`} className="block">
                      <div className="font-medium">Candidate {n.candidateId}</div>
                      <div className="text-muted-foreground">{n.preview}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}


