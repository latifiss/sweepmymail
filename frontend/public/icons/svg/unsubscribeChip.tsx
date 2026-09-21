import React, { SVGProps } from 'react';

interface UnsubscribeChipIconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number;
}

const UnsubscribeChipIcon: React.FC<UnsubscribeChipIconProps> = ({ size = 22, className, ...props }) => {
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
      <rect width="22" height="22" fill="#F52D17" />
      <path
        d="M7.377 5C8.403 5 9.373 5.467 10.014 6.268L10.214 6.518L9.508 10.41L9.4 11H12.805L10.616 17.563L4.9 11.028C4.31973 10.3659 3.99988 9.51542 4 8.635V8.377C4 7.48136 4.35579 6.62241 4.9891 5.9891C5.62241 5.35579 6.48136 5 7.377 5Z"
        fill="white"
      />
      <path
        d="M14.6231 5C15.5187 5 16.3777 5.35579 17.011 5.9891C17.6443 6.62241 18.0001 7.48136 18.0001 8.377V8.635C18.0001 9.515 17.6801 10.365 17.1001 11.027L11.8521 17.025L14.1931 10H10.6001L11.0701 7.412L11.9861 6.268C12.3026 5.87258 12.7038 5.55334 13.1603 5.33386C13.6167 5.11438 14.1166 5.00029 14.6231 5Z"
        fill="white"
      />
    </svg>
  );
};

export default UnsubscribeChipIcon;