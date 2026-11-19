import React, { SVGProps } from 'react';

interface ForwardChipIconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number;
}

const ForwardChipIcon: React.FC<ForwardChipIconProps> = ({ size = 22, className, ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <rect width="22" height="22" fill="#5013E8" />
      <path
        d="M11.5832 9.24992H9.83317C7.25484 9.24992 5.1665 11.3383 5.1665 13.9166V15.6666L6.27484 14.2841C6.65775 13.8056 7.1433 13.4193 7.69561 13.1538C8.24791 12.8882 8.85284 12.7502 9.46567 12.7499H11.589V15.6666L16.839 10.9999L11.5832 6.33325V9.24992Z"
        fill="white"
      />
    </svg>
  );
};

export default ForwardChipIcon;