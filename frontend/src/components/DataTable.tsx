import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, Inbox } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  minWidth?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  headerClassName?: string;
  stickyLeft?: string;
  stickyShadow?: boolean;
}

export interface ServerPaginationProps {
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  pageSize?: number;
  isLoading?: boolean;
  emptyMessage?: string;
  serverPagination?: ServerPaginationProps;
  renderMobileCard?: (item: T) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  pageSize = 20,
  isLoading = false,
  emptyMessage = 'No records found matching your search or filters.',
  serverPagination,
  renderMobileCard,
}: DataTableProps<T>) {
  const [clientPage, setClientPage] = useState(1);
  const [sortIndex, setSortIndex] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [isDesktopWidth, setIsDesktopWidth] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktopWidth(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isServer = Boolean(serverPagination);
  
  const currentPage = isServer ? serverPagination!.page : clientPage;
  const currentLimit = isServer ? serverPagination!.limit : pageSize;
  const totalRecords = isServer ? serverPagination!.total : data.length;
  const totalPages = Math.ceil(totalRecords / currentLimit) || 1;

  const startIndex = (currentPage - 1) * currentLimit;
  const paginatedData = isServer ? data : data.slice(startIndex, startIndex + currentLimit);

  const handlePageChange = (newPage: number) => {
    const validPage = Math.max(1, Math.min(totalPages, newPage));
    if (isServer) {
      serverPagination!.onPageChange(validPage);
    } else {
      setClientPage(validPage);
    }
  };

  const handleSort = (index: number) => {
    if (sortIndex === index) {
      setSortAsc(!sortAsc);
    } else {
      setSortIndex(index);
      setSortAsc(true);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#FFFFFF] rounded-xl border border-[#D6D6D6] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
          <div className="h-4 bg-[#E5E5E5] rounded w-1/4 animate-pulse"></div>
          <div className="h-4 bg-[#E5E5E5] rounded w-1/6 animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-[#F2F2F2] rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFFFF] rounded-xl border border-[#D6D6D6] shadow-xs overflow-hidden flex flex-col transition-colors">
      {/* Mobile Card View (< 768px) if renderMobileCard is provided */}
      {renderMobileCard && (
        <div className="block md:hidden p-3 sm:p-4 space-y-3 bg-[#FAFAFA] border-b border-[#D6D6D6]">
          {paginatedData.length === 0 ? (
            <div className="p-8 text-center bg-[#FFFFFF] rounded-xl border border-[#D6D6D6] space-y-2">
              <Inbox className="w-8 h-8 text-[#666666] mx-auto" />
              <p className="text-sm font-bold text-[#111111]">{emptyMessage}</p>
            </div>
          ) : (
            paginatedData.map((row) => (
              <React.Fragment key={keyExtractor(row)}>
                {renderMobileCard(row)}
              </React.Fragment>
            ))
          )}
        </div>
      )}

      {/* Desktop & Tablet Table View */}
      <div className={`${renderMobileCard ? 'hidden md:block' : 'block'} overflow-x-auto w-full scrollbar-thin`}>
        <table className="w-full text-left text-[14px] text-[#111111] border-collapse font-sans">
          <thead className="bg-[#111111] text-[#FFFFFF] font-semibold uppercase tracking-wider text-[12px] sm:text-[13px] border-b border-[#000000]">
            <tr>
              {columns.map((col, idx) => {
                const alignment = col.align === 'right' ? 'justify-end text-right' : col.align === 'center' ? 'justify-center text-center' : 'justify-start text-left';
                const isSticky = isDesktopWidth && Boolean(col.stickyLeft);
                const stickyStyles: React.CSSProperties = isSticky
                  ? { position: 'sticky', left: col.stickyLeft, zIndex: 30 }
                  : {};

                return (
                  <th
                    key={idx}
                    style={{ minWidth: col.minWidth, ...stickyStyles }}
                    className={`px-4 py-3.5 whitespace-nowrap select-none bg-[#111111] text-[#FFFFFF] font-semibold ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    } ${
                      isSticky && col.stickyShadow
                        ? 'border-r border-[#333333] shadow-[4px_0_8px_-3px_rgba(0,0,0,0.25)]'
                        : ''
                    } ${col.headerClassName || ''}`}
                    onClick={() => col.sortable && handleSort(idx)}
                  >
                    <div className={`flex items-center gap-1.5 ${alignment} ${col.sortable ? 'cursor-pointer hover:text-[#FACC15] transition-colors' : ''}`}>
                      <span>{col.header}</span>
                      {col.sortable && <ArrowUpDown className="w-3.5 h-3.5 text-[#FACC15] shrink-0" />}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E5E5] font-normal text-[14px] bg-[#FFFFFF]">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-[#666666] font-medium">
                  <div className="space-y-2">
                    <Inbox className="w-9 h-9 text-[#666666] mx-auto" />
                    <p className="text-sm font-semibold">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr key={keyExtractor(row)} className="group hover:bg-[#FFFBE6] transition-colors">
                  {columns.map((col, idx) => {
                    const isSticky = isDesktopWidth && Boolean(col.stickyLeft);
                    const stickyStyles: React.CSSProperties = isSticky
                      ? { position: 'sticky', left: col.stickyLeft, zIndex: 20 }
                      : {};

                    return (
                      <td
                        key={idx}
                        style={{ minWidth: col.minWidth, ...stickyStyles }}
                        className={`px-4 py-3.5 text-[#111111] ${
                          isSticky ? 'bg-[#FFFFFF] group-hover:bg-[#FFFBE6]' : ''
                        } ${
                          col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                        } ${
                          isSticky && col.stickyShadow
                            ? 'border-r border-[#D6D6D6] shadow-[4px_0_8px_-3px_rgba(0,0,0,0.06)]'
                            : ''
                        } ${col.className || ''}`}
                      >
                        {typeof col.accessor === 'function'
                          ? col.accessor(row)
                          : col.accessor
                          ? (row[col.accessor] as any)
                          : null}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-[#FAFAFA] px-4 py-3 border-t border-[#D6D6D6] flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] sm:text-[14px] text-[#111111]">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            Showing <span className="font-semibold text-[#000000] tabular-nums">{totalRecords === 0 ? 0 : startIndex + 1}</span> to{' '}
            <span className="font-semibold text-[#000000] tabular-nums">{Math.min(startIndex + currentLimit, totalRecords)}</span> of{' '}
            <span className="font-semibold text-[#000000] tabular-nums">{totalRecords}</span> records
          </div>

          {isServer && serverPagination?.onLimitChange && (
            <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
              <span className="text-xs font-semibold text-[#666666]">Per page:</span>
              <select
                value={serverPagination.limit}
                onChange={(e) => serverPagination.onLimitChange!(parseInt(e.target.value, 10))}
                className="min-h-[36px] px-2.5 py-1 text-xs bg-[#FFFFFF] border border-[#D6D6D6] rounded-lg font-bold text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#FACC15]"
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="min-h-[40px] min-w-[40px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center p-2 rounded-lg bg-[#FFFFFF] border border-[#D6D6D6] text-[#111111] hover:bg-[#F2F2F2] disabled:opacity-40 disabled:hover:bg-[#FFFFFF] transition-colors cursor-pointer"
            title="First Page"
            aria-label="First Page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="min-h-[40px] min-w-[40px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center p-2 rounded-lg bg-[#FFFFFF] border border-[#D6D6D6] text-[#111111] hover:bg-[#F2F2F2] disabled:opacity-40 disabled:hover:bg-[#FFFFFF] transition-colors cursor-pointer"
            title="Previous Page"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3.5 py-2 sm:py-1 bg-[#FFFFFF] border border-[#D6D6D6] rounded-lg font-semibold text-[#000000] text-xs sm:text-sm tabular-nums">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="min-h-[40px] min-w-[40px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center p-2 rounded-lg bg-[#FFFFFF] border border-[#D6D6D6] text-[#111111] hover:bg-[#F2F2F2] disabled:opacity-40 disabled:hover:bg-[#FFFFFF] transition-colors cursor-pointer"
            title="Next Page"
            aria-label="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="min-h-[40px] min-w-[40px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center p-2 rounded-lg bg-[#FFFFFF] border border-[#D6D6D6] text-[#111111] hover:bg-[#F2F2F2] disabled:opacity-40 disabled:hover:bg-[#FFFFFF] transition-colors cursor-pointer"
            title="Last Page"
            aria-label="Last Page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
