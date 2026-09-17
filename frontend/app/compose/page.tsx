'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useAppSelector } from '@/store/app/hooks'
import { selectAuthToken } from '@/store/features/auth/authSlice'

type Email = {
  messageId: string
  threadId: string | null
  from: string
  to: string
  cc: string
  subject: string
  date: string
  messageIdHeader: string
  references: string
  body: string
}

export default function ComposePage() {
  const token = useAppSelector(selectAuthToken)
  const searchParams = useSearchParams()
  const backendBaseUrl = useMemo(() => process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:7000', [])
  const messageId = searchParams.get('messageId')
  const requestedMode = searchParams.get('mode') as 'reply' | 'replyAll' | 'forward' | null
  const [mode, setMode] = useState<'compose' | 'reply' | 'replyAll' | 'forward'>('compose')
  const [email, setEmail] = useState<Email | null>(null)
  const [to, setTo] = useState('')
  const [cc, setCc] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [instruction, setInstruction] = useState('')
  const [draftId, setDraftId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [showSendApproval, setShowSendApproval] = useState(false)

  const headers = useMemo(() => token ? { Authorization: `Bearer ${token}` } : null, [token])

  useEffect(() => {
    if (!headers || !messageId) return
    const load = async () => {
      setBusy(true)
      try {
        const response = await fetch(`${backendBaseUrl}/emails/${encodeURIComponent(messageId)}`, { headers })
        const data = await response.json()
        if (!response.ok) throw new Error(data?.error || `Could not read email (${response.status})`)
        const source = data.email as Email
        const nextMode = requestedMode === 'replyAll' || requestedMode === 'forward' || requestedMode === 'reply' ? requestedMode : 'reply'
        setEmail(source)
        setMode(nextMode)
        if (nextMode === 'forward') {
          setSubject(source.subject.toLowerCase().startsWith('fwd:') ? source.subject : `Fwd: ${source.subject}`)
          setBody(`\n\n---------- Forwarded message ----------\nFrom: ${source.from}\nDate: ${source.date}\nSubject: ${source.subject}\nTo: ${source.to}${source.cc ? `\nCc: ${source.cc}` : ''}\n\n${source.body}`)
        } else {
          setTo(nextMode === 'replyAll' ? [source.from, source.to, source.cc].filter(Boolean).join(', ') : source.from)
          setSubject(source.subject.toLowerCase().startsWith('re:') ? source.subject : `Re: ${source.subject}`)
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Could not load email')
      } finally {
        setBusy(false)
      }
    }
    load()
  }, [backendBaseUrl, headers, messageId, requestedMode])

  const generate = async () => {
    if (!headers || !instruction.trim()) return
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch(`${backendBaseUrl}/emails/generate`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction, recipientContext: to }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || `Generation failed (${response.status})`)
      setSubject(data.subject || '')
      setBody(data.body || '')
      setMessage('Draft generated. Review it before saving or sending.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'AI generation failed')
    } finally {
      setBusy(false)
    }
  }

  const saveDraft = async () => {
    if (!headers) return
    setBusy(true)
    setMessage('')
    try {
      const payload = {
        to: to.split(',').map((value) => value.trim()).filter(Boolean),
        cc: cc.split(',').map((value) => value.trim()).filter(Boolean),
        subject,
        body,
        threadId: email?.threadId || undefined,
        inReplyTo: email?.messageIdHeader || undefined,
        references: [email?.references, email?.messageIdHeader].filter(Boolean).join(' ') || undefined,
      }
      const response = draftId
        ? await fetch(`${backendBaseUrl}/emails/drafts/${draftId}`, {
            method: 'PATCH', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
          })
        : await fetch(`${backendBaseUrl}/emails/drafts`, {
            method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
          })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || `Draft save failed (${response.status})`)
      setDraftId(data.draft.draftId)
      setMessage(`Saved to Gmail drafts${data.draft.draftId ? ` (${data.draft.draftId})` : ''}.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save draft')
    } finally {
      setBusy(false)
    }
  }

  const send = async () => {
    if (!headers) return
    setShowSendApproval(false)
    setBusy(true)
    setMessage('')
    try {
      const payload = {
        to: to.split(',').map((value) => value.trim()).filter(Boolean),
        cc: cc.split(',').map((value) => value.trim()).filter(Boolean),
        subject,
        body,
        threadId: email?.threadId || undefined,
        inReplyTo: email?.messageIdHeader || undefined,
        references: [email?.references, email?.messageIdHeader].filter(Boolean).join(' ') || undefined,
      }
      const response = draftId
        ? await fetch(`${backendBaseUrl}/emails/drafts/${draftId}/send`, {
            method: 'POST', headers,
          })
        : await fetch(`${backendBaseUrl}/emails/send`, {
            method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
          })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || `Send failed (${response.status})`)
      setMessage(`Email sent successfully${data?.result?.messageId ? ` (${data.result.messageId})` : ''}.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not send email')
    } finally {
      setBusy(false)
    }
  }

  if (!token) {
    return <main style={{ padding: 40 }}>Please sign in with Google to compose email.</main>
  }

  return (
    <main style={{ minHeight: '100vh', padding: '32px 20px 80px', background: '#f7f7f7' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32 }}>{mode === 'compose' ? 'Compose email' : mode === 'forward' ? 'Forward email' : mode === 'replyAll' ? 'Reply all' : 'Reply'}</h1>
            <p style={{ margin: '8px 0 0', color: '#666' }}>Write, save to Gmail drafts, or send after confirmation.</p>
          </div>
          <Link href="/emails" style={{ textDecoration: 'none' }}>Back to emails</Link>
        </div>

        {email && (
          <section style={{ background: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, border: '1px solid #e5e5e5' }}>
            <div style={{ fontWeight: 700 }}>{email.subject || '(No subject)'}</div>
            <div style={{ color: '#666', marginTop: 6 }}>{email.from} · {email.date}</div>
            <details style={{ marginTop: 14 }}>
              <summary>Read full email</summary>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.6 }}>{email.body}</pre>
            </details>
          </section>
        )}

        <section style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e5e5e5' }}>
          {mode === 'compose' && (
            <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
              <label>What should the email say?</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <input value={instruction} onChange={(e) => setInstruction(e.target.value)} placeholder="e.g. Ask John to move tomorrow's meeting to Friday" style={{ flex: 1, padding: 12, border: '1px solid #ccc', borderRadius: 8 }} />
                <button onClick={generate} disabled={busy || !instruction.trim()} style={{ padding: '12px 16px' }}>Generate</button>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gap: 14 }}>
            <label>To<input value={to} onChange={(e) => setTo(e.target.value)} placeholder="name@example.com" style={{ display: 'block', width: '100%', marginTop: 6, padding: 12, border: '1px solid #ccc', borderRadius: 8 }} /></label>
            <label>CC<input value={cc} onChange={(e) => setCc(e.target.value)} placeholder="Optional" style={{ display: 'block', width: '100%', marginTop: 6, padding: 12, border: '1px solid #ccc', borderRadius: 8 }} /></label>
            <label>Subject<input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" style={{ display: 'block', width: '100%', marginTop: 6, padding: 12, border: '1px solid #ccc', borderRadius: 8 }} /></label>
            <label>Message<textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your message..." rows={14} style={{ display: 'block', width: '100%', marginTop: 6, padding: 12, border: '1px solid #ccc', borderRadius: 8, resize: 'vertical' }} /></label>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
            <button onClick={saveDraft} disabled={busy || !to.trim() || !subject.trim() || !body.trim()} style={{ padding: '12px 18px' }}>{draftId ? 'Update draft' : 'Save draft'}</button>
            <button onClick={() => setShowSendApproval(true)} disabled={busy || !to.trim() || !subject.trim() || !body.trim()} style={{ padding: '12px 18px', background: '#0a6f50', color: '#fff', border: 0, borderRadius: 8 }}>Send email</button>
          </div>

          {message && <p style={{ marginTop: 16 }}>{message}</p>}
        </section>
      </div>

      {showSendApproval && (
        <div onClick={() => setShowSendApproval(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'grid', placeItems: 'center', padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 520, width: '100%' }}>
            <h2 style={{ marginTop: 0 }}>Send this email?</h2>
            <p style={{ color: '#555' }}>This will send the message through your connected Gmail account. Review the recipient, subject, and message before confirming.</p>
            <div style={{ background: '#f6f6f6', padding: 14, borderRadius: 10 }}>
              <strong>To:</strong> {to}<br />
              <strong>Subject:</strong> {subject}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
              <button onClick={() => setShowSendApproval(false)} style={{ padding: '10px 16px' }}>Cancel</button>
              <button onClick={send} disabled={busy} style={{ padding: '10px 16px', background: '#0a6f50', color: '#fff', border: 0, borderRadius: 8 }}>Confirm & Send</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
