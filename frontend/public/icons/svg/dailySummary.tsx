import React from 'react';

interface DailySummaryIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

const DailySummaryIcon: React.FC<DailySummaryIconProps> = ({
  size = 16,
  className,
  style,
  'aria-label': ariaLabel = 'Daily Summary',
}) => {
  const height = (size * 7) / 16;

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 16 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      role="img"
      aria-label={ariaLabel}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.2791 7H15C15 3.13401 11.866 0 8 0C4.134 0 1 3.13401 1 7H5.72093C5.72093 5.74129 6.74129 4.72093 8 4.72093C9.25871 4.72093 10.2791 5.74129 10.2791 7Z"
        fill="#F14E3A"
      />
    </svg>
  );
};

export default DailySummaryIcon;