import React, { SVGProps } from 'react';

interface GeneralChipIconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number;
}

const GeneralChipIcon: React.FC<GeneralChipIconProps> = ({ size = 22, className, ...props }) => {
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
      <rect width="22" height="22" fill="#1DDDDA" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.82798 11L4 9.36593L6.08438 5.75688L8.914 7.38812L8.9156 4.1228H13.0844L13.086 7.38812L15.9156 5.75688L18 9.36593L15.172 11L18 12.6341L15.9156 16.2431L13.086 14.6119L13.0844 17.8772H8.9156L8.914 14.6119L6.08438 16.2431L4 12.6341L6.82798 11Z"
        fill="white"
      />
    </svg>
  );
};

export default GeneralChipIcon;