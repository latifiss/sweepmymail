"use client";

import Image from "next/image";

interface ShareTarget {
  id: string;
  label: string;
  href: string;
  icon: string;
}

export interface BlogShareProps {
  url: string;
  title: string;
  className?: string;
}

export default function BlogShare({
  url,
  title,
  className,
}: BlogShareProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const targets: ShareTarget[] = [
    {
      id: "linkedin",
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: "/social/linkedin.svg",
    },
    {
      id: "x",
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: "/social/x.svg",
    },
    {
      id: "facebook",
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: "/social/facebook.svg",
    },
    {
      id: "reddit",
      label: "Share on Reddit",
      href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      icon: "/social/reddit.svg",
    },
  ];

  const rootClassName = className
    ? `blog-share ${className}`
    : "blog-share";

  return (
    <div className={rootClassName}>
      <span className="blog-share__label">Share</span>

      <ul className="blog-share__list">
        {targets.map((target) => (
          <li key={target.id} className="blog-share__item">
            <a
              href={target.href}
              className="blog-share__link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={target.label}
            >
              <Image
                src={target.icon}
                alt=""
                width={20}
                height={20}
                className="blog-share__icon"
                unoptimized
              />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}