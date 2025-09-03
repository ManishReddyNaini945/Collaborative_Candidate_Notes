import { Link, Outlet, useNavigate } from 'react-router-dom'
import ToastContainer from './components/Toast'
import { Button } from '@/components/ui/button'

function App() {
  const navigate = useNavigate()
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null
  function logout() {
    localStorage.removeItem('user')
    navigate('/login')
  }
  return (
    <div className="min-h-dvh bg-neutral-50">
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-black" />
            <span className="font-semibold">Collaborative Candidate Notes</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4 text-sm text-neutral-700">
            <Link to="/">Dashboard</Link>
            {user ? (
              <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  )
}

export default App
