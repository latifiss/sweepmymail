import type { Metadata } from "next";
import "./globals.css";
import "../sass/style.scss";
import Header from "@/components/headers/header";
import { Providers } from "./providers";
import ClientLayout from "./client-layout";

export const metadata: Metadata = {
  title: "MagicMail - AI Email Management | Clean Inbox, Clear Mind",
  description: "AI-powered email cleaner that deletes spam, summarizes newsletters, auto-categorizes emails, and prioritizes what matters. Join 50,000+ users saving 2+ hours daily.",
  keywords: "email cleaner, AI email assistant, spam removal, inbox organizer, email summary tool",
  openGraph: {
    title: "MagicMail - Transform Your Email Experience",
    description: "Stop drowning in emails. Let AI clean your inbox, summarize newsletters, and highlight what's important.",
    type: "website",
    locale: "en_US",
    url: "https://mymagicmail.app",
    siteName: "MagicMail",
    images: [
      {
        url: "https://mymagicmail.app/og-image.jpg",
        alt: "MagicMail Email Management Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MagicMail - AI Email Management",
    description: "Clean your inbox with AI. Free up to 100 emails.",
    images: ["https://mymagicmail.app/twitter-image.jpg"],
  },
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
  authors: [{ name: "MagicMail" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}