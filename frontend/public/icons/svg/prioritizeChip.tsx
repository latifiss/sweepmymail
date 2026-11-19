import React, { SVGProps } from 'react';

interface PrioritizeChipIconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number;
}

const PrioritizeChipIcon: React.FC<PrioritizeChipIconProps> = ({ size = 22, className, ...props }) => {
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
      <rect width="22" height="22" fill="#5E44E9" />
      <path
        d="M11.0175 4.28834C10.8828 4.28445 10.7505 4.32528 10.6414 4.40445L4.22539 9.06594C4.12123 9.14171 4.04371 9.24849 4.00394 9.371C3.96417 9.49351 3.96418 9.62546 4.00398 9.74796L6.45467 17.2906C6.4945 17.4131 6.57208 17.5199 6.67631 17.5956C6.78053 17.6713 6.90605 17.7121 7.03488 17.7121H14.9652C15.0941 17.7121 15.2196 17.6713 15.3238 17.5956C15.428 17.5199 15.5056 17.4131 15.5454 17.2906L17.9963 9.74796C18.0361 9.62546 18.0361 9.49351 17.9964 9.371C17.9566 9.24849 17.8791 9.14171 17.7749 9.06594L11.3587 4.40445C11.2592 4.33228 11.1403 4.29181 11.0175 4.28834Z"
        fill="white"
      />
    </svg>
  );
};

export default PrioritizeChipIcon;