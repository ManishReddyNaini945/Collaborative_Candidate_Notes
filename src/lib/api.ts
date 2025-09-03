const BASE_URL = 'http://localhost:4000/api'

export async function signup(name: string, email: string, password: string) {
  const res = await fetch(`${BASE_URL}/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) })
  if (!res.ok) throw new Error('signup failed')
  return res.json()
}

export async function login(email: string) {
  const res = await fetch(`${BASE_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
  if (!res.ok) throw new Error('login failed')
  return res.json()
}

export async function listUsers() {
  const res = await fetch(`${BASE_URL}/users`)
  return res.json()
}

export async function listCandidates() {
  const res = await fetch(`${BASE_URL}/candidates`)
  return res.json()
}

export async function createCandidate(name: string, email: string) {
  const res = await fetch(`${BASE_URL}/candidates`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email }) })
  return res.json()
}

export async function listMessages(candidateId: string) {
  const res = await fetch(`${BASE_URL}/messages?candidateId=${candidateId}`)
  return res.json()
}

export async function listNotifications(userId: string) {
  const res = await fetch(`${BASE_URL}/notifications?userId=${userId}`)
  return res.json()
}

export async function markNotificationsRead(userId: string) {
  const res = await fetch(`${BASE_URL}/notifications/read`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) })
  return res.json()
}


