"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import ArticleDetail from "@/components/articleDetail";

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  thumbnail: string;
  publishedAt: string;
}

const POSTS: Record<string, BlogPost> = {
  "how-magicmail-reads-your-inbox": {
    slug: "how-magicmail-reads-your-inbox",
    title: "How MagicMail reads your inbox",
    description:
      "A look under the hood at how the agent parses every email, decides what matters, and quietly files the rest away.",
    content: `Every email that lands in your inbox gets read once — by the agent — before you ever see it. That single pass is where most of the magic happens.

The agent doesn't just look at the subject line. It reads the full body, checks the sender's history, and compares the thread against everything else you've received in the last few days. Then it makes a small set of decisions: is this noise, is this routine, or is this something that actually needs you?

Noise gets archived. Routine gets summarized. And only the third category lands in your inbox with a nudge.

The result is an inbox that behaves less like a firehose and more like a well-run desk. The emails that matter are already at the top. Everything else is one search away.

We'll dig into the specifics in future posts — how the summarizer works, how drafts get written in your voice, and how the agent learns the difference between "important" and "urgent" over time.`,
    thumbnail:
      "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&w=1600&q=80",
    publishedAt: "2026-09-15T09:00:00Z",
  },

  "designing-for-quiet-software": {
    slug: "designing-for-quiet-software",
    title: "Designing for quiet software",
    description:
      "Why the best tools disappear into your day — and how we're applying that principle to MagicMail.",
    content: `Most software wants your attention. Notifications, badges, banners, streaks. Every one of them is a small pull away from whatever you were actually doing.

We think the opposite should be true. The best tool is one you forget you're using.

MagicMail is designed around that idea. It doesn't interrupt. It doesn't ping. It doesn't try to keep you inside the app longer than you need to be. It does its work quietly in the background and surfaces only what genuinely deserves your focus.

That's a harder design constraint than it sounds. It means every feature has to justify its existence. It means empty states need to feel complete, not barren. It means the product has to be comfortable staying silent.

Quiet software isn't invisible. It's just respectful. And we think more tools should be built that way.`,
    thumbnail:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1600&q=80",
    publishedAt: "2026-09-08T09:00:00Z",
  },

  "why-ai-agents-need-restraint": {
    slug: "why-ai-agents-need-restraint",
    title: "Why AI agents need restraint",
    description:
      "Capability isn't the hard part. Knowing when not to act is.",
    content: `Every agent we've built has had to learn the same lesson: the hardest thing isn't doing more, it's doing less at the right time.

An AI that can draft a reply, schedule a meeting, and archive a folder in the same breath sounds impressive. In practice, it's exhausting. Users don't want a tool that acts on everything — they want one that acts on the right things, quietly, and stays out of the way otherwise.

Restraint is a design choice. It's the decision to wait instead of guess. To surface instead of interrupt. To ask once and remember the answer forever.

The agents that people actually keep using won't be the ones with the longest feature list. They'll be the ones that know the difference between a moment worth speaking up in and a moment worth letting pass.`,
    thumbnail:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80",
    publishedAt: "2026-09-01T09:00:00Z",
  },

  "the-case-for-fewer-features": {
    slug: "the-case-for-fewer-features",
    title: "The case for fewer features",
    description:
      "Why the best tools feel smaller over time, not bigger.",
    content: `Most software grows. Ours shrinks.

Every feature we ship has to earn its place. That means the ones that don't hold up against real use get removed, folded into something else, or hidden behind a setting nobody has to think about.

A smaller product isn't a lesser product. It's a sharper one. It's the difference between a Swiss Army knife and a good kitchen knife — both are useful, but only one makes you feel like you know what you're doing.

We'd rather MagicMail do five things so well that you forget the other five don't exist. That's the bar every new feature has to clear.`,
    thumbnail:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=80",
    publishedAt: "2026-08-25T09:00:00Z",
  },

  "drafting-replies-in-your-voice": {
    slug: "drafting-replies-in-your-voice",
    title: "Drafting replies in your voice",
    description:
      "How we teach the agent to sound like you — without pretending to be you.",
    content: `A reply that sounds like a chatbot is worse than no reply at all. The agent has to write the way you write, or it's not saving you anything.

That starts with tone. Short sentences, no exclamation marks, no corporate hedging. We sample your past replies and use them as a reference for every draft the agent produces.

Then comes rhythm. Some people open with "Hi Sarah," others dive straight in. Some sign off "Best," others just end. The agent learns the pattern and stops guessing.

The last piece is restraint. The agent never sends anything on your behalf without confirmation. It drafts, it waits, and it lets you be the one who decides. That's the line we don't cross.`,
    thumbnail:
      "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1600&q=80",
    publishedAt: "2026-08-18T09:00:00Z",
  },

  "what-we-learned-from-50k-inboxes": {
    slug: "what-we-learned-from-50k-inboxes",
    title: "What we learned from 50k inboxes",
    description:
      "Six months of data, and the surprises that came with it.",
    content: `When we passed fifty thousand connected inboxes, we paused to look at what the data actually said. Some of it confirmed assumptions. Some of it upended them.

The biggest surprise: the average inbox is smaller than people think. Most users receive around eighty emails a day, not three hundred. The overwhelm isn't volume — it's routing. Half of those emails could be filed away before anyone reads them.

The second: people check their inbox less when it's quieter. Not because they're avoiding it, but because there's less to avoid. Removing the noise changes behaviour, not just experience.

The third, and the one we keep coming back to: the emails people care most about are almost never the ones that look urgent on the surface. They're the ones from real humans who don't send a lot of email. The agent is learning to spot them.`,
    thumbnail:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1600&q=80",
    publishedAt: "2026-08-11T09:00:00Z",
  },
};

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = use(params);
  const post = POSTS[slug];

  if (!post) {
    notFound();
  }

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/blog/${post.slug}`
      : `/blog/${post.slug}`;

  return (
    <div className="blog-page blog-page--detail">
      <section className="blog-detail">
        <div className="blog-detail__inner">
          <ArticleDetail
            title={post.title}
            description={post.description}
            content={post.content}
            thumbnail={post.thumbnail}
            publishedAt={post.publishedAt}
            url={url}
          />
        </div>
      </section>
    </div>
  );
}