'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAppSelector } from '@/store/app/hooks'
import { selectAuthToken } from '@/store/features/auth/authSlice'

type ScheduledEmail = {
  id: string
  to_addresses: string[]
  cc_addresses: string[]
  bcc_addresses: string[]
  subject: string
  body: string
  send_at: string
  timezone: string
  status: 'scheduled' | 'sending' | 'sent' | 'failed' | 'cancelled'
  error_message: string | null
}

function localDateTimeValue(date = new Date()) {
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16)
}

export default function ScheduledPage() {
  const token = useAppSelector(selectAuthToken)
  const backendBaseUrl = useMemo(() => process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7000', [])
  const [items, setItems] = useState<ScheduledEmail[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState<ScheduledEmail | null>(null)
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sendAt, setSendAt] = useState(localDateTimeValue(new Date(Date.now() + 60 * 60 * 1000)))

  const headers = useMemo(() => token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : null, [token])

  const load = async () => {
    if (!headers) return
    const response = await fetch(`${backendBaseUrl}/scheduled-emails`, { headers })
    const data = await response.json()
    if (!response.ok) throw new Error(data?.error || 'Could not load scheduled emails')
    setItems(data.scheduledEmails || [])
  }

  useEffect(() => {
    load().catch((error) => setMessage(error instanceof Error ? error.message : 'Could not load scheduled emails'))
  }, [token])

  const resetForm = () => {
    setEditing(null)
    setTo('')
    setSubject('')
    setBody('')
    setSendAt(localDateTimeValue(new Date(Date.now() + 60 * 60 * 1000)))
  }

  const save = async () => {
    if (!headers || !to.trim() || !subject.trim() || !body.trim() || !sendAt) return
    setBusy(true)
    setMessage('')
    try {
      const payload = {
        to: to.split(',').map((v) => v.trim()).filter(Boolean),
        cc: [],
        bcc: [],
        subject,
        body,
        sendAt: new Date(sendAt).toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      }
      const response = await fetch(editing ? `${backendBaseUrl}/scheduled-emails/${editing.id}` : `${backendBaseUrl}/scheduled-emails`, {
        method: editing ? 'PATCH' : 'POST',
        headers,
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Could not save scheduled email')
      setMessage(editing ? 'Scheduled email updated.' : 'Email scheduled successfully.')
      resetForm()
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save scheduled email')
    } finally {
      setBusy(false)
    }
  }

  const cancel = async (id: string) => {
    if (!headers || !window.confirm('Cancel this scheduled email?')) return
    setBusy(true)
    try {
      const response = await fetch(`${backendBaseUrl}/scheduled-emails/${id}`, { method: 'DELETE', headers })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Could not cancel scheduled email')
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not cancel scheduled email')
    } finally {
      setBusy(false)
    }
  }

  const startEdit = (item: ScheduledEmail) => {
    setEditing(item)
    setTo(item.to_addresses.join(', '))
    setSubject(item.subject)
    setBody(item.body)
    setSendAt(localDateTimeValue(new Date(item.send_at)))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!token) return <main style={{ padding: 40 }}>Please sign in with Google to manage scheduled emails.</main>

  return (
    <main style={{ minHeight: '100vh', padding: '32px 20px 80px', background: '#f7f7f7' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32 }}>Scheduled emails</h1>
            <p style={{ margin: '8px 0 0', color: '#666' }}>Schedule, edit, or cancel messages before they are sent.</p>
          </div>
          <Link href="/compose" style={{ textDecoration: 'none' }}>Compose</Link>
        </div>

        <section style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e5e5e5', marginBottom: 18 }}>
          <h2 style={{ marginTop: 0 }}>{editing ? 'Edit scheduled email' : 'Schedule an email'}</h2>
          <div style={{ display: 'grid', gap: 14 }}>
            <label>To<input value={to} onChange={(e) => setTo(e.target.value)} placeholder="name@example.com" style={{ display: 'block', width: '100%', marginTop: 6, padding: 12, border: '1px solid #ccc', borderRadius: 8 }} /></label>
            <label>Subject<input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" style={{ display: 'block', width: '100%', marginTop: 6, padding: 12, border: '1px solid #ccc', borderRadius: 8 }} /></label>
            <label>Message<textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10} placeholder="Write your message..." style={{ display: 'block', width: '100%', marginTop: 6, padding: 12, border: '1px solid #ccc', borderRadius: 8, resize: 'vertical' }} /></label>
            <label>Send at<input type="datetime-local" value={sendAt} min={localDateTimeValue(new Date(Date.now() + 60 * 1000))} onChange={(e) => setSendAt(e.target.value)} style={{ display: 'block', width: '100%', marginTop: 6, padding: 12, border: '1px solid #ccc', borderRadius: 8 }} /></label>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button onClick={save} disabled={busy || !to.trim() || !subject.trim() || !body.trim()} style={{ padding: '12px 18px' }}>{editing ? 'Update schedule' : 'Schedule email'}</button>
            {editing && <button onClick={resetForm} disabled={busy} style={{ padding: '12px 18px' }}>Cancel edit</button>}
          </div>
          {message && <p style={{ marginTop: 16 }}>{message}</p>}
        </section>

        <section style={{ display: 'grid', gap: 12 }}>
          {items.length === 0 && <div style={{ background: '#fff', padding: 24, borderRadius: 16 }}>No scheduled emails.</div>}
          {items.map((item) => (
            <article key={item.id} style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e5e5e5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{item.subject}</div>
                  <div style={{ color: '#666', marginTop: 6 }}>To: {item.to_addresses.join(', ')}</div>
                  <div style={{ color: '#666', marginTop: 4 }}>{new Date(item.send_at).toLocaleString()} · {item.timezone}</div>
                </div>
                <div style={{ textTransform: 'capitalize' }}>{item.status}</div>
              </div>
              {item.error_message && <p style={{ color: '#b42318' }}>{item.error_message}</p>}
              {item.status === 'scheduled' && (
                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <button onClick={() => startEdit(item)} disabled={busy}>Edit</button>
                  <button onClick={() => cancel(item.id)} disabled={busy}>Cancel</button>
                </div>
              )}
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
