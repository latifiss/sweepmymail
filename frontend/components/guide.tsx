'use client'

import React, { useState } from 'react'
import Image from 'next/image'

const Guide = () => {
  const [isVisible, setIsVisible] = useState(true)

  const handleHide = () => {
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className='guide'>
      <div className='guide__header'>
        <div className='guide__header__left'>
          <div className='guide__header__left__title'>Here&apos;s a quick guide</div>
          <div className='guide__header__left__subtitle'>This page shows all the emails you can unsubscribe from</div>
        </div>
        <div className='guide__header__right' onClick={handleHide} style={{ cursor: 'pointer' }}>
          Hide
        </div>
      </div>
      <div className='guide__content'>
        <div className='guide__content__text'>Here&apos;s what each button does</div>
        <div className='guide__content__item'>
          <div className='button keep'>
            <Image 
              src='/icons/inbox.svg' 
              alt='keep' 
              width={20} 
              height={20} 
              className="action-btn__icon" 
            />
            <span className="action-btn__text">Keep</span>
          </div>
          <p className='guide__content__item__text'>Emails are kept just as it is when you use this button</p>
        </div>
        <div className='guide__content__item'>
          <div className='button unsubscribe'>
            <Image 
              src='/icons/unsubscribe.svg' 
              alt='unsubscribe' 
              width={20} 
              height={20} 
              className="action-btn__icon" 
            />
            <span className="action-btn__text">Unsubscribe</span>
          </div>
          <p className='guide__content__item__text'>We&apos;ll follow the link to unsubscribe from that email</p>
        </div>
        <div className='guide__content__item'>
          <div className='button delete'>
            <Image 
              src='/icons/delete.svg' 
              alt='delete' 
              width={20} 
              height={20} 
              className="action-btn__icon" 
            />
            <span className="action-btn__text">Delete</span>
          </div>
          <p className='guide__content__item__text'>This deletes the email from your account. It does not unsubscribe</p>
        </div>
        <div className='guide__content__item'>
          <div className='button rollup'>
            <Image 
              src='/icons/rollup.svg' 
              alt='rolluip' 
              width={20} 
              height={20} 
              className="action-btn__icon" 
            />
            <span className="action-btn__text">Rollup</span>
          </div>
          <p className='guide__content__item__text'>This action saves the email at a designated place</p>
        </div>
      </div>
    </div>
  )
}

export default Guide