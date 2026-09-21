"use client";

import { usePathname } from "next/navigation";
import {Footer} from "@/components/footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  const isChatPage =
    pathname === "/chat" || pathname.startsWith("/chat/");

  if (isChatPage) return null;

  return <Footer />;
}