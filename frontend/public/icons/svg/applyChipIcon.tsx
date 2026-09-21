import React, { SVGProps } from 'react';

interface ApplyChipIconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number;
}

const ApplyChipIcon: React.FC<ApplyChipIconProps> = ({ size = 22, className, ...props }) => {
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
      <rect width="22" height="22" fill="#38A808" />
      <g clipPath="url(#clip0_405_2242)">
        <path d="M16.25 4.4375L8.1125 13.3863L5.75 11.597H4.4375L8.1125 17.5625L17.5625 4.4375H16.25Z" fill="white" />
      </g>
      <defs>
        <clipPath id="clip0_405_2242">
          <rect width="14" height="14" fill="white" transform="translate(4 4)" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default ApplyChipIcon;