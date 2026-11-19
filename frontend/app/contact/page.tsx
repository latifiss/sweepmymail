import type { ReactNode } from "react";
import Policy, { type PolicyContent } from "@/components/policy";
import contact from "@/data/contact.json";

export default function ContactPage(): ReactNode {
  return (
    <div className="policy-page">
      <div className="policy-page__inner">
        <Policy content={contact as PolicyContent} />
      </div>
    </div>
  );
}