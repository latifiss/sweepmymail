"use client";

import Link from "next/link";
import ArticleCard from "@/components/articleCard";

export interface BlogPostSummary {
  slug: string;
  title: string;
  thumbnail: string;
}

const POSTS: BlogPostSummary[] = [
  {
    slug: "how-magicmail-reads-your-inbox",
    title: "How MagicMail reads your inbox",
    thumbnail:
      "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "designing-for-quiet-software",
    title: "Designing for quiet software",
    thumbnail:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "why-ai-agents-need-restraint",
    title: "Why AI agents need restraint",
    thumbnail:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "the-case-for-fewer-features",
    title: "The case for fewer features",
    thumbnail:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "drafting-replies-in-your-voice",
    title: "Drafting replies in your voice",
    thumbnail:
      "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "what-we-learned-from-50k-inboxes",
    title: "What we learned from 50k inboxes",
    thumbnail:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function BlogPage() {
  return (
    <div className="blog-page">
      <section className="blog-hero">
        <div className="blog-hero__inner">
          <span className="blog-hero__label">Blog</span>
          <h1 className="blog-hero__title">
            Notes from the quiet side of email.
          </h1>
          <p className="blog-hero__lead">
            Product updates, essays on focus, and everything we&apos;re learning
            as we build an email agent that respects your attention.
          </p>
        </div>
      </section>

      <section className="blog-grid">
        <div className="blog-grid__inner">
          <ul className="blog-grid__list">
            {POSTS.map((post) => (
              <li key={post.slug} className="blog-grid__item">
                <ArticleCard
                  slug={post.slug}
                  title={post.title}
                  thumbnail={post.thumbnail}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}