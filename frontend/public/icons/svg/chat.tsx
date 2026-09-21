import React from 'react';

interface ChatIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  'aria-label'?: string;
}

const ChatIcon: React.FC<ChatIconProps> = ({
  size = 14,
  className,
  style,
  'aria-label': ariaLabel = 'Chat',
}) => {
  const height = (size * 11) / 14;

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 14 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      role="img"
      aria-label={ariaLabel}
    >
      <path
        d="M0 9.66142C0 9.66142 3.53368 8.06195 7 9.34254C10.8732 10.7735 14 9.60358 14 9.60358V0.756906C14 0.756906 10.8738 1.92478 7.00109 0.494943C3.53398 -0.785153 0 0.822155 0 0.822155V9.66142Z"
        fill="#2F80ED"
      />
    </svg>
  );
};

export default ChatIcon;