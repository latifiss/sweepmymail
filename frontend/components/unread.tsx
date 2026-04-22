'use client';

import React from 'react';
import classNames from 'classnames';

type UnreadTagProps = {
  className?: string;
  text?: string;
};

export function UnreadTag({ className, text = 'Unread' }: UnreadTagProps) {
  return (
    <span
      className={classNames(
        'unread-tag',
        className
      )}
    >
      {text}
    </span>
  );
}
