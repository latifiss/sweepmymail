'use client'

import Image from 'next/image'
import React from 'react'
import { UnreadTag } from './unread'
import { ActionsRow } from './actionsRow'
import MailLine from './mailLine'
import SpotRow from './spotRow'

const CellDisplay = () => {
  return (
    <div className="cell-display cell-display--open">
      <div className="cell-display__side">
        <div className="cell-display__toggle-placeholder">
          <Image
            src="/icons/up.svg"
            alt="toggle"
            width={24}
            height={24}
            className="cell-display__arrow"
          />
        </div>
      </div>

      <div className="cell-display__content">
        <div className="cell-display__info">
          <div className="cell-display__right">
            <p className="cell-display__right__count">108</p>
            <p className="cell-display__right__text">emails</p>
          </div>

          <div className="cell-display__wrapper">
            <div className="cell-display__top">
              <div className="cell-display__top__info">
                <Image src="/icons/sifted.png" width={20} height={20} alt="name" />
                <p className="cell-display__top__info__text">Valida Pau</p>
              </div>
              <UnreadTag />
            </div>

            <div className="cell-display__bottom">hello@theinformation.com</div>
          </div>
        </div>

        <ActionsRow />

        <div className="cell-display__dropdown">
          <SpotRow />
          <div className="cell-display__dropdown_inner">
            <MailLine
              date="12 months ago"
              content="Dealmaker: When Will We See a $100 Billion Startup Go Public?"
            />
            <MailLine
              date="12 months ago"
              content="Dealmaker: When Will We See a $100 Billion Startup Go Public?"
            />
            <MailLine
              date="12 months ago"
              content="Dealmaker: When Will We See a $100 Billion Startup Go Public?"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CellDisplay