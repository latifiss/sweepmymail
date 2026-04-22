'use client';

import { ButtonHTMLAttributes } from "react";
import Image from "next/image";

type ActionType = 'keep' | 'rollup' | 'trash' | 'unsubscribe';

interface ActionButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  type: ActionType;
}

const ICONS: Record<ActionType, string> = {
  keep: '/icons/inbox.svg',
  rollup: '/icons/rollup.svg',
  trash: '/icons/delete.svg',
  unsubscribe: '/icons/unsubscribe.svg'
};

const LABELS: Record<ActionType, string> = {
  keep: 'Keep',
  rollup: 'Rollup',
  trash: 'Delete',
  unsubscribe: 'Unsubscribe'
};

const BG_COLORS: Record<ActionType, string> = {
  keep: '#d4edda',          
  rollup: '#d1ecf1',        
  trash: '#f8d7da',         
  unsubscribe: '#fff3cd'    
};

export function ActionButton({ type, className, ...props }: ActionButtonProps) {
  return (
    <button
      {...props}
      style={{ backgroundColor: BG_COLORS[type], color: '#000' }}
      className={`action-btn ${className || ""}`.trim()}
    >
      <Image 
        src={ICONS[type]} 
        alt={LABELS[type]} 
        width={20} 
        height={20} 
        className="action-btn__icon" 
      />
      <span className="action-btn__text">{LABELS[type]}</span>
    </button>
  );
}
