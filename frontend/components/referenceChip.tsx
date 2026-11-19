import type { ReactNode } from "react";

export interface ReferenceChipProps {
  icon: ReactNode;
  label: string;
  color: string;
  className?: string;
}

export default function ReferenceChip({
  icon,
  label,
  color,
  className,
}: ReferenceChipProps) {
  const rootClassName = className
    ? `reference-chip ${className}`
    : "reference-chip";

  return (
    <span
      className={rootClassName}
      style={{ ["--reference-color" as string]: color }}
    >
      <span className="reference-chip__icon">{icon}</span>
      <span className="reference-chip__label">{label}</span>
    </span>
  );
}