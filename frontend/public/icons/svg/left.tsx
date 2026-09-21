import React from 'react';

interface LeftIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

const LeftIcon: React.FC<LeftIconProps> = ({
  size = 11,
  className,
  style,
  'aria-label': ariaLabel = 'Left',
}) => {
  const height = (size * 16) / 11;

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 11 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      role="img"
      aria-label={ariaLabel}
    >
      <path
        d="M-1.04904e-05 8L10.5088 16V0L-1.04904e-05 8Z"
        fill="#544145"
      />
    </svg>
  );
};

export default LeftIcon;