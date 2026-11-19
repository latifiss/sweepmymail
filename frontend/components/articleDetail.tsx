"use client";

import Image from "next/image";
import BlogShare from "@/components/blogShare";

export interface ArticleDetailProps {
  title: string;
  description?: string;
  content: string;
  thumbnail: string;
  publishedAt: string; 
  url: string;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ArticleDetail({
  title,
  description,
  content,
  thumbnail,
  publishedAt,
  url,
}: ArticleDetailProps) {
  const formattedDate = formatDate(publishedAt);

  return (
    <article className="article-detail">
      <header className="article-detail__header">
        <div className="article-detail__meta">
          {formattedDate && (
            <time
              className="article-detail__date"
              dateTime={publishedAt}
            >
              {formattedDate}
            </time>
          )}
        </div>

        <h1 className="article-detail__title">{title}</h1>

        {description && (
          <p className="article-detail__description">{description}</p>
        )}
      </header>

      <div className="article-detail__hero">
        <Image
          src={thumbnail}
          alt=""
          width={1128}
          height={640}
          className="article-detail__hero-img"
          priority
          unoptimized
        />
      </div>

      <div className="article-detail__body">
        {content.split(/\n\n+/).map((paragraph, index) => (
          <p key={index} className="article-detail__paragraph">
            {paragraph}
          </p>
        ))}
      </div>

      <footer className="article-detail__footer">
        <BlogShare url={url} title={title} />
      </footer>
    </article>
  );
}