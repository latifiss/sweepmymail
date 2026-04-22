'use client'

import Image from 'next/image';
import React from 'react';

const SpotRow = () => {
  return (
      <div className='spot'>
          <div className='spot__left'>
              <Image src='/icons/right.svg' alt='icon' width={16} height={16} />
              <p className='spot__left__text'>issakalatif49@gmail.com</p>
          </div>
          <div className='spot__right'>
              <p className='spot__right__text'>Mark as spam</p>
              <Image src='/icons/spam.svg' alt='icon' width={16} height={16}/>
          </div>
    </div>
  )
}

export default SpotRow