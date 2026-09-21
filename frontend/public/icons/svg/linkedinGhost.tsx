import React from "react";

interface LinkedinGhostIconProps {
  className?: string;
}

export default function LinkedinGhostIcon({ className }: LinkedinGhostIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      width="100%"
      height="100%"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g opacity="0.5">
        <path
          d="M21.959 13.693V21.072H17.681V14.187C17.681 12.457 17.062 11.277 15.514 11.277C14.332 11.277 13.628 12.073 13.319 12.842C13.206 13.117 13.177 13.5 13.177 13.885V21.072H8.897C8.897 21.072 8.955 9.412 8.897 8.203H13.177V10.027L13.149 10.069H13.177V10.027C13.745 9.152 14.76 7.901 17.033 7.901C19.848 7.901 21.959 9.741 21.959 13.693ZM4.421 2C2.958 2 2 2.96 2 4.223C2 5.458 2.93 6.447 4.365 6.447H4.393C5.886 6.447 6.813 5.458 6.813 4.223C6.787 2.96 5.886 2 4.421 2ZM2.254 21.072H6.532V8.203H2.254V21.072Z"
          fill="#766E70"
        />
      </g>
    </svg>
  );
}