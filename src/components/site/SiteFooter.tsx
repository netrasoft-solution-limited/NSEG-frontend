import React from 'react';

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-shell px-4 pb-12">
      <div className="flex flex-col items-start justify-between gap-4 border-t border-hairline/8 pt-6 sm:flex-row sm:items-center">
        <p className="text-[12px] text-chalk-dim">
          Nigeria Service Export Gateway · Federal Ministry of Industry, Trade and Investment
        </p>
        <p className="font-mono text-[11px] text-chalk-dim">
          Baseline TOR v1.1 · Gate G2 first rendition
        </p>
      </div>
    </footer>);

}