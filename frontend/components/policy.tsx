"use client";

import type { ReactNode } from "react";

export interface PolicySection {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
}

export interface PolicyContent {
  title: string;
  lastUpdated?: string;
  intro?: string;
  sections: PolicySection[];
  contactEmail?: string;
}

export interface PolicyProps {
  content: PolicyContent;
  className?: string;
}

export default function Policy({
  content,
  className,
}: PolicyProps): ReactNode {
  const rootClassName = className ? `policy ${className}` : "policy";

  return (
    <div className={rootClassName}>
      <header className="policy__header">
        <h1 className="policy__title">{content.title}</h1>

        {content.lastUpdated && (
          <p className="policy__updated">
            Last updated: {content.lastUpdated}
          </p>
        )}

        {content.intro && (
          <p className="policy__intro">{content.intro}</p>
        )}
      </header>

      <div className="policy__body">
        {content.sections.map((section, index) => (
          <section key={index} className="policy__section">
            {section.heading && (
              <h2 className="policy__heading">{section.heading}</h2>
            )}

            {section.paragraphs?.map((paragraph, pIndex) => (
              <p key={pIndex} className="policy__paragraph">
                {paragraph}
              </p>
            ))}

            {section.list && section.list.length > 0 && (
              <ul className="policy__list">
                {section.list.map((item, lIndex) => (
                  <li key={lIndex} className="policy__list-item">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {content.contactEmail && (
        <footer className="policy__footer">
          <p className="policy__contact">
            Questions? Email us at{" "}
            <a
              href={`mailto:${content.contactEmail}`}
              className="policy__contact-link"
            >
              {content.contactEmail}
            </a>
          </p>
        </footer>
      )}
    </div>
  );
}