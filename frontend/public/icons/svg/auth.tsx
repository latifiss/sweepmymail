import React from 'react';

interface AuthIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

const AuthIcon: React.FC<AuthIconProps> = ({
  size = 13,
  className,
  style,
  'aria-label': ariaLabel = 'Auth',
}) => {
  const height = (size * 14) / 13;

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 13 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      role="img"
      aria-label={ariaLabel}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.06347 3.94319C11.7173 -0.298224 15.283 5.97556 9.82431 6.99172C15.283 8.05209 11.6733 14.2817 8.06347 10.0402C9.91236 15.342 2.73682 15.2978 4.58575 10.0402C0.931923 14.2817 -2.63384 8.05209 2.82486 6.99172C-2.67786 5.97556 0.931923 -0.254044 4.58575 3.94319C2.6928 -1.3144 9.91236 -1.3144 8.06347 3.94319ZM6.30256 6.19646C6.74282 6.19646 7.13899 6.54992 7.13899 6.99172C7.13899 7.43353 6.74282 7.83119 6.30256 7.83119C5.86237 7.83119 5.51016 7.43353 5.51016 6.99172C5.51016 6.54992 5.86237 6.19646 6.30256 6.19646Z"
        fill="#EB5757"
      />
    </svg>
  );
};

export default AuthIcon;