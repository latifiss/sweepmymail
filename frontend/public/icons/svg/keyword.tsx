import React from 'react';

interface KeywordIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

const KeywordIcon: React.FC<KeywordIconProps> = ({
  size = 16,
  className,
  style,
  'aria-label': ariaLabel = 'Keyword',
}) => {
  const height = (size * 14) / 16;

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 16 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      role="img"
      aria-label={ariaLabel}
    >
      <path
        d="M11.6758 3.64699C11.6758 1.63261 10.0403 0 8.02322 0C6.0062 0 4.37069 1.63278 4.37069 3.64699C4.37069 5.02798 5.13986 6.22974 6.27431 6.84888L4.32422 14H11.6659L9.72272 6.87368C10.8836 6.26241 11.6758 5.04761 11.6758 3.64699Z"
        fill="#F2994A"
      />
    </svg>
  );
};

export default KeywordIcon;