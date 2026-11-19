import React, { SVGProps } from 'react';

interface SummaryChipIconProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number;
}

const SummaryChipIcon: React.FC<SummaryChipIconProps> = ({ size = 22, className, ...props }) => {
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
      <rect width="22" height="22" fill="#FF591E" />
      <path
        d="M17.9735 4.89819V6.64159H4.02637V4.89819H17.9735ZM12.7433 8.38499V10.1284H4.02637V8.38499H12.7433ZM17.9735 8.38499V10.1284H14.4867V8.38499H17.9735ZM9.25656 11.8718V13.6152H4.02637V11.8718H9.25656ZM17.9735 11.8718V13.6152H11V11.8718H17.9735ZM14.4867 15.3586V17.102H4.02637V15.3586H14.4867Z"
        fill="white"
      />
    </svg>
  );
};

export default SummaryChipIcon;