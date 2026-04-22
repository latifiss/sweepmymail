'use client'

import Image from 'next/image'
import React from 'react'

const GoogleButton = () => {
  return (
    <button className='btn btn-google'
        >
          <Image 
            src='/icons/google.svg'
            alt='google' 
            width={18} 
            height={18} 
            className="action-btn__icon" 
          />
          <span className="google-text">Continue with google</span>
        </button>
  )
}

export default GoogleButton