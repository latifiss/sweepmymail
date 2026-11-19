import React from 'react';

interface GmailIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

const GmailIcon: React.FC<GmailIconProps> = ({
  size = 21,
  className,
  style,
  'aria-label': ariaLabel = 'Gmail',
}) => {
  const height = (size * 16) / 21;

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 21 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      role="img"
      aria-label={ariaLabel}
    >
      <g clipPath="url(#clip0_285_777)">
        <path
          d="M15.7803 2.05713H20.1256V14.6285C20.1256 15.3859 19.5112 16 18.7534 16H16.4664C16.3763 16 16.2871 15.9822 16.2038 15.9478C16.1206 15.9133 16.0449 15.8628 15.9812 15.7991C15.9175 15.7354 15.867 15.6599 15.8325 15.5767C15.798 15.4935 15.7803 15.4043 15.7803 15.3142V2.05713Z"
          fill="url(#paint0_linear_285_777)"
        />
        <path
          d="M4.34533 2.05713H0V14.6285C0 15.3859 0.614406 16 1.37221 16H3.65922C3.74932 16 3.83854 15.9822 3.92178 15.9478C4.00503 15.9133 4.08066 15.8628 4.14437 15.7991C4.20808 15.7354 4.25862 15.6599 4.2931 15.5767C4.32758 15.4935 4.34533 15.4043 4.34533 15.3142V2.05713Z"
          fill="#FC413D"
        />
        <path
          d="M3.57074 0.509288C2.65216 -0.262368 1.28166 -0.14374 0.509568 0.774316C-0.262528 1.69226 -0.143832 3.06197 0.774748 3.83374L9.47432 11.1422C9.63917 11.2807 9.8476 11.3566 10.0629 11.3566C10.2783 11.3566 10.4867 11.2807 10.6516 11.1422L19.3511 3.83362C20.2696 3.06197 20.3883 1.69226 19.6162 0.774201C18.8441 -0.14374 17.4736 -0.262368 16.5552 0.509288L10.0629 5.96345L3.57074 0.509288Z"
          fill="url(#paint1_linear_285_777)"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_285_777"
          x1="17.9529"
          y1="2.05713"
          x2="17.9529"
          y2="16"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#60D673" />
          <stop offset="0.17" stopColor="#42C868" />
          <stop offset="0.39" stopColor="#0EBC5F" />
          <stop offset="0.62" stopColor="#00A9BB" />
          <stop offset="0.86" stopColor="#3C90FF" />
          <stop offset="1" stopColor="#3186FF" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_285_777"
          x1="2.15559e-05"
          y1="2.3006"
          x2="20.1258"
          y2="2.3006"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.08" stopColor="#FF63A0" />
          <stop offset="0.3" stopColor="#FC413D" />
          <stop offset="0.5" stopColor="#FC413D" />
          <stop offset="0.65" stopColor="#FC413D" />
          <stop offset="0.72" stopColor="#FC5C30" />
          <stop offset="0.86" stopColor="#FEB10C" />
          <stop offset="0.91" stopColor="#FEC700" />
          <stop offset="0.96" stopColor="#FFDB0F" />
        </linearGradient>
        <clipPath id="clip0_285_777">
          <rect width="20.1258" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default GmailIcon;