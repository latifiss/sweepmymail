'use client'

import Image from 'next/image';
import React from 'react';
import { useAppSelector } from '@/store/app/hooks';
import { selectCurrentUser } from '@/store/features/auth/authSlice';

const SpotRow = () => {
  const user = useAppSelector(selectCurrentUser)
  return (
      <div className='spot'>
          <div className='spot__left'>
              <Image src='/icons/right.svg' alt='icon' width={16} height={16} />
              <p className='spot__left__text'>{user?.email || '—'}</p>
          </div>
    </div>
  )
}

export default SpotRow