import React, { SVGProps } from 'react';

interface SaveChipIconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number;
}

const SaveChipIcon: React.FC<SaveChipIconProps> = ({ size = 22, className, ...props }) => {
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
      <rect width="22" height="22" fill="#E624A6" />
      <path
        d="M16.2131 8.00996L13.99 5.78691C13.826 5.62285 13.6031 5.53125 13.3707 5.53125H5.96875C5.72676 5.53125 5.53125 5.72676 5.53125 5.96875V16.0312C5.53125 16.2732 5.72676 16.4688 5.96875 16.4688H16.0312C16.2732 16.4688 16.4688 16.2732 16.4688 16.0312V8.62793C16.4688 8.39551 16.3771 8.17402 16.2131 8.00996ZM9.25 6.40625H12.75V7.9375H9.25V6.40625ZM11 13.9805C9.91309 13.9805 9.03125 13.0986 9.03125 12.0117C9.03125 10.9248 9.91309 10.043 11 10.043C12.0869 10.043 12.9688 10.9248 12.9688 12.0117C12.9688 13.0986 12.0869 13.9805 11 13.9805ZM11 10.918C10.3957 10.918 9.90625 11.4074 9.90625 12.0117C9.90625 12.616 10.3957 13.1055 11 13.1055C11.6043 13.1055 12.0938 12.616 12.0938 12.0117C12.0938 11.4074 11.6043 10.918 11 10.918Z"
        fill="white"
      />
    </svg>
  );
};

export default SaveChipIcon;