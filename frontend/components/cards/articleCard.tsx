'use client';

import { FC } from "react";

type ArticleStatus = "published" | "draft" | "scheduled";

type ArticleCardProps = {
  category: string;
  content: string;
  status: ArticleStatus;
  date: string; // can be formatted string like "Today: 3:20pm"
};

const statusClasses: Record<ArticleStatus, string> = {
  published: "card__status card__status--published",
  draft: "card__status card__status--draft",
  scheduled: "card__status card__status--scheduled",
};

export const ArticleCard: FC<ArticleCardProps> = ({
  category,
  content,
  status,
  date,
}) => {
  return (
    <div className="card card--article">
      {/* Category */}
      <div className="card__category">
        {category}
      </div>

      {/* Content */}
      <div className="card__content">
        {content}
      </div>

      {/* Footer: status tag + date */}
      <div className="card__footer">
        <span className={statusClasses[status]}>{status.toUpperCase()}</span>
        <span className="card__date">{date}</span>
      </div>
    </div>
  );
};
