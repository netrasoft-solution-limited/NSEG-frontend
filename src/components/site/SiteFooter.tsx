import { BrandLogo } from '../common/BrandLogo';
import { Link } from 'react-router-dom';
import { legalLinks, siteFooterColumns, type FooterItem } from '../../data/landing';

function FooterEntry({ item, className }: {item: FooterItem;className: string;}) {
  if (!item.href) {
    // No page yet: plain text rather than a link that goes nowhere.
    return (
      <span className={`${className} cursor-default opacity-70`} title="Page coming soon">
        {item.label}
      </span>);

  }
  return (
    <Link to={item.href} className={`${className} transition-colors duration-150 ease-out hover:text-chalk`}>
      {item.label}
    </Link>);

}

export function SiteFooter() {
  return (
    <footer id="support" className="border-t border-hairline/[0.04] bg-ink-800/40">
      <div className="mx-auto max-w-shell px-4 pb-10 pt-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
          <div>
            <BrandLogo className="h-9" />
            <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-chalk-muted">
              Nigeria Service Export Gateway. Delivered by the National Coordination Mechanism for Services Exports and the
              National Talent Export Programme.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {siteFooterColumns.map((column) =>
            <div key={column.heading}>
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-chalk-dim">{column.heading}</p>
                <ul className="mt-3 space-y-2">
                  {column.items.map((item) =>
                <li key={item.label}>
                      <FooterEntry item={item} className="text-[13.5px] text-chalk-muted" />
                    </li>
                )}
                </ul>
              </div>
            )}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-hairline/[0.05] pt-6 lg:flex-row lg:items-center lg:justify-between">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {legalLinks.map((item) =>
            <li key={item.label}>
                <FooterEntry item={item} className="text-[12.5px] text-chalk-muted" />
              </li>
            )}
          </ul>
          <div className="flex flex-col gap-1.5 lg:items-end">
            <p className="text-[12.5px] text-chalk-dim">
              Copyright © 2026 <span aria-hidden="true">|</span> All Rights Reserved{' '}
              <span aria-hidden="true">|</span> Federal Ministry of Industry, Trade and Investment
            </p>
            {/* Delivery partners, credited at the client's request.
                The multiplication sign is plain text rather than a hidden "and" for screen
                readers: that trick leaked the word into anything that copied the line, which
                came out as "NASENI ×and Primeguage". A reader saying "times" here is the lesser
                problem, and it is how every partnership mark of this shape is set. */}
            <p className="text-[12.5px] text-chalk-dim">
              Powered by: <span className="font-medium text-chalk-muted">NASENI × Primeguage</span>
            </p>
          </div>
        </div>
      </div>
    </footer>);

}
