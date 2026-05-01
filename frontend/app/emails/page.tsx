'use client'

import Cell from '@/components/cell'
import Guide from '@/components/guide'
import LoadingModal from '@/components/loader'
import { useAppSelector } from '@/store/app/hooks'
import { selectAuthToken } from '@/store/features/auth/authSlice'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

type GroupedEmailExample = {
  subject: string
  snippet: string
  messageId: string
  date: string
}

type GroupedEmailSender = {
  key: string
  sender: string
  count: number
  examples: GroupedEmailExample[]
}

type GroupedEmailsResponse = {
  ok: boolean
  groups: GroupedEmailSender[]
}

type ActionType = 'keep' | 'trash' | 'rollup' | 'unsubscribe'

const ACTION_COLORS: Record<ActionType, string> = {
  keep: '#0a6f50',
  trash: '#dc3545',
  rollup: '#0b7285',
  unsubscribe: '#b08900',
}

const parseSender = (senderRaw: string) => {
  const match = senderRaw.match(/^(.*?)(?:\s*<([^>]+)>)?$/)
  const senderName = match?.[1]?.trim().replace(/^"|"$/g, '') || senderRaw
  const senderEmail = match?.[2]?.trim() || senderRaw
  return { senderName, senderEmail }
}

const EmailsPage = () => {
  const token = useAppSelector(selectAuthToken)
  const backendBaseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_BACKEND_URL || ' ',
    []
  )
  const [groups, setGroups] = useState<GroupedEmailSender[]>([])
  const [loading, setLoading] = useState<{ open: boolean; message: string; color: string }>({
    open: false,
    message: '',
    color: ACTION_COLORS.keep,
  })
  const [done, setDone] = useState<{ open: boolean; message: string; color: string }>({
    open: false,
    message: '',
    color: ACTION_COLORS.keep,
  })

  const headers = useMemo(() => {
    if (!token) return null
    return { Authorization: `Bearer ${token}` }
  }, [token])

  const refreshGroups = useCallback(async () => {
    if (!headers) return

    // Pull fresh Gmail messages into DB first, then fetch grouped senders.
    await fetch(`${backendBaseUrl}/emails`, { headers })
    const response = await fetch(`${backendBaseUrl}/emails/grouped`, { headers })
    if (!response.ok) {
      throw new Error(`Failed to fetch grouped emails (${response.status})`)
    }
    const data = (await response.json()) as GroupedEmailsResponse
    setGroups(data.groups || [])
  }, [backendBaseUrl, headers])

  useEffect(() => {
    const fetchGroupedEmails = async () => {
      if (!headers) return

      try {
        await refreshGroups()
      } catch (error) {
        console.error('Failed loading emails page data:', error)
      }
    }

    fetchGroupedEmails()
  }, [headers, refreshGroups])

  const runAction = async (type: ActionType, senderQuery: string) => {
    if (!headers) return

    const color = ACTION_COLORS[type]

    const senderPretty = senderQuery
    const actionMessage =
      type === 'keep'
        ? 'Keeping emails...'
        : type === 'trash'
          ? 'Deleting emails...'
          : type === 'rollup'
            ? 'Rolling up emails...'
            : 'Unsubscribing...'

    setDone({ open: false, message: '', color })
    setLoading({ open: true, message: actionMessage, color })

    try {
      if (type === 'keep') {
        setDone({ open: true, message: `Kept emails from ${senderPretty}`, color })
        return
      }

      if (type === 'trash') {
        const bySenderResp = await fetch(
          `${backendBaseUrl}/emails/by-sender?sender=${encodeURIComponent(senderQuery)}`,
          { headers }
        )
        if (!bySenderResp.ok) {
          throw new Error(`Failed to load sender emails (${bySenderResp.status})`)
        }

        const bySenderData = (await bySenderResp.json()) as {
          ok: boolean
          count: number
          messages: Array<{ message_id: string }>
        }

        const messageIds = (bySenderData.messages || [])
          .map((m) => m.message_id)
          .filter(Boolean)

        const deleteResp = await fetch(`${backendBaseUrl}/emails/delete`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageIds }),
        })
        if (!deleteResp.ok) {
          throw new Error(`Delete failed (${deleteResp.status})`)
        }

        const deleteData = (await deleteResp.json()) as { ok: boolean; result?: { deleted?: number } }
        const deletedCount = deleteData?.result?.deleted ?? messageIds.length
        await refreshGroups()
        setDone({ open: true, message: `Deleted ${deletedCount} emails from ${senderPretty}`, color })
        return
      }

      if (type === 'rollup') {
        const rollupResp = await fetch(`${backendBaseUrl}/emails/rollup`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ sender: senderQuery }),
        })
        if (!rollupResp.ok) {
          throw new Error(`Rollup failed (${rollupResp.status})`)
        }

        const rollupData = (await rollupResp.json()) as {
          ok: boolean
          labeledCount?: number
          archivedCount?: number
          labelName?: string
        }

        await refreshGroups()
        setDone({
          open: true,
          message: `Rolled up ${rollupData.labeledCount ?? rollupData.archivedCount ?? 0} emails from ${senderPretty}`,
          color,
        })
        return
      }

      if (type === 'unsubscribe') {
        const unsubResp = await fetch(`${backendBaseUrl}/emails/unsubscribe`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ sender: senderQuery }),
        })
        if (!unsubResp.ok) {
          throw new Error(`Unsubscribe failed (${unsubResp.status})`)
        }

        const unsubData = (await unsubResp.json()) as { ok: boolean; result?: { success?: boolean; message?: string } }
        setDone({
          open: true,
          message: unsubData?.result?.success
            ? `Unsubscribed from ${senderPretty}`
            : `Could not unsubscribe from ${senderPretty}`,
          color,
        })
        return
      }
    } catch (error) {
      console.error('Action failed:', error)
      setDone({
        open: true,
        message: error instanceof Error ? error.message : 'Action failed',
        color,
      })
    } finally {
      setLoading((prev) => ({ ...prev, open: false }))
    }
  }

  return (
      <div className='emails'>
          <LoadingModal isOpen={loading.open} message={loading.message} color={loading.color} />
          {done.open && (
            <div
              className="loading-modal-overlay loading-modal-overlay--open"
              style={
                {
                  '--loading-color': done.color,
                  '--shadow-color': done.color,
                } as React.CSSProperties
              }
              onClick={() => setDone((prev) => ({ ...prev, open: false }))}
            >
              <div className="loading-modal" onClick={(e) => e.stopPropagation()}>
                <div className="loading-modal__content">
                  <p className="loading-modal__message">{done.message}</p>
                </div>
              </div>
            </div>
          )}
          <div className='emails__content'>
              <Guide />
              <div className='emails__content__right'>
              <div className='emails__content__header'>
                  <p className='emails__content__header__title'>Your subscriptions</p>
              </div>
              <div className='emails__content_body'>
                  {groups.length === 0 && (
                    <p className='emails__content__header__title'>No emails yet</p>
                  )}
                  {groups.map((group) => {
                    const { senderName, senderEmail } = parseSender(group.sender)
                    const lastThree = [...(group.examples || [])]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 3)

                    return (
                      <Cell
                        key={group.key}
                        count={group.count}
                        senderName={senderName}
                        senderEmail={senderEmail}
                        senderQuery={senderEmail}
                        lastEmails={lastThree}
                        onKeep={(sender) => runAction('keep', sender)}
                        onTrash={(sender) => runAction('trash', sender)}
                        onRollup={(sender) => runAction('rollup', sender)}
                        onUnsubscribe={(sender) => runAction('unsubscribe', sender)}
                      />
                    )
                  })}
              </div>
              </div>
              </div>
    </div>
  )
}

export default EmailsPage