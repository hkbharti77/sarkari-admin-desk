import React, { useState, useMemo, useEffect } from 'react';
import {
  CandidateDossier,
  PipelineStatus,
  RecruitmentNotification,
} from '../types/recruitment';
import { filterNotifications } from '../utils/recruitmentLogic';
import { StatusBadge } from './StatusBadge';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Pencil,
  Trash2,
  Check,
  Download,
  AlertTriangle,
  SlidersHorizontal,
} from 'lucide-react';

export type SortField =
  | 'id'
  | 'postTitle'
  | 'department'
  | 'payLevel'
  | 'vacancies'
  | 'deadlineDate'
  | 'examDate'
  | 'status';

export type SortOrder = 'asc' | 'desc';

const STATUS_TABS: Array<{ label: string; value: PipelineStatus | 'ALL' }> = [
  { label: 'All Requisitions', value: 'ALL' },
  { label: 'Application Open / Active', value: 'Application Open / Active' },
  { label: 'Admit Card / Active', value: 'Admit Card / Active' },
  { label: 'Answer Key Out', value: 'Answer Key Out' },
  { label: 'Result Announced', value: 'Result Announced' },
  { label: 'Pending / Scrutiny', value: 'Pending / Scrutiny' },
  { label: 'Rejected / Cancelled', value: 'Rejected / Cancelled' },
];

export interface RequisitionRosterTableProps {
  notifications: RecruitmentNotification[];
  candidates?: CandidateDossier[];
  selectedIds: string[];
  onToggleSelectRow: (id: string) => void;
  onSelectAllVisible: (ids: string[]) => void;
  onClearSelection: () => void;
  onStatusChange: (id: string, nextStatus: PipelineStatus) => void;
  onStartEdit: (job: RecruitmentNotification) => void;
  onDeleteNotification: (id: string) => void;
  onBatchApproveAdmitCards: () => void;
  onNavigateToResults: () => void;
  uniqueDepartments: string[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: PipelineStatus | 'ALL';
  setStatusFilter: (s: PipelineStatus | 'ALL') => void;
  departmentFilter: string;
  setDepartmentFilter: (d: string) => void;
  onExportCsv?: () => void;
}

export const RequisitionRosterTable: React.FC<RequisitionRosterTableProps> = ({
  notifications,
  selectedIds,
  onToggleSelectRow,
  onSelectAllVisible,
  onClearSelection,
  onStatusChange,
  onStartEdit,
  onDeleteNotification,
  onBatchApproveAdmitCards,
  onNavigateToResults,
  uniqueDepartments,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  departmentFilter,
  setDepartmentFilter,
  onExportCsv,
}) => {
  // ─── PAGINATION STATE ───────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [jumpPageInput, setJumpPageInput] = useState<string>('');

  // ─── SORTING & VIEW OPTIONS ─────────────────────────────────────────────────
  const [sortField, setSortField] = useState<SortField>('deadlineDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [isDense, setIsDense] = useState<boolean>(false);

  // Reset to page 1 whenever search, status, or department filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, departmentFilter, pageSize]);

  // ─── FILTERING ──────────────────────────────────────────────────────────────
  const filteredNotifications = useMemo(() => {
    return filterNotifications(notifications, {
      searchQuery,
      statusFilter,
      departmentFilter,
    });
  }, [notifications, searchQuery, statusFilter, departmentFilter]);

  // ─── SORTING ────────────────────────────────────────────────────────────────
  const sortedNotifications = useMemo(() => {
    const list = [...filteredNotifications];
    list.sort((a, b) => {
      let comp = 0;
      switch (sortField) {
        case 'id': {
          const valA = a.advtNo || a.id;
          const valB = b.advtNo || b.id;
          comp = valA.localeCompare(valB, undefined, { numeric: true });
          break;
        }
        case 'postTitle':
          comp = a.postTitle.localeCompare(b.postTitle);
          break;
        case 'department':
          comp = a.department.localeCompare(b.department);
          break;
        case 'payLevel':
          comp = a.payLevel.localeCompare(b.payLevel);
          break;
        case 'vacancies':
          comp = (a.vacancies || 0) - (b.vacancies || 0);
          break;
        case 'deadlineDate': {
          const dateA = a.deadlineDate ? new Date(a.deadlineDate).getTime() : 0;
          const dateB = b.deadlineDate ? new Date(b.deadlineDate).getTime() : 0;
          comp = dateA - dateB;
          break;
        }
        case 'examDate': {
          const dateA = a.examDate ? new Date(a.examDate).getTime() : 0;
          const dateB = b.examDate ? new Date(b.examDate).getTime() : 0;
          comp = dateA - dateB;
          break;
        }
        case 'status':
          comp = a.status.localeCompare(b.status);
          break;
        default:
          comp = 0;
      }
      return sortOrder === 'asc' ? comp : -comp;
    });
    return list;
  }, [filteredNotifications, sortField, sortOrder]);

  // ─── PAGINATION SLICE ───────────────────────────────────────────────────────
  const totalCount = sortedNotifications.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);
  const paginatedRows = useMemo(() => {
    return sortedNotifications.slice(startIndex, endIndex);
  }, [sortedNotifications, startIndex, endIndex]);

  const visibleRowIds = useMemo(() => paginatedRows.map((r) => r.id), [paginatedRows]);
  const allVisibleSelected =
    visibleRowIds.length > 0 && visibleRowIds.every((id) => selectedIds.includes(id));
  const someVisibleSelected =
    visibleRowIds.some((id) => selectedIds.includes(id)) && !allVisibleSelected;

  // Toggle sort field or direction
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-white/50 inline ml-1" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-[#F5B544] inline ml-1 stroke-[2.5]" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#F5B544] inline ml-1 stroke-[2.5]" />
    );
  };

  // Helper to generate numbered pagination with smart windowing
  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safeCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (safeCurrentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [
      1,
      '...',
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
      '...',
      totalPages,
    ];
  };

  const handleJumpToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      setCurrentPage(p);
      setJumpPageInput('');
    }
  };

  const handleSelectAllOnPage = () => {
    if (allVisibleSelected) {
      // Unselect only the visible ones
      onSelectAllVisible([]);
    } else {
      onSelectAllVisible(visibleRowIds);
    }
  };

  const handleSelectAllAcrossAllPages = () => {
    onSelectAllVisible(sortedNotifications.map((n) => n.id));
  };

  return (
    <div className="space-y-4 w-full min-w-0">
      {/* ── TOP CONTROL PANEL: Search, Commission Filter, Density, CSV Export ─ */}
      <section
        aria-label="Filter Recruitment Pipelines"
        className="elevation-1 rounded-[6px] p-4 space-y-4 w-full min-w-0 bg-white border border-[#E4E7EC]"
      >
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 w-full min-w-0">
          {/* Keyword Search Input */}
          <div className="relative flex-1 max-w-lg min-w-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#667085]">
              <Search className="w-4 h-4" aria-hidden="true" />
            </div>
            <input
              type="text"
              aria-label="Search notifications by post title, department, or advertisement number"
              placeholder="Search across 5,000+ Requisitions (e.g. RRB, UPSC, 2026/04, Station Master)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-[13px] leading-[18px] bg-white border border-[#D0D5DD] rounded-[4px] placeholder-[#98A2B3] focus:outline-none focus:ring-1 focus:ring-[#12305A] focus:border-[#12305A]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear keyword search"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#667085] hover:text-[#172033]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Toolbar Controls: Commission Filter, Density, Export */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            {/* Commission Select */}
            <div className="flex items-center gap-1.5">
              <label
                htmlFor="roster-department-select"
                className="text-[12px] font-semibold text-[#475467] whitespace-nowrap"
              >
                Commission:
              </label>
              <select
                id="roster-department-select"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-2.5 py-1.5 text-[12px] leading-[18px] bg-white border border-[#D0D5DD] rounded-[4px] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#12305A] max-w-[210px] truncate"
              >
                <option value="ALL">All Commissions ({notifications.length})</option>
                {uniqueDepartments.map((dept) => {
                  const deptCount = notifications.filter((n) => n.department === dept).length;
                  return (
                    <option key={dept} value={dept}>
                      {dept} ({deptCount})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Density Toggle */}
            <button
              type="button"
              onClick={() => setIsDense((prev) => !prev)}
              title={isDense ? 'Switch to Standard Spacing' : 'Switch to Compact High-Density Spacing'}
              className={`px-2.5 py-1.5 rounded-[4px] border text-[12px] font-medium flex items-center gap-1.5 transition-colors ${
                isDense
                  ? 'bg-[#12305A] text-white border-[#12305A]'
                  : 'bg-white border-[#D0D5DD] text-[#475467] hover:bg-[#F4F6FA]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isDense ? 'Compact' : 'Standard'}</span>
            </button>

            {/* Export CSV Button */}
            {onExportCsv && (
              <button
                type="button"
                onClick={onExportCsv}
                title="Export filtered requisitions to CSV format"
                className="px-3 py-1.5 rounded-[4px] bg-white border border-[#D0D5DD] text-[#12305A] hover:bg-[#F4F6FA] text-[12px] font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#12305A]" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Segmented Tabs + Batch Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#E4E7EC] w-full min-w-0">
          {/* Status Tabs */}
          <div
            role="tablist"
            aria-label="Status filters"
            className="flex flex-wrap items-center gap-1.5 min-w-0"
          >
            {STATUS_TABS.map((tab) => {
              const isActive = statusFilter === tab.value;
              const count =
                tab.value === 'ALL'
                  ? notifications.length
                  : notifications.filter((n) => n.status === tab.value).length;
              return (
                <button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-2.5 py-1 text-[12px] leading-[16px] font-medium rounded-[4px] transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#12305A] text-white font-semibold shadow-2xs'
                      : 'bg-white border border-[#D0D5DD] text-[#475467] hover:bg-[#F4F6FA] hover:text-[#172033]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] tabular-data ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#F4F6FA] text-[#667085]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Batch Actions Button */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-[#475467] tabular-data">
                {selectedIds.length} requisition(s) selected
              </span>
              <button
                type="button"
                onClick={onBatchApproveAdmitCards}
                className="px-3 py-1.5 rounded-[4px] bg-[#18864B] text-white text-[12px] font-semibold hover:bg-[#136A3B] transition-colors shadow-2xs"
              >
                Batch Issue Admit Cards
              </button>
              <button
                type="button"
                onClick={onClearSelection}
                className="px-2 py-1 text-[11px] text-[#667085] hover:text-[#172033] underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── SELECTION NOTICE BANNER (when all visible on page are checked) ── */}
      {allVisibleSelected && totalCount > pageSize && (
        <div className="bg-[#EEF4FF] border border-[#C7D7FE] rounded-[6px] px-4 py-2 text-[12px] text-[#12305A] flex flex-wrap items-center justify-between gap-2">
          <div>
            All <strong className="font-bold">{paginatedRows.length}</strong> requisitions on this page are selected.
          </div>
          {selectedIds.length < totalCount ? (
            <button
              type="button"
              onClick={handleSelectAllAcrossAllPages}
              className="text-[#1C4478] font-bold hover:underline"
            >
              Select all {totalCount.toLocaleString('en-IN')} requisitions matching current filter →
            </button>
          ) : (
            <span className="font-semibold text-[#18864B]">
              ✓ All {totalCount.toLocaleString('en-IN')} matching requisitions across all {totalPages} pages selected.
            </span>
          )}
        </div>
      )}

      {/* ── TOP PAGINATION RIBBON (Quick Info & Page Navigation) ──────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-[12px] text-[#667085]">
        <div>
          Showing{' '}
          <strong className="text-[#172033] tabular-data font-bold">
            {totalCount > 0 ? startIndex + 1 : 0} – {endIndex}
          </strong>{' '}
          of <strong className="text-[#172033] tabular-data font-bold">{totalCount.toLocaleString('en-IN')}</strong>{' '}
          Requisitions (Page <strong className="text-[#172033] tabular-data">{safeCurrentPage}</strong> of{' '}
          <strong className="text-[#172033] tabular-data">{totalPages}</strong>)
        </div>

        {/* Rows per page selector */}
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="px-2 py-1 bg-white border border-[#D0D5DD] rounded-[4px] text-[12px] font-semibold text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#12305A]"
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page (Default)</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        </div>
      </div>

      {/* ── MASTER DATA GRID: 10-Column Institutional Table ──────────────── */}
      <section
        aria-label="Recruitment Requisitions Roster"
        className="elevation-1 rounded-[6px] overflow-hidden w-full min-w-0 bg-white border border-[#E4E7EC]"
      >
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-[#12305A] text-white text-[12px] leading-[16px] font-semibold tracking-[0.02em] uppercase sticky top-0 z-10 select-none">
                <th className="py-3 px-3 w-[40px] text-center">
                  <input
                    type="checkbox"
                    aria-label="Select visible requisitions on this page"
                    checked={allVisibleSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someVisibleSelected;
                    }}
                    onChange={handleSelectAllOnPage}
                    className="rounded-[2px] text-[#12305A] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                </th>
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-3 whitespace-nowrap cursor-pointer hover:bg-[#1C4478] transition-colors"
                  title="Click to sort by Advertisement No / Reference ID"
                >
                  Advt No / Ref ID {renderSortIndicator('id')}
                </th>
                <th
                  onClick={() => handleSort('postTitle')}
                  className="py-3 px-3 cursor-pointer hover:bg-[#1C4478] transition-colors min-w-[220px]"
                  title="Click to sort by Post Title"
                >
                  Post Title & Commission {renderSortIndicator('postTitle')}
                </th>
                <th
                  onClick={() => handleSort('payLevel')}
                  className="py-3 px-3 whitespace-nowrap cursor-pointer hover:bg-[#1C4478] transition-colors"
                  title="Click to sort by Pay Scale"
                >
                  Pay Scale {renderSortIndicator('payLevel')}
                </th>
                <th
                  onClick={() => handleSort('vacancies')}
                  className="py-3 px-3 text-right whitespace-nowrap cursor-pointer hover:bg-[#1C4478] transition-colors"
                  title="Click to sort by Vacancies"
                >
                  Vacancies {renderSortIndicator('vacancies')}
                </th>
                <th
                  onClick={() => handleSort('deadlineDate')}
                  className="py-3 px-3 whitespace-nowrap cursor-pointer hover:bg-[#1C4478] transition-colors"
                  title="Click to sort by Last Date"
                >
                  Last Date {renderSortIndicator('deadlineDate')}
                </th>
                <th
                  onClick={() => handleSort('examDate')}
                  className="py-3 px-3 whitespace-nowrap cursor-pointer hover:bg-[#1C4478] transition-colors"
                  title="Click to sort by Exam Date"
                >
                  Exam Date {renderSortIndicator('examDate')}
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="py-3 px-3 whitespace-nowrap cursor-pointer hover:bg-[#1C4478] transition-colors"
                  title="Click to sort by Status"
                >
                  Lifecycle Status {renderSortIndicator('status')}
                </th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EC] text-[13px] leading-[18px]">
              {paginatedRows.map((item) => {
                const isChecked = selectedIds.includes(item.id);
                const rowPaddingClass = isDense ? 'py-1.5 px-3' : 'py-3 px-3';
                return (
                  <tr
                    key={item.id}
                    className={`group transition-colors ${
                      isChecked
                        ? 'bg-[#EEF4FF]'
                        : 'hover:bg-[#F9FAFB] bg-white'
                    }`}
                  >
                    <td className={`${rowPaddingClass} text-center`}>
                      <input
                        type="checkbox"
                        aria-label={`Select requisition ${item.advtNo}`}
                        checked={isChecked}
                        onChange={() => onToggleSelectRow(item.id)}
                        className="rounded-[2px] text-[#12305A] focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className={`${rowPaddingClass} whitespace-nowrap`}>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onStartEdit(item)}
                          className="font-bold text-[#12305A] hover:underline text-left block tabular-data"
                          title="Click to Edit Requisition"
                        >
                          {item.advtNo || item.id.replace(/^DRAFT-/i, '')}
                        </button>
                        {item.status === 'Pending / Scrutiny' && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]">
                            Draft
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#667085] tabular-data font-mono">
                        Ref: {item.id.replace(/^DRAFT-/i, '')}
                      </div>
                    </td>
                    <td className={`${rowPaddingClass} max-w-[280px]`}>
                      <button
                        type="button"
                        onClick={() => onStartEdit(item)}
                        className="font-semibold text-[#172033] hover:underline text-left line-clamp-1 block"
                        title="Click to Edit Requisition"
                      >
                        {item.postTitle}
                      </button>
                      <div className="text-[11px] text-[#475467] line-clamp-1">
                        {item.department}
                      </div>
                    </td>
                    <td className={`${rowPaddingClass} whitespace-nowrap`}>
                      <span className="px-2 py-0.5 rounded-[3px] bg-[#F4F6FA] text-[#172033] border border-[#E4E7EC] text-[11px] font-medium tabular-data">
                        {item.payLevel || 'N/A'}
                      </span>
                    </td>
                    <td className={`${rowPaddingClass} text-right font-bold tabular-data text-[#12305A]`}>
                      {item.vacancies ? item.vacancies.toLocaleString('en-IN') : 0}
                    </td>
                    <td className={`${rowPaddingClass} whitespace-nowrap text-[12px] tabular-data font-medium text-[#172033]`}>
                      {item.deadlineDate || '—'}
                    </td>
                    <td className={`${rowPaddingClass} whitespace-nowrap text-[12px] tabular-data text-[#475467]`}>
                      {item.examDate || 'Will be announced soon'}
                    </td>
                    <td className={`${rowPaddingClass} whitespace-nowrap`}>
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={item.status} size="sm" />
                        <select
                          value={item.status}
                          onChange={(e) =>
                            onStatusChange(item.id, e.target.value as PipelineStatus)
                          }
                          aria-label="Change status"
                          title="Quick status transition"
                          className="text-[11px] font-semibold text-[#12305A] bg-[#F8FAFC] border border-[#D0D5DD] rounded-[4px] px-1 py-0.5 hover:border-[#12305A] cursor-pointer"
                        >
                          <option value="Application Open / Active">Application Open / Active</option>
                          <option value="Pending / Scrutiny">Pending / Scrutiny</option>
                          <option value="Admit Card / Active">Admit Card / Active</option>
                          <option value="Answer Key Out">Answer Key Out</option>
                          <option value="Result Announced">Result Announced</option>
                          <option value="Rejected / Cancelled">Cancelled / Archived</option>
                        </select>
                      </div>
                    </td>
                    <td className={`${rowPaddingClass} text-right whitespace-nowrap`}>
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <a
                          href={`http://localhost:5173/job/${item.id.replace(/^DRAFT-/i, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          title="View on BharatRojgar public portal (opens new tab)"
                          className="px-2 py-0.5 text-[11px] font-bold rounded-[4px] bg-[#EEF4FF] text-[#12305A] hover:bg-[#DCE7FD] border border-[#C7D7FE] transition-colors inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#12305A]" />
                          <span>View</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => onStartEdit(item)}
                          title="Edit full notification (dates, fees, eligibility, links, faqs)"
                          className="px-2 py-0.5 text-[11px] font-bold rounded-[4px] bg-white text-[#172033] hover:bg-[#F4F6FA] border border-[#E4E7EC] transition-colors inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Pencil className="w-3 h-3 text-[#667085]" />
                          <span>Edit</span>
                        </button>

                        {item.status === 'Pending / Scrutiny' && (
                          <button
                            type="button"
                            onClick={() => onStatusChange(item.id, 'Admit Card / Active')}
                            title="Mark Admit Card Released"
                            className="px-2 py-0.5 text-[11px] font-semibold rounded-[4px] bg-[#12305A] text-white hover:bg-[#1C4478] transition-colors whitespace-nowrap"
                          >
                            Release Admit Card
                          </button>
                        )}
                        {item.status === 'Admit Card / Active' && (
                          <button
                            type="button"
                            onClick={onNavigateToResults}
                            title="Proceed to Results calibration"
                            className="px-2 py-0.5 text-[11px] font-semibold rounded-[4px] bg-[#F5B544] text-[#172033] hover:bg-[#E5A330] transition-colors whitespace-nowrap"
                          >
                            Enter Cutoffs
                          </button>
                        )}
                        {item.status === 'Result Announced' && (
                          <span className="text-[11px] font-semibold text-[#18864B] flex items-center gap-0.5">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            Live
                          </span>
                        )}
                        {item.status === 'Rejected / Cancelled' && (
                          <span className="text-[11px] text-[#D92D20] font-medium">
                            Archived
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => onDeleteNotification(item.id)}
                          title="Delete requisition from database"
                          className="px-2 py-0.5 text-[11px] font-bold rounded-[4px] bg-white text-[#D92D20] hover:bg-[#FEF3F2] border border-[#FECDCA] transition-colors inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Trash2 className="w-3 h-3 text-[#D92D20]" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#667085]">
                    <div className="max-w-sm mx-auto space-y-2">
                      <AlertTriangle className="w-8 h-8 text-[#98A2B3] mx-auto" />
                      <div className="font-semibold text-[#172033]">
                        No recruitment pipelines match active filters
                      </div>
                      <p className="text-[12px]">
                        Try clearing your search keyword or switching the status filter tab above.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('ALL');
                          setDepartmentFilter('ALL');
                        }}
                        className="mt-2 text-[12px] font-semibold text-[#12305A] underline"
                      >
                        Reset all filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── BOTTOM PAGINATION TOOLBAR & PAGE SELECTOR ───────────────────── */}
        <div className="bg-[#F9FAFB] border-t border-[#E4E7EC] px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[12px] text-[#667085] tabular-data w-full min-w-0">
          {/* Left: Summary text */}
          <div className="flex items-center gap-3">
            <div>
              Showing <strong className="text-[#172033] font-bold">{totalCount > 0 ? startIndex + 1 : 0} – {endIndex}</strong> of{' '}
              <strong className="text-[#172033] font-bold">{totalCount.toLocaleString('en-IN')}</strong> Requisitions
            </div>
            {totalCount < notifications.length && (
              <span className="text-[11px] text-[#475467] bg-[#E4E7EC] px-1.5 py-0.5 rounded">
                Filtered from {notifications.length.toLocaleString('en-IN')} total
              </span>
            )}
          </div>

          {/* Center: Numeric Page Buttons & Navigation */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {/* First Page */}
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={safeCurrentPage === 1}
                aria-label="Go to First Page"
                title="First Page"
                className="p-1.5 rounded-[4px] border border-[#D0D5DD] bg-white text-[#475467] hover:bg-[#F4F6FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Prev Page */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={safeCurrentPage === 1}
                aria-label="Previous Page"
                title="Previous Page"
                className="px-2.5 py-1 rounded-[4px] border border-[#D0D5DD] bg-white text-[#475467] hover:bg-[#F4F6FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              {/* Numbered Page Buttons */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((pageNum, idx) => {
                  if (pageNum === '...') {
                    return (
                      <span key={`dots-${idx}`} className="px-1 text-[#98A2B3] select-none">
                        …
                      </span>
                    );
                  }
                  const isCurrent = pageNum === safeCurrentPage;
                  return (
                    <button
                      key={`page-${pageNum}`}
                      type="button"
                      onClick={() => setCurrentPage(pageNum as number)}
                      className={`min-w-[32px] h-[30px] px-2 text-[12px] font-bold rounded-[4px] transition-colors ${
                        isCurrent
                          ? 'bg-[#12305A] text-white shadow-2xs'
                          : 'bg-white border border-[#D0D5DD] text-[#475467] hover:bg-[#F4F6FA]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Page */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={safeCurrentPage === totalPages}
                aria-label="Next Page"
                title="Next Page"
                className="px-2.5 py-1 rounded-[4px] border border-[#D0D5DD] bg-white text-[#475467] hover:bg-[#F4F6FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-1"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Last Page */}
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage === totalPages}
                aria-label="Go to Last Page"
                title="Last Page"
                className="p-1.5 rounded-[4px] border border-[#D0D5DD] bg-white text-[#475467] hover:bg-[#F4F6FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Right: Direct Page Jump */}
          {totalPages > 1 && (
            <form onSubmit={handleJumpToPage} className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] text-[#667085]">Go to:</span>
              <input
                type="number"
                min={1}
                max={totalPages}
                placeholder={String(safeCurrentPage)}
                value={jumpPageInput}
                onChange={(e) => setJumpPageInput(e.target.value)}
                className="w-14 px-1.5 py-0.5 text-center text-[12px] font-bold bg-white border border-[#D0D5DD] rounded-[4px] focus:outline-none focus:ring-1 focus:ring-[#12305A]"
              />
              <button
                type="submit"
                className="px-2 py-0.5 text-[11px] font-bold bg-[#12305A] text-white rounded-[4px] hover:bg-[#1C4478] transition-colors"
              >
                Go
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
export default RequisitionRosterTable;
