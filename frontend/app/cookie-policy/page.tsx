import type { ReactNode } from "react";
import Policy, { type PolicyContent } from "@/components/policy";
import cookiePolicy from "@/data/cookie-policy.json";

export default function CookiePolicyPage(): ReactNode {
  return (
    <div className="policy-page">
      <div className="policy-page__inner">
        <Policy content={cookiePolicy as PolicyContent} />
      </div>
    </div>
  );
}