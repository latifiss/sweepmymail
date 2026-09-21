import React, { SVGProps } from 'react';

interface CategorizeChipIconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number;
}

const CategorizeChipIcon: React.FC<CategorizeChipIconProps> = ({ size = 22, className, ...props }) => {
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
      <rect width="22" height="22" fill="#162550" />
      <path d="M11.0002 3.73584L7.00488 10.2736H14.9954L11.0002 3.73584Z" fill="white" />
      <path
        d="M14.9954 18.2641C16.8008 18.2641 18.2643 16.8005 18.2643 14.9952C18.2643 13.1898 16.8008 11.7263 14.9954 11.7263C13.1901 11.7263 11.7266 13.1898 11.7266 14.9952C11.7266 16.8005 13.1901 18.2641 14.9954 18.2641Z"
        fill="white"
      />
      <path d="M4.46289 12.0896H10.2742V17.9009H4.46289V12.0896Z" fill="white" />
    </svg>
  );
};

export default CategorizeChipIcon;