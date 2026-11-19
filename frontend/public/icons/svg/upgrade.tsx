import React from 'react';

interface UpgradeIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

const UpgradeIcon: React.FC<UpgradeIconProps> = ({
  size = 14,
  className,
  style,
  'aria-label': ariaLabel = 'Upgrade',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      role="img"
      aria-label={ariaLabel}
    >
      <path
        d="M0.0281997 0H13.4692C13.8574 3.11366 10.109 3.86235 10.109 7C10.109 10.1377 13.8574 10.8863 13.4692 14H0.0281997C-0.360017 10.8863 3.38843 10.1377 3.38843 7C3.38843 3.86235 -0.360017 3.11366 0.0281997 0Z"
        fill="#50B0A1"
      />
    </svg>
  );
};

export default UpgradeIcon;