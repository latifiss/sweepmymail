import React from 'react';

interface UpIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

const UpIcon: React.FC<UpIconProps> = ({
  size = 12,
  className,
  style,
  'aria-label': ariaLabel = 'Up',
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
        d="M6 -7.54108e-06L12 7.88159L0 7.88159L6 -7.54108e-06Z"
        fill="#544145"
      />
    </svg>
  );
};

export default UpIcon;