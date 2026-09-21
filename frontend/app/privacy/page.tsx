import type { ReactNode } from "react";
import Policy, { type PolicyContent } from "@/components/policy";
import privacyPolicy from "@/data/privacy-policy.json";

export default function PrivacyPolicyPage(): ReactNode {
  return (
    <div className="policy-page">
      <div className="policy-page__inner">
        <Policy content={privacyPolicy as PolicyContent} />
      </div>
    </div>
  );
}