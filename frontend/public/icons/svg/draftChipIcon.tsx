import React, { SVGProps } from 'react';

interface DraftChipIconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number;
}

const DraftChipIcon: React.FC<DraftChipIconProps> = ({ size = 22, className, ...props }) => {
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
      <rect width="22" height="22" fill="#1B4AC0" />
      <path
        d="M6.9165 16.25V5.75H12.4582L15.0832 8.375V16.25H6.9165ZM12.1665 8.66667H14.4998L12.1665 6.33333V8.66667Z"
        fill="white"
      />
    </svg>
  );
};

export default DraftChipIcon;