import React from 'react';

interface CategoriesIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

const CategoriesIcon: React.FC<CategoriesIconProps> = ({
  size = 16,
  className,
  style,
  'aria-label': ariaLabel = 'Categories',
}) => {
  const height = (size * 14) / 16;

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 16 14"
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
        d="M8.00091 0C9.4525 0 10.6292 1.17673 10.6292 2.6283C10.6292 4.07987 9.4525 5.25659 8.00091 5.25659C6.54933 5.25659 5.37261 4.07987 5.37261 2.6283C5.37261 1.17673 6.54933 0 8.00091 0ZM3.61003 13.4978C2.43568 12.6447 2.17535 11.001 3.02857 9.82662C3.88178 8.65227 5.52543 8.39196 6.69978 9.24519C7.87413 10.0984 8.13445 11.742 7.28127 12.9164C6.42804 14.0907 4.78437 14.3511 3.61003 13.4978ZM12.9818 9.82662C13.835 11.001 13.5747 12.6447 12.4003 13.4978C11.226 14.3511 9.5823 14.0907 8.72912 12.9164C7.87589 11.742 8.1362 10.0984 9.31056 9.24519C10.4849 8.39196 12.1286 8.65227 12.9818 9.82662ZM0.892532 5.15173C1.34109 3.77122 2.82386 3.01571 4.20439 3.46427C5.58491 3.91283 6.34043 5.39562 5.89186 6.77613C5.4433 8.15664 3.96053 8.91215 2.58001 8.46359C1.19948 8.01502 0.443971 6.53229 0.892532 5.15173ZM11.7957 3.46427C13.1762 3.01571 14.659 3.77122 15.1075 5.15173C15.5561 6.53229 14.8006 8.01502 13.4201 8.46359C12.0395 8.91215 10.5568 8.15664 10.1082 6.77613C9.65964 5.39562 10.4152 3.91283 11.7957 3.46427Z"
        fill="#2F80ED"
      />
    </svg>
  );
};

export default CategoriesIcon;