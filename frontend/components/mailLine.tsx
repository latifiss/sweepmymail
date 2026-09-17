'use client'

import Link from 'next/link'
import React from 'react'

type MailLineProps = {
  date: string
  content: string
  messageId?: string
}

const MailLine = ({ date, content, messageId }: MailLineProps) => {
  const contentBlock = (
    <div className='mail'>
      <p className='mail__date'>{date}</p>
      <p className='mail__content'>{content}</p>
    </div>
  )

  return messageId ? <Link href={`/compose?messageId=${encodeURIComponent(messageId)}&mode=reply`} style={{ textDecoration: 'none' }}>{contentBlock}</Link> : contentBlock
}

export default MailLine
