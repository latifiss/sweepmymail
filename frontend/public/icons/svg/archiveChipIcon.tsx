import React, { SVGProps } from 'react';

interface ArchiveChipIconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number;
}

const ArchiveChipIcon: React.FC<ArchiveChipIconProps> = ({ size = 22, className, ...props }) => {
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
      <rect width="22" height="22" fill="#099126" />
      <path
        d="M18.1998 6.19995V7.79995H3.7998V6.19995H18.1998ZM4.5998 8.59995H17.3998V16.6H4.5998V8.59995ZM13.3998 11V10.2H8.5998V11H13.3998Z"
        fill="white"
      />
    </svg>
  );
};

export default ArchiveChipIcon;