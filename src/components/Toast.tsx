import { useEffect, useState } from 'react'

type Toast = { id: string; title: string; description?: string }

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    function handler(e: CustomEvent<Toast>) {
      setToasts(prev => [...prev, e.detail])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== e.detail.id)), 3000)
    }
    window.addEventListener('app:toast' as any, handler as any)
    return () => window.removeEventListener('app:toast' as any, handler as any)
  }, [])

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {toasts.map(t => (
        <div key={t.id} className="rounded border bg-white shadow px-3 py-2">
          <div className="text-sm font-medium">{t.title}</div>
          {t.description && <div className="text-xs text-neutral-600">{t.description}</div>}
        </div>
      ))}
    </div>
  )
}

export function showToast(title: string, description?: string) {
  const event = new CustomEvent('app:toast', { detail: { id: Math.random().toString(36).slice(2), title, description } })
  window.dispatchEvent(event)
}


