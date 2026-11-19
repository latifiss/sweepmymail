import type { SVGProps } from 'react';

export interface GoogleIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export default function GoogleIcon({
  size = 16,
  width,
  height,
  ...rest
}: GoogleIconProps) {
  const resolvedWidth = width ?? size;
  const resolvedHeight = height ?? size;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={resolvedWidth}
      height={resolvedHeight}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <mask
        id="mask0_461_2626"
        style={{ maskType: 'luminance' }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="16"
        height="16"
      >
        <path
          d="M15.5294 6.51581H8.00701V9.59156H12.3294C12.2599 10.0268 12.1039 10.4551 11.8754 10.8455C11.6137 11.2929 11.29 11.6335 10.9583 11.8928C9.9647 12.6698 8.80627 12.8286 8.00176 12.8286C5.96945 12.8286 4.23297 11.4883 3.56074 9.66705C3.53361 9.60096 3.5156 9.53269 3.49366 9.46521C3.34512 9.00168 3.26395 8.51075 3.26395 8.00051C3.26395 7.46948 3.35184 6.96116 3.5121 6.48107C4.14422 4.58761 5.91984 3.17337 8.00322 3.17337C8.42227 3.17337 8.82581 3.22427 9.20849 3.32579C10.0831 3.5578 10.7017 4.01475 11.0808 4.37619L13.368 2.0905C11.9767 0.788778 10.163 1.96812e-09 7.99942 1.96812e-09C6.26981 -3.79862e-05 4.67297 0.549854 3.36441 1.47919C2.3032 2.23286 1.43287 3.24192 0.845495 4.41384C0.299155 5.50044 0 6.7046 0 7.99931C0 9.29407 0.299613 10.5107 0.845954 11.5873V11.5946C1.42303 12.7375 2.2669 13.7215 3.29254 14.4717C4.18855 15.1271 5.79518 16 7.99942 16C9.26702 16 10.3905 15.7668 11.3812 15.3298C12.096 15.0145 12.7292 14.6033 13.3026 14.0748C14.0601 13.3765 14.6535 12.5127 15.0584 11.519C15.4634 10.5252 15.68 9.40147 15.68 8.18311C15.68 7.61571 15.6241 7.03947 15.5294 6.51575V6.51581Z"
          fill="white"
        />
      </mask>
      <g mask="url(#mask0_461_2626)">
        <g filter="url(#filter0_f_461_2626)">
          <path
            d="M-0.115234 8.05371C-0.10692 9.32804 0.248933 10.6428 0.787577 11.7042V11.7115C1.17677 12.4823 1.70869 13.0912 2.31454 13.6945L5.97369 12.3321C5.2814 11.9733 5.17576 11.7534 4.6795 11.3522C4.17237 10.8304 3.7944 10.2313 3.55902 9.52891H3.54953L3.55902 9.5216C3.40416 9.05776 3.38889 8.5654 3.38317 8.05371H-0.115234Z"
            fill="url(#paint0_radial_461_2626)"
          />
        </g>
        <g filter="url(#filter1_f_461_2626)">
          <path
            d="M8.00729 -0.0581055C7.64562 1.23842 7.78391 2.49869 8.00729 3.23197C8.42493 3.23229 8.82727 3.28309 9.20875 3.38429C10.0833 3.6163 10.7019 4.07326 11.081 4.4347L13.4268 2.09062C12.0371 0.790449 10.3647 -0.056057 8.00729 -0.0581055Z"
            fill="url(#paint1_radial_461_2626)"
          />
        </g>
        <g filter="url(#filter2_f_461_2626)">
          <path
            d="M7.99934 -0.0683594C6.22534 -0.0683985 4.5875 0.495611 3.24535 1.44881C2.74701 1.80273 2.28969 2.21157 1.88248 2.66621C1.7758 3.68745 2.68106 4.94266 4.47376 4.93227C5.34356 3.89984 6.62999 3.23186 8.06178 3.23186C8.06309 3.23186 8.06436 3.23196 8.06566 3.23197L8.00719 -0.0681258C8.00455 -0.0681275 8.00199 -0.0683594 7.99934 -0.0683594Z"
            fill="url(#paint2_radial_461_2626)"
          />
        </g>
        <g filter="url(#filter3_f_461_2626)">
          <path
            d="M13.8547 8.42314L12.2712 9.53313C12.2017 9.96843 12.0456 10.3966 11.8171 10.7871C11.5554 11.2345 11.2318 11.575 10.9 11.8344C9.90848 12.6097 8.75312 12.7694 7.94881 12.77C7.11748 14.2148 6.97174 14.9385 8.00729 16.1046C9.28867 16.1036 10.4247 15.8676 11.4267 15.4256C12.151 15.1061 12.7927 14.6894 13.3738 14.1538C14.1415 13.4461 14.7429 12.5708 15.1533 11.5637C15.5637 10.5566 15.7831 9.4178 15.7831 8.18311L13.8547 8.42314Z"
            fill="url(#paint3_radial_461_2626)"
          />
        </g>
        <g filter="url(#filter4_f_461_2626)">
          <path
            d="M7.89038 6.39893V9.70839H15.5086C15.5756 9.25515 15.7972 8.66864 15.7972 8.1831C15.7972 7.6157 15.7414 6.92264 15.6467 6.39893H7.89038Z"
            fill="#3086FF"
          />
        </g>
        <g filter="url(#filter5_f_461_2626)">
          <path
            d="M1.91897 2.54932C1.44885 3.07419 1.04722 3.66168 0.728774 4.29704C0.182443 5.38364 -0.116699 6.70465 -0.116699 7.99935C-0.116699 8.0176 -0.115219 8.03545 -0.1151 8.05367C0.126853 8.52704 3.22704 8.4364 3.38331 8.05367C3.38311 8.03581 3.38114 8.01839 3.38114 8.00049C3.38114 7.46947 3.46906 7.07806 3.62931 6.59797C3.82701 6.00579 4.13656 5.46047 4.53238 4.99063C4.62211 4.87374 4.86145 4.62244 4.93128 4.47171C4.95788 4.41429 4.88299 4.38207 4.8788 4.36186C4.87412 4.33925 4.77371 4.35743 4.75121 4.3406C4.67979 4.28714 4.53835 4.25922 4.45247 4.23441C4.2689 4.18137 3.96467 4.0644 3.7957 3.94316C3.26157 3.5599 2.42801 3.10211 1.91897 2.54932Z"
            fill="url(#paint4_radial_461_2626)"
          />
        </g>
        <g filter="url(#filter6_f_461_2626)">
          <path
            d="M3.80718 4.3641C5.04578 5.12969 5.40197 3.97766 6.22546 3.61717L4.79297 0.585938C4.26602 0.811934 3.76816 1.09271 3.30622 1.42078C2.61636 1.91072 2.00715 2.50859 1.50391 3.18898L3.80718 4.3641Z"
            fill="url(#paint5_radial_461_2626)"
          />
        </g>
        <g filter="url(#filter7_f_461_2626)">
          <path
            d="M4.31135 12.0976C2.64869 12.7101 2.3884 12.7321 2.23535 13.7835C2.52782 14.0747 2.84205 14.3441 3.17597 14.5884C4.07198 15.2438 5.79551 16.1166 7.99975 16.1166C8.00234 16.1166 8.00482 16.1164 8.0074 16.1164V12.7114C8.00573 12.7114 8.00382 12.7115 8.00215 12.7115C7.17674 12.7115 6.51715 12.4903 5.84087 12.1056C5.67413 12.0108 5.37161 12.2655 5.21783 12.1516C5.00574 11.9946 4.49531 12.2869 4.31135 12.0976Z"
            fill="url(#paint6_radial_461_2626)"
          />
        </g>
        <g opacity="0.5" filter="url(#filter8_f_461_2626)">
          <path
            d="M7.03369 12.6045V16.0577C7.3421 16.0946 7.66307 16.1169 7.99977 16.1169C8.33731 16.1169 8.66385 16.0993 8.98116 16.0667V12.6278C8.62557 12.6898 8.29066 12.7119 8.00217 12.7119C7.66991 12.7119 7.34678 12.6724 7.03369 12.6045Z"
            fill="url(#paint7_linear_461_2626)"
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_f_461_2626"
          x="-0.153106"
          y="8.01584"
          width="6.16461"
          height="5.71637"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="0.0189356" result="effect1_foregroundBlur_461_2626" />
        </filter>
        <filter
          id="filter1_f_461_2626"
          x="7.74704"
          y="-0.0959766"
          width="5.71783"
          height="4.56842"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="0.0189356" result="effect1_foregroundBlur_461_2626" />
        </filter>
        <filter
          id="filter2_f_461_2626"
          x="1.83615"
          y="-0.106231"
          width="6.26715"
          height="5.07623"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="0.0189356" result="effect1_foregroundBlur_461_2626" />
        </filter>
        <filter
          id="filter3_f_461_2626"
          x="7.23972"
          y="8.14523"
          width="8.58111"
          height="7.99713"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="0.0189356" result="effect1_foregroundBlur_461_2626" />
        </filter>
        <filter
          id="filter4_f_461_2626"
          x="7.85251"
          y="6.36105"
          width="7.98248"
          height="3.38531"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="0.0189356" result="effect1_foregroundBlur_461_2626" />
        </filter>
        <filter
          id="filter5_f_461_2626"
          x="-0.15457"
          y="2.51145"
          width="5.12945"
          height="5.90191"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="0.0189356" result="effect1_foregroundBlur_461_2626" />
        </filter>
        <filter
          id="filter6_f_461_2626"
          x="1.23766"
          y="0.319688"
          width="5.25418"
          height="4.56814"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="0.133125" result="effect1_foregroundBlur_461_2626" />
        </filter>
        <filter
          id="filter7_f_461_2626"
          x="2.19748"
          y="12.0461"
          width="5.84771"
          height="4.10846"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="0.0189356" result="effect1_foregroundBlur_461_2626" />
        </filter>
        <filter
          id="filter8_f_461_2626"
          x="6.99582"
          y="12.5666"
          width="2.02301"
          height="3.58844"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="0.0189356" result="effect1_foregroundBlur_461_2626" />
        </filter>
        <radialGradient
          id="paint0_radial_461_2626"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(-0.325831 -7.96794 11.715 -0.478149 5.90044 13.5744)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.141612" stopColor="#1ABD4D" />
          <stop offset="0.247515" stopColor="#6EC30D" />
          <stop offset="0.311547" stopColor="#8AC502" />
          <stop offset="0.366013" stopColor="#A2C600" />
          <stop offset="0.445673" stopColor="#C8C903" />
          <stop offset="0.540305" stopColor="#EBCB03" />
          <stop offset="0.615636" stopColor="#F7CD07" />
          <stop offset="0.699345" stopColor="#FDCD04" />
          <stop offset="0.771242" stopColor="#FDCE05" />
          <stop offset="0.860566" stopColor="#FFCE0A" />
        </radialGradient>
        <radialGradient
          id="paint1_radial_461_2626"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(5.53352 -1.35704e-05 -7.77758e-06 7.13951 13.2073 4.26509)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.408458" stopColor="#FB4E5A" />
          <stop offset="1" stopColor="#FF4540" />
        </radialGradient>
        <radialGradient
          id="paint2_radial_461_2626"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(-7.75286 4.28995 5.82692 10.5107 10.1853 -1.10183)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.231273" stopColor="#FF4541" />
          <stop offset="0.311547" stopColor="#FF4540" />
          <stop offset="0.457516" stopColor="#FF4640" />
          <stop offset="0.540305" stopColor="#FF473F" />
          <stop offset="0.699346" stopColor="#FF5138" />
          <stop offset="0.771242" stopColor="#FF5B33" />
          <stop offset="0.860566" stopColor="#FF6C29" />
          <stop offset="1" stopColor="#FF8C18" />
        </radialGradient>
        <radialGradient
          id="paint3_radial_461_2626"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(-14.06 -18.3365 -6.77483 5.18501 8.12255 15.0691)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.131546" stopColor="#0CBA65" />
          <stop offset="0.209784" stopColor="#0BB86D" />
          <stop offset="0.297297" stopColor="#09B479" />
          <stop offset="0.396257" stopColor="#08AD93" />
          <stop offset="0.477124" stopColor="#0AA6A9" />
          <stop offset="0.568425" stopColor="#0D9CC6" />
          <stop offset="0.667385" stopColor="#1893DD" />
          <stop offset="0.768727" stopColor="#258BF1" />
          <stop offset="0.858506" stopColor="#3086FF" />
        </radialGradient>
        <radialGradient
          id="paint4_radial_461_2626"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(-0.994996 8.56811 11.8581 1.37445 7.32025 1.44274)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.366013" stopColor="#FF4E3A" />
          <stop offset="0.457516" stopColor="#FF8A1B" />
          <stop offset="0.540305" stopColor="#FFA312" />
          <stop offset="0.615636" stopColor="#FFB60C" />
          <stop offset="0.771242" stopColor="#FFCD0A" />
          <stop offset="0.860566" stopColor="#FECF0A" />
          <stop offset="0.915033" stopColor="#FECF08" />
          <stop offset="1" stopColor="#FDCD01" />
        </radialGradient>
        <radialGradient
          id="paint5_radial_461_2626"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(-2.87605 3.17785 -8.97171 -8.1044 5.92105 1.35384)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.315904" stopColor="#FF4C3C" />
          <stop offset="0.603818" stopColor="#FF692C" />
          <stop offset="0.726837" stopColor="#FF7825" />
          <stop offset="0.884534" stopColor="#FF8D1B" />
          <stop offset="1" stopColor="#FF9F13" />
        </radialGradient>
        <radialGradient
          id="paint6_radial_461_2626"
          cx="0"
          cy="0"
          r="1"
          gradientTransform="matrix(-7.75286 -4.28995 5.82692 -10.5107 10.1856 17.1015)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.231273" stopColor="#0FBC5F" />
          <stop offset="0.311547" stopColor="#0FBC5F" />
          <stop offset="0.366013" stopColor="#0FBC5E" />
          <stop offset="0.457516" stopColor="#0FBC5D" />
          <stop offset="0.540305" stopColor="#12BC58" />
          <stop offset="0.699346" stopColor="#28BF3C" />
          <stop offset="0.771242" stopColor="#38C02B" />
          <stop offset="0.860566" stopColor="#52C218" />
          <stop offset="0.915033" stopColor="#67C30F" />
          <stop offset="1" stopColor="#86C504" />
        </radialGradient>
        <linearGradient
          id="paint7_linear_461_2626"
          x1="7.03369"
          y1="14.3607"
          x2="8.98116"
          y2="14.3607"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0FBC5C" />
          <stop offset="1" stopColor="#0CBA65" />
        </linearGradient>
      </defs>
    </svg>
  );
}