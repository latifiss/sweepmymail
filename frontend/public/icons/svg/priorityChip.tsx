import React, { SVGProps } from 'react';

interface PriorityChipIconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number;
}

const PriorityChipIcon: React.FC<PriorityChipIconProps> = ({ size = 22, className, ...props }) => {
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
      <rect width="22" height="22" fill="#AD44E9" />
      <path
        d="M11 4L13.0161 8.22507L17.6574 8.83688L14.2621 12.0599L15.1145 16.6631L11 14.43L6.8855 16.6631L7.73788 12.0599L4.3426 8.83688L8.9839 8.22507L11 4Z"
        fill="white"
      />
    </svg>
  );
};

export default PriorityChipIcon;