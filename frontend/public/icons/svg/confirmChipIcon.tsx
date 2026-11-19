import React, { SVGProps } from 'react';

interface ConfirmChipIconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number;
}

const ConfirmChipIcon: React.FC<ConfirmChipIconProps> = ({ size = 22, className, ...props }) => {
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
      <rect width="22" height="22" fill="#3186FF" />
      <path
        d="M13.1875 10.8223L14.1924 9.81738L14.8076 10.4326L13.1875 12.0527L12.0049 10.8701L12.6201 10.2549L13.1875 10.8223ZM7.5 14.5H11V15.375H7.5V14.5ZM11 8.375H7.5V7.5H11V8.375ZM11 11.875H7.5V11H11V11.875ZM14.8076 6.93262L13.1875 8.55273L12.0049 7.37012L12.6201 6.75488L13.1875 7.32227L14.1924 6.31738L14.8076 6.93262ZM11.8955 17.125L12.7705 18H5.75V4H16.25V12.7705L15.375 13.6455V4.875H6.625V17.125H11.8955ZM17.8701 13.9326L14.0625 17.7471L12.2236 15.9014L12.8389 15.2861L14.0625 16.5029L17.2549 13.3174L17.8701 13.9326Z"
        fill="white"
      />
    </svg>
  );
};

export default ConfirmChipIcon;