import React, { SVGProps } from 'react';

interface ImportantChipIconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number;
}

const ImportantChipIcon: React.FC<ImportantChipIconProps> = ({ size = 22, className, ...props }) => {
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
      <rect width="22" height="22" fill="#0F7109" />
      <path
        d="M5.3335 15.6599L12.6668 15.6666C13.1135 15.6666 13.5135 15.4466 13.7535 15.1066L16.6668 10.9999L13.7535 6.89325C13.5135 6.55325 13.1135 6.33325 12.6668 6.33325L5.3335 6.33992L8.56016 10.9999L5.3335 15.6599Z"
        fill="white"
      />
    </svg>
  );
};

export default ImportantChipIcon;