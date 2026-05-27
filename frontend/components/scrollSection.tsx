
'use client'

import React, { useRef, useEffect, ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface ScrollSectionProps {
  children: ReactNode
  id: string
  color: string
  className?: string
}

const ScrollSection = ({ children, id, color, className = '' }: ScrollSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => {
        gsap.to('body', {
          backgroundColor: color,
          duration: 0.8,
          ease: 'power2.inOut',
          overwrite: true
        })
      },
      onEnterBack: () => {
        gsap.to('body', {
          backgroundColor: color,
          duration: 0.8,
          ease: 'power2.inOut',
          overwrite: true
        })
      }
    })

    return () => {
      trigger.kill()
    }
  }, [color])

  return (
    <section 
      ref={sectionRef} 
      id={id}
      className={`scroll-section ${className}`}
    >
      {children}
    </section>
  )
}

export default ScrollSection