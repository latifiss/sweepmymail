"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/headers/header";

const ALT_HEADER_ROUTES = ["/chat"];

export default function ConditionalHeader() {
  const pathname = usePathname();
  const isAltRoute = ALT_HEADER_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!isAltRoute) {
    return <Header />;
  }

  return (
    <div className="conditional-header conditional-header--alt-route">
      <Header />
    </div>
  );
}