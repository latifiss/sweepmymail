import type { ReactNode } from "react";
import Policy, { type PolicyContent } from "@/components/policy";
import terms from "@/data/terms.json";

export default function TermsPage(): ReactNode {
  return (
    <div className="policy-page">
      <div className="policy-page__inner">
        <Policy content={terms as PolicyContent} />
      </div>
    </div>
  );
}