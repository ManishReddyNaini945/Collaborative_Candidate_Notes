import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, signup } from '../lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email || !password || !name) return
    setLoading(true)
    try {
      let user
      try {
        const r = await login(email)
        user = r.user
      } catch {
        await signup(name, email, password)
        const r2 = await login(email)
        user = r2.user
      }
      localStorage.setItem('user', JSON.stringify(user))
      navigate('/')
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70dvh] grid place-items-center">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Sign in or create your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input placeholder="Jane Doe" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input placeholder="jane@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
              <Button
  disabled={loading}
  className="w-full bg-black hover:bg-gray-900 text-white rounded-md py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
  type="submit"
>
  {loading && (
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
  )}
  {loading ? 'Signing in...' : 'Continue'}
</Button>


            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


