"use client";

import Link from "next/link";
import Image from "next/image";

export interface ArticleCardProps {
  slug: string;
  title: string;
  thumbnail: string;
  className?: string;
}

export default function ArticleCard({
  slug,
  title,
  thumbnail,
  className,
}: ArticleCardProps) {
  const rootClassName = className
    ? `article-card ${className}`
    : "article-card";

  return (
    <Link
      href={`/blog/${slug}`}
      className={rootClassName}
      aria-label={title}
    >
      <div className="article-card__thumb">
        <Image
          src={thumbnail}
          alt=""
          width={640}
          height={400}
          className="article-card__thumb-img"
          unoptimized
        />
      </div>

      <div className="article-card__body">
        <h3 className="article-card__title">{title}</h3>
      </div>
    </Link>
  );
}