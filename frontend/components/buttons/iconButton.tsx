'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ButtonHTMLAttributes } from 'react'

type ButtonIconProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: string
  text: string
  iconSize?: number
  href?: string
}

export default function ButtonIcon({
  icon,
  text,
  iconSize = 20,
  className,
  href,
  ...props
}: ButtonIconProps) {
  if (href) {
    return (
      <Link href={href} className={`btn-icon ${className || ''}`.trim()}>
        <Image
          src={icon}
          alt={text}
          width={iconSize}
          height={iconSize}
          style={{ width: iconSize, height: iconSize }}
          className="btn-icon__icon"
        />

        <span className="btn-icon__text">{text}</span>
      </Link>
    )
  }

  return (
    <button
      className={`btn-icon ${className || ''}`.trim()}
      {...props}
    >
      <Image
        src={icon}
        alt={text}
        width={iconSize}
        height={iconSize}
        style={{ width: iconSize, height: iconSize }}
        className="btn-icon__icon"
      />

      <span className="btn-icon__text">{text}</span>
    </button>
  )
}
