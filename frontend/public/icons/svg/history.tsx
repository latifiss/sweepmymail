import React from 'react';

interface HistoryIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

const HistoryIcon: React.FC<HistoryIconProps> = ({
  size = 14,
  className,
  style,
  'aria-label': ariaLabel = 'History',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      role="img"
      aria-label={ariaLabel}
    >
      <path
        d="M10.7805 2.15654C8.78458 2.25935 8.23704 0.509376 6.55546 0.0996704C4.76467 -0.336847 3.95641 0.749193 3.76503 1.63716C3.6175 2.32166 3.30741 2.61879 2.49014 2.80911C1.90762 2.91598 1.39146 3.21871 1.52665 4.04906C1.66186 4.87941 1.38782 5.3752 0.979877 5.67224C0.571938 5.96932 0.191344 6.39107 0.057485 6.9405C-0.169241 7.87054 0.291663 8.8447 1.14113 9.2766C2.09569 9.75163 2.60836 10.2716 2.54131 11.3501C2.52455 11.6197 2.63704 13.0538 4.00185 12.6203C4.34655 12.5108 5.7725 11.7725 6.63784 13.1428C6.8533 13.484 7.38684 13.8198 7.87438 13.9387C9.18182 14.2573 10.5185 13.2935 10.6513 11.9664C10.7952 10.9844 10.9739 10.524 12.0354 10.867C13.0857 11.2063 13.7143 9.7444 13.1266 8.99442C12.3109 8.14916 13.2842 6.62901 13.5933 5.36058C14.0158 3.62678 12.5227 1.96771 10.7805 2.15654Z"
        fill="#F2C94C"
      />
    </svg>
  );
};

export default HistoryIcon;