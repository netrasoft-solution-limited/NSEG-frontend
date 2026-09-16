import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

interface PaginationProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, pageCount, onChange }: PaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="Previous page"
        className="inline-flex items-center gap-1.5 rounded-lg border border-hairline/10 px-3 py-1.5 text-[12.5px] text-chalk-muted transition-colors duration-150 ease-out hover:text-chalk disabled:opacity-30 disabled:hover:text-chalk-muted">

        <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
        Prev
      </button>
      <span className="font-mono text-[12px] text-chalk-dim">
        Page {page} of {pageCount}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(pageCount, page + 1))}
        disabled={page === pageCount}
        aria-label="Next page"
        className="inline-flex items-center gap-1.5 rounded-lg border border-hairline/10 px-3 py-1.5 text-[12.5px] text-chalk-muted transition-colors duration-150 ease-out hover:text-chalk disabled:opacity-30 disabled:hover:text-chalk-muted">

        Next
        <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>);

}
