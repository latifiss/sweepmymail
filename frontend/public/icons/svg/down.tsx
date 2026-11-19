import React from 'react';

interface DownIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

const DownIcon: React.FC<DownIconProps> = ({
  size = 12,
  className,
  style,
  'aria-label': ariaLabel = 'Down',
}) => {
  const height = (size * 8) / 12;

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 12 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      role="img"
      aria-label={ariaLabel}
    >
      <path
        d="M6 7.8816L12 0L0 0L6 7.8816Z"
        fill="#544145"
      />
    </svg>
  );
};

export default DownIcon;