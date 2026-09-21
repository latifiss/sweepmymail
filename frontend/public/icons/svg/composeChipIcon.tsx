import React, { SVGProps } from 'react';

interface ComposeChipIconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number;
}

const ComposeChipIcon: React.FC<ComposeChipIconProps> = ({ size = 22, className, ...props }) => {
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
      <rect width="22" height="22" fill="#D9A30F" />
      <g clipPath="url(#clip0_405_2249)">
        <path
          d="M5.4 6.8V16.6H15.2V12.4L16.6 11V18H4V5.4H11L9.6 6.8H5.4ZM12.61 6.59L15.41 9.39L9.6 15.2H6.8V12.4L12.61 6.59ZM13.59 5.61L15.2 4L18 6.8L16.39 8.41L13.59 5.61Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_405_2249">
          <rect width="14" height="14" fill="white" transform="translate(4 4)" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default ComposeChipIcon;