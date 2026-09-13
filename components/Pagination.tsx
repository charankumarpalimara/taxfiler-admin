'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export default function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}: PaginationProps) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers array with ellipsis if needed
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="p-3.5 px-5 bg-brand-light border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-light">
      {/* Range summary & page size selector */}
      <div className="flex items-center gap-4">
        <span>
          Showing <b className="text-text-dark font-bold">{startItem}</b> to{' '}
          <b className="text-text-dark font-bold">{endItem}</b> of{' '}
          <b className="text-text-dark font-bold">{totalItems}</b> records
        </span>

        {onPageSizeChange && (
          <div className="hidden md:flex items-center gap-1.5 border-l border-border-subtle pl-4">
            <span className="text-[11px]">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-0.5 rounded-lg bg-white border border-border-subtle text-xs font-bold text-text-dark focus:outline-none focus:border-brand-primary cursor-pointer"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            type="button"
            className="p-1.5 rounded-lg border border-border-subtle bg-white text-text-mid hover:bg-bg-subtle hover:text-brand-primary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {getPageNumbers().map((page, idx) =>
            typeof page === 'number' ? (
              <button
                key={idx}
                onClick={() => onPageChange(page)}
                type="button"
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentPage === page
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'bg-white text-text-mid hover:bg-bg-subtle border border-border-subtle'
                }`}
              >
                {page}
              </button>
            ) : (
              <span key={idx} className="px-2 text-text-light font-bold">
                {page}
              </span>
            )
          )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            type="button"
            className="p-1.5 rounded-lg border border-border-subtle bg-white text-text-mid hover:bg-bg-subtle hover:text-brand-primary disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
