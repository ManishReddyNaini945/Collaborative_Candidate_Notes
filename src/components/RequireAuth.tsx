import { Navigate, Outlet } from 'react-router-dom'

export default function RequireAuth() {
  const user = localStorage.getItem('user')
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}


