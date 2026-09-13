'use client';

import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import Pagination from './Pagination';

export interface Column<T> {
  key: string;
  header: string | React.ReactNode;
  cell: (row: T, index: number) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  align?: 'left' | 'center' | 'right';
}

export interface FilterTab {
  key: string;
  label: string;
  count?: number;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;

  // Dynamic search & filter options
  searchKeys?: (keyof T | string)[];
  searchPredicate?: (row: T, query: string) => boolean;
  filterKey?: keyof T;
  statusOptions?: string[];
  customFilterFn?: (row: T) => boolean;

  // Controlled toolbar search
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;

  // Filter tabs
  filterTabs?: FilterTab[];
  activeFilterTab?: string;
  onFilterTabChange?: (tabKey: string) => void;
  filterLabel?: string;

  // Toolbar action buttons slot (can be a node or render function receiving filtered data)
  toolbarActions?: React.ReactNode | ((filteredData: T[]) => React.ReactNode);

  // Row interaction
  onRowClick?: (row: T) => void;

  // Pagination
  enablePagination?: boolean;
  defaultPageSize?: number;

  // Empty state
  emptyMessage?: string;
  emptySubtext?: string;

  // Footer custom label
  footerLabel?: string;
}

export default function DataTable<T>({
  data = [],
  columns,
  getRowId,
  searchKeys,
  searchPredicate,
  filterKey,
  statusOptions,
  customFilterFn,
  searchable = true,
  searchPlaceholder = 'Search records...',
  searchValue,
  onSearchChange,
  filterTabs,
  activeFilterTab,
  onFilterTabChange,
  filterLabel = 'Filter:',
  toolbarActions,
  onRowClick,
  enablePagination = true,
  defaultPageSize = 10,
  emptyMessage = 'No records found',
  emptySubtext = 'Try adjusting your search query or active filters.',
  footerLabel = 'NexGen Data Engine',
}: DataTableProps<T>) {
  // Internal search and filter tab state
  const [internalSearch, setInternalSearch] = useState<string>('');
  const [internalActiveTab, setInternalActiveTab] = useState<string>('All');
  
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);

  // Use controlled props if provided, otherwise fallback to internal state
  const search = searchValue !== undefined ? searchValue : internalSearch;
  const currentTab = activeFilterTab !== undefined ? activeFilterTab : internalActiveTab;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalSearch(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
    setCurrentPage(1);
  };

  const handleTabChange = (tabKey: string) => {
    setInternalActiveTab(tabKey);
    if (onFilterTabChange) {
      onFilterTabChange(tabKey);
    }
    setCurrentPage(1);
  };

  // Dynamic filter tabs computation: automatically discovers unique values from data if statusOptions is omitted
  const computedFilterTabs: FilterTab[] = useMemo(() => {
    if (filterTabs && filterTabs.length > 0) return filterTabs;
    if (!filterKey) return [];

    const rawList = Array.isArray(data) ? data : [];

    let options: string[] = [];
    if (statusOptions && statusOptions.length > 0) {
      options = statusOptions;
    } else {
      // Auto-extract unique status values dynamically from data!
      const uniqueStatuses = new Set<string>();
      rawList.forEach((item) => {
        const val = (item as any)[filterKey];
        if (val && typeof val === 'string' && val.trim() !== '') {
          uniqueStatuses.add(val.trim());
        }
      });
      options = ['All', ...Array.from(uniqueStatuses)];
    }

    return options.map((st) => ({
      key: st,
      label: st,
      count:
        st.toLowerCase() === 'all'
          ? rawList.length
          : rawList.filter((item) => {
              const val = String((item as any)[filterKey] || '').trim().toLowerCase();
              return val === st.trim().toLowerCase();
            }).length,
    }));
  }, [data, filterTabs, filterKey, statusOptions]);

  // Dynamic searching and filtering logic
  const filteredData = useMemo(() => {
    const rawList = Array.isArray(data) ? data : [];

    // If no search keys or filter keys defined, assume parent passed pre-filtered data
    if (!searchKeys && !filterKey && !customFilterFn && !searchPredicate) {
      return rawList;
    }

    return rawList.filter((item) => {
      // 1. Status Filter Tab check (case-insensitive & trimmed)
      if (filterKey && currentTab && currentTab.trim().toLowerCase() !== 'all') {
        const val = String((item as any)[filterKey] || '').trim().toLowerCase();
        if (val !== currentTab.trim().toLowerCase()) return false;
      }

      // 2. Custom filter function check (e.g. service filter dropdown)
      if (customFilterFn && !customFilterFn(item)) {
        return false;
      }

      // 3. Search query check across specified searchKeys or searchPredicate
      const q = search.toLowerCase().trim();
      if (!q) return true;

      if (searchPredicate) {
        return searchPredicate(item, q);
      }

      if (searchKeys && searchKeys.length > 0) {
        return searchKeys.some((k) => {
          const val = (item as any)[k];
          if (Array.isArray(val)) {
            return val.some((v) => String(v).toLowerCase().includes(q));
          }
          return val != null && String(val).toLowerCase().includes(q);
        });
      }

      return true;
    });
  }, [data, searchKeys, filterKey, currentTab, search, customFilterFn, searchPredicate]);

  // Pagination calculation
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const paginatedData = useMemo(() => {
    if (!enablePagination) return filteredData;
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, enablePagination, currentPage, pageSize]);

  // Render toolbar actions (supporting both ReactNode and function)
  const renderedToolbarActions =
    typeof toolbarActions === 'function' ? toolbarActions(filteredData) : toolbarActions;

  return (
    <div className="bg-white rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
      {/* Top Toolbar */}
      {(searchable || renderedToolbarActions) && (
        <div className="p-4 sm:p-5 border-b border-border-subtle flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {searchable && (
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-text-light absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-bg-light border border-border-subtle text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-text-dark"
              />
            </div>
          )}

          {renderedToolbarActions && (
            <div className="flex flex-wrap items-center gap-2.5">
              {renderedToolbarActions}
            </div>
          )}
        </div>
      )}

      {/* Filter Tabs */}
      {computedFilterTabs.length > 0 && (
        <div className="px-4 py-2.5 bg-bg-light border-b border-border-subtle flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-text-light uppercase tracking-wider mr-2 shrink-0">
            {filterLabel}
          </span>
          {computedFilterTabs.map((tab) => {
            const isActive = currentTab.trim().toLowerCase() === tab.key.trim().toLowerCase();
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                type="button"
                className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'bg-white text-text-mid hover:bg-bg-subtle border border-border-subtle'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-brand-secondary text-white' : 'bg-bg-subtle text-text-light'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-light text-text-light font-bold uppercase tracking-wider text-[10px]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-3 px-4 ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  } ${col.headerClassName || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-bg-subtle">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-text-light">
                  <p className="font-bold text-sm text-text-dark">{emptyMessage}</p>
                  <p className="text-xs mt-1 text-text-light">{emptySubtext}</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const rowId = getRowId(row);
                return (
                  <tr
                    key={rowId}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`transition-colors ${
                      onRowClick ? 'hover:bg-brand-primary/5 cursor-pointer group' : 'hover:bg-bg-light'
                    }`}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`py-3.5 px-4 ${
                          col.align === 'right'
                            ? 'text-right'
                            : col.align === 'center'
                            ? 'text-center'
                            : 'text-left'
                        } ${col.cellClassName || ''}`}
                      >
                        {col.cell(row, idx)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Summary Footer */}
      {enablePagination ? (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      ) : (
        <div className="p-3.5 px-5 bg-bg-light border-t border-border-subtle flex items-center justify-between text-xs text-text-light">
          <span>
            Total: <b className="text-text-dark font-bold">{totalItems}</b> records
          </span>
          <span className="text-[11px] text-text-light">{footerLabel}</span>
        </div>
      )}
    </div>
  );
}
