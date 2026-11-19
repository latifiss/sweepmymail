import React from 'react';

interface CloseIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

const CloseIcon: React.FC<CloseIconProps> = ({
  size = 16,
  className,
  style,
  'aria-label': ariaLabel = 'Close',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      role="img"
      aria-label={ariaLabel}
    >
      <path
        d="M16 1.6L14.4 0L8 6.4L1.6 0L0 1.6L6.4 8L0 14.4L1.6 16L8 9.6L14.4 16L16 14.4L9.6 8L16 1.6Z"
        fill="#544145"
      />
    </svg>
  );
};

export default CloseIcon;