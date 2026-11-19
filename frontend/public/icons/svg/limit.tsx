import React from 'react';

interface LimitIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

const LimitIcon: React.FC<LimitIconProps> = ({
  size = 16,
  className,
  style,
  'aria-label': ariaLabel = 'Limit',
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
        d="M2.03564 5.79883L7.99977 0L13.9639 5.79883V14H2.03564V5.79883Z"
        fill="#F09797"
      />
    </svg>
  );
};

export default LimitIcon;