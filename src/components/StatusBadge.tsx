import React from 'react';
import { PipelineStatus } from '../types/recruitment';
import { CheckCircle2, Clock, Award, XCircle, FileText, KeyRound } from 'lucide-react';

interface StatusBadgeProps {
  status: PipelineStatus;
  size?: 'sm' | 'md';
}

/**
 * GovJob Admin Status Badges per Design System Specification:
 * - Application Open / Active: #027A48 text on #ECFDF3 background with #A6F4C5 border.
 * - Admit Card / Active: #18864B text on #ECFDF3 background with #A6F4C5 border.
 * - Answer Key Out: #792E9D text on #F9F5FF background with #E9D7FE border.
 * - Pending / Scrutiny: #D97706 text on #FFFBEB background with #FDE68A border.
 * - Result Announced: #12305A text on #EFF4FB background with #C7D7EE border.
 * - Rejected / Cancelled: #DC2626 text on #FEF2F2 background with #FECACA border.
 * Micro-radii of 0.25rem (4px) and heightened letter-spacing at 11px-12px.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px] leading-[14px] tracking-[0.04em]'
      : 'px-2.5 py-1 text-[12px] leading-[16px] tracking-[0.02em]';

  switch (status) {
    case 'Application Open / Active':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-[4px] border whitespace-nowrap shrink-0 bg-[#ECFDF3] text-[#027A48] border-[#A6F4C5] ${sizeClasses}`}
        >
          <FileText className="w-3.5 h-3.5 shrink-0 text-[#027A48]" aria-hidden="true" />
          <span>Application Open / Active</span>
        </span>
      );
    case 'Admit Card / Active':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-[4px] border whitespace-nowrap shrink-0 bg-[#ECFDF3] text-[#18864B] border-[#A6F4C5] ${sizeClasses}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#18864B]" aria-hidden="true" />
          <span>Admit Card / Active</span>
        </span>
      );
    case 'Answer Key Out':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-[4px] border whitespace-nowrap shrink-0 bg-[#F9F5FF] text-[#6941C6] border-[#E9D7FE] ${sizeClasses}`}
        >
          <KeyRound className="w-3.5 h-3.5 shrink-0 text-[#6941C6]" aria-hidden="true" />
          <span>Answer Key Out</span>
        </span>
      );
    case 'Pending / Scrutiny':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-[4px] border whitespace-nowrap shrink-0 bg-[#FFFBEB] text-[#D97706] border-[#FDE68A] ${sizeClasses}`}
        >
          <Clock className="w-3.5 h-3.5 shrink-0 text-[#D97706]" aria-hidden="true" />
          <span>Pending / Scrutiny</span>
        </span>
      );
    case 'Result Announced':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-[4px] border whitespace-nowrap shrink-0 bg-[#EFF4FB] text-[#12305A] border-[#C7D7EE] ${sizeClasses}`}
        >
          <Award className="w-3.5 h-3.5 shrink-0 text-[#12305A]" aria-hidden="true" />
          <span>Result Announced</span>
        </span>
      );
    case 'Rejected / Cancelled':
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-[4px] border whitespace-nowrap shrink-0 bg-[#FEF2F2] text-[#DC2626] border-[#FECACA] ${sizeClasses}`}
        >
          <XCircle className="w-3.5 h-3.5 shrink-0 text-[#DC2626]" aria-hidden="true" />
          <span>Rejected / Cancelled</span>
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-semibold rounded-[4px] border whitespace-nowrap shrink-0 bg-[#F4F6FA] text-[#667085] border-[#E4E7EC] ${sizeClasses}`}
        >
          <span>{status || 'Recorded'}</span>
        </span>
      );
  }
};
