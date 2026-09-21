import type { SVGProps } from 'react';

export interface RedirectIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
}

export default function RedirectIcon({
  size = 9,
  color = 'currentColor',
  width,
  height,
  ...rest
}: RedirectIconProps) {
  const resolvedWidth = width ?? size;
  const resolvedHeight = height ?? size;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={resolvedWidth}
      height={resolvedHeight}
      viewBox="0 0 9 9"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path
        d="M1.05009 8.24606L8.5935e-05 7.19606L5.97809 1.21806H0.238086L1.44209 6.03199e-05H8.24609V6.80406L7.01409 8.02206V2.26806L1.05009 8.24606Z"
        fill={color}
      />
    </svg>
  );
}