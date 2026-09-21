import type { ReactNode } from "react";
import Policy, { type PolicyContent } from "@/components/policy";
import refundPolicy from "@/data/refund-policy.json";

export default function RefundPolicyPage(): ReactNode {
  return (
    <div className="policy-page">
      <div className="policy-page__inner">
        <Policy content={refundPolicy as PolicyContent} />
      </div>
    </div>
  );
}