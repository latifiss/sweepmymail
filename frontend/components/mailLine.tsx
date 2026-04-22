'use client'

import React from 'react';

type MailLineProps = {
  date: string
  content: string
}

const MailLine = ({ date, content }: MailLineProps) => {
  return (
      <div className='mail'>
          <p className='mail__date'>{date}</p>
          <p className='mail__content'>{content}</p>
    </div>
  )
}

export default MailLine