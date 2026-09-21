import React from 'react';

interface CupboardIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

const CupboardIcon: React.FC<CupboardIconProps> = ({
  size = 14,
  className,
  style,
  'aria-label': ariaLabel = 'Cupboard',
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
        d="M7 0C5.1423 0 3.63636 1.50595 3.63636 3.36364C3.63636 3.51426 3.51426 3.63636 3.36364 3.63636C1.50595 3.63636 0 5.1423 0 7C0 8.8577 1.50595 10.3637 3.36364 10.3637C3.51426 10.3637 3.63636 10.4857 3.63636 10.6363C3.63636 12.494 5.1423 14 7 14C8.8577 14 10.3637 12.494 10.3637 10.6363C10.3637 10.4857 10.4857 10.3637 10.6363 10.3637C12.494 10.3637 14 8.8577 14 7C14 5.1423 12.494 3.63636 10.6363 3.63636C10.4857 3.63636 10.3637 3.51426 10.3637 3.36364C10.3637 1.50595 8.8577 0 7 0Z"
        fill="#6FCF97"
      />
    </svg>
  );
};

export default CupboardIcon;