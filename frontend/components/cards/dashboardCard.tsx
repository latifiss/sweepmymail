'use client';

import { FC } from "react";

type DashboardCardProps = {
  title: string;
  count: number;
  color?: "blue" | "green" | "red" | "yellow" | "purple"; // predefined color options
};

export const DashboardCard: FC<DashboardCardProps> = ({
  title,
  count,
  color = "blue", // default dot color
}) => {
  return (
    <div className="card card--dashboard">
      <div className="card__header">
        <span className={`card__dot card__dot--${color}`}></span>
        {title}
      </div>
      <div className="card__count">
        {count}
      </div>
    </div>
  );
};
