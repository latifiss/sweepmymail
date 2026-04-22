'use client'

import Image from 'next/image'
import React, { useState } from 'react'
import { ActionsRow } from './actionsRow'
import MailLine from './mailLine'
import SpotRow from './spotRow'

type CellEmail = {
  messageId: string
  subject: string
  snippet: string
  date: string
}

type CellProps = {
  count?: number
  senderName?: string
  senderEmail?: string
  senderQuery?: string
  lastEmails?: CellEmail[]
  onKeep?: (senderQuery: string) => void
  onRollup?: (senderQuery: string) => void
  onTrash?: (senderQuery: string) => void
  onUnsubscribe?: (senderQuery: string) => void
}

const Cell = ({
  count = 0,
  senderName = '',
  senderEmail = '',
  senderQuery = '',
  lastEmails = [],
  onKeep,
  onRollup,
  onTrash,
  onUnsubscribe,
}: CellProps) => {
  const [open, setOpen] = useState(false)

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate)
    if (Number.isNaN(date.getTime())) return ''

    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  return (
    <div className={`cell ${open ? 'cell--open' : ''}`}>
      <div className="cell__side">
        <button
          type="button"
          className="cell__toggle"
          onClick={() => setOpen(prev => !prev)}
        >
          <Image
            src="/icons/up.svg"
            alt="toggle"
            width={24}
            height={24}
            className="cell__arrow"
          />
        </button>
      </div>

      <div className="cell__content">
        <div className="cell__info">
          <div className="cell__right">
            <p className="cell__right__count">{count}</p>
            <p className="cell__right__text">emails</p>
          </div>

          <div className="cell__wrapper">
            <div className="cell__top">
              <div className="cell__top__info">
                <Image src="/icons/sifted.png" width={20} height={20} alt="name" />
                <p className="cell__top__info__text">{senderName}</p>
              </div>
            </div>

            <div className="cell__bottom">{senderEmail}</div>
          </div>
        </div>

        <ActionsRow
          onKeep={() => onKeep?.(senderQuery || senderEmail)}
          onRollup={() => onRollup?.(senderQuery || senderEmail)}
          onTrash={() => onTrash?.(senderQuery || senderEmail)}
          onUnsubscribe={() => onUnsubscribe?.(senderQuery || senderEmail)}
        />

        <div className="cell__dropdown">
          <SpotRow />
          <div className="cell__dropdown_inner">
            {lastEmails.map((email) => (
              <MailLine
                key={email.messageId}
                date={formatDate(email.date)}
                content={email.subject || email.snippet || 'No subject'}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cell
