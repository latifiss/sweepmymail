import type { ReactNode } from 'react';
import { LogoIcon, RedirectIcon } from '../public/icons/svg';

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
  withRedirectIcon?: boolean;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  columns?: FooterColumn[];
  logoHref?: string;
  className?: string;
}

const DEFAULT_COLUMNS: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { label: 'Chat with Agent', href: '/chat' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Compare',
    links: [
      { label: 'MagicMail vs ChatGPT', href: '/compare/chatgpt', external: true },
      { label: 'MagicMail vs LeaveMeAlone', href: '/compare/leavemealone', external: true },
      { label: 'MagicMail vs Mailstrom', href: '/compare/mailstrom', external: true },
      { label: 'MagicMail vs Clean Email', href: '/compare/clean-email', external: true },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about', external: true },
      { label: 'Refund Policy', href: '/refund-policy', external: true },
      { label: 'Privacy', href: '/privacy', external: true },
      { label: 'Terms', href: '/terms', external: true }
    ],
  },
  {
    title: 'Connect',
    links: [
      { label: 'Contact Us', href: '/contact', external: true, withRedirectIcon: true },
    ],
  },
];

export function Footer({
  columns = DEFAULT_COLUMNS,
  logoHref = '/',
  className,
}: FooterProps): ReactNode {
  const rootClassName = className ? `footer ${className}` : 'footer';

  return (
    <footer className={rootClassName}>
      <div className="footer__brand">
        <a
          href={logoHref}
          className="footer__logo"
          aria-label="MagicMail home"
        >
          <LogoIcon />
        </a>
      </div>

      <div className="footer__content">
        {columns.map((column) => (
          <nav
            key={column.title}
            className="footer__column"
            aria-label={column.title}
          >
            <h2 className="footer__column-title">{column.title}</h2>
            <ul className="footer__links">
              {column.links.map((link) => (
                <li key={link.href} className="footer__item">
                  <a
                    href={link.href}
                    className="footer__link"
                    {...(link.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                  >
                    {link.label}
                    {link.withRedirectIcon && <RedirectIcon />}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </footer>
  );
}