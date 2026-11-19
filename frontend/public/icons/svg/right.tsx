import React from 'react';

interface RightIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

const RightIcon: React.FC<RightIconProps> = ({
  size = 11,
  className,
  style,
  'aria-label': ariaLabel = 'Right',
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
        d="M10.5088 8L0 16V0L10.5088 8Z"
        fill="#544145"
      />
    </svg>
  );
};

export default RightIcon;