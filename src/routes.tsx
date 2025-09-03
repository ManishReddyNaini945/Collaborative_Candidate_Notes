
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import CandidateNotes from './pages/CandidateNotes'
import RequireAuth from './components/RequireAuth'

export const routes = [
  { path: '/login', element: <Login /> },
  {
    element: <RequireAuth />,
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/candidates/:id', element: <CandidateNotes /> },
    ],
  },
]


