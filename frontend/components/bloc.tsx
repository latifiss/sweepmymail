'use client'

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

type BlocType = 'categorize' | 'summary' | 'list';

type BlocProps = {
  title: string;
  caption: string;
  type: BlocType;
}

const Bloc = ({title, caption, type}: BlocProps) => {
  const [imageError, setImageError] = useState(false);

  const iconMap: Record<BlocType, string> = {
    categorize: '/icons/categorize.svg',
    summary: '/icons/summary.svg',
    list: '/icons/list.svg'
  };

  const pathMap: Record<BlocType, string> = {
    categorize: '/categorization',
    summary: '/daily-summary',
    list: '/priority'
  };

  const iconSrc = iconMap[type];
  const navigateTo = pathMap[type];
  const fallbackIcon = '/icons/analytics.svg';

  return (
    <Link 
      href={navigateTo} 
      className="block no-underline hover:no-underline focus:no-underline active:no-underline"
      style={{ textDecoration: 'none' }}
    >
      <div className='bloc'>
        <div className='bloc__left'>
          <Image
            src={imageError ? fallbackIcon : iconSrc}
            alt={`${type} icon`}
            width={20}
            height={20}
            onError={() => setImageError(true)}
          />
          <div className='bloc__left__center'>
            <span className='bloc__left__center__title'>{title}</span>
            <p className='bloc__left__center__caption'>{caption}</p>
          </div>
        </div>
        <div className='bloc__right'>
          <Image
            src="/icons/forward.svg"
            alt="next"
            width={20}
            height={20}
          />
        </div>
      </div>
    </Link>
  )
}

export default Bloc;