import React, { SVGProps } from 'react';

interface ReplyChipIconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number;
}

const ReplyChipIcon: React.FC<ReplyChipIconProps> = ({ size = 22, className, ...props }) => {
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
      <rect width="22" height="22" fill="#FFC130" />
      <path
        d="M9.18071 14.4125L5.18371 11.5425C5.08978 11.4867 5.01198 11.4074 4.95794 11.3124C4.9039 11.2175 4.87549 11.1101 4.87549 11.0008C4.87549 10.8916 4.9039 10.7842 4.95794 10.6892C5.01198 10.5943 5.08978 10.515 5.18371 10.4592L9.18071 7.58746C9.27599 7.53142 9.3844 7.50159 9.49494 7.50099C9.60548 7.50039 9.71421 7.52904 9.81009 7.58405C9.90597 7.63906 9.98559 7.71845 10.0409 7.81418C10.0961 7.9099 10.1251 8.01855 10.1248 8.12909V9.24996C11.4373 9.24996 15.3748 9.24996 16.2498 16.25C14.0623 12.3125 10.1248 12.75 10.1248 12.75V13.8708C10.1248 14.3608 9.59458 14.6566 9.18071 14.4133V14.4125Z"
        fill="white"
      />
    </svg>
  );
};

export default ReplyChipIcon;