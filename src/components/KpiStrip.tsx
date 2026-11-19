import React from 'react';
import { KpiSummary, PipelineStatus } from '../types/recruitment';
import { Briefcase, Users, AlertTriangle, FileCheck2 } from 'lucide-react';

interface KpiStripProps {
  kpi: KpiSummary;
  activeStatusFilter: PipelineStatus | 'ALL';
  onSelectChannel: (status: PipelineStatus | 'ALL') => void;
}

/**
 * KPI Cards per GovJob Admin Specification:
 * - Top 3px accent line (using #12305A, #F5B544, or #18864B to indicate portal channel status:
 *   Vacancies, Applications Received, Verification Pending, Results Live).
 * - Metrics use 28px bold numerical type (line-height 36px, tracking -0.02em)
 *   with 12px trend metadata directly beneath.
 * - Level 1 surface (#FFFFFF, 1px solid #E4E7EC, subtle baseline shadow).
 */
export const KpiStrip: React.FC<KpiStripProps> = ({
  kpi,
  activeStatusFilter,
  onSelectChannel,
}) => {
  const cards = [
    {
      id: 'kpi-vacancies',
      label: 'Vacancies (Sanctioned)',
      value: kpi.totalVacancies.toLocaleString('en-IN'),
      trend: `${kpi.activeRequisitionsCount} Active Requisition(s) · Sanctioned Roster`,
      accentHex: '#12305A',
      topBorderClass: 'border-t-[3px] border-t-[#12305A]',
      icon: Briefcase,
      iconColor: 'text-[#12305A]',
      targetFilter: 'ALL' as const,
      badgeText: 'Portal Channel: Active',
    },
    {
      id: 'kpi-applications',
      label: 'Applications Received',
      value: kpi.totalApplicationsReceived.toLocaleString('en-IN'),
      trend:
        kpi.totalApplicationsReceived > 0
          ? `${kpi.admitCardsIssuedTotal.toLocaleString('en-IN')} Admit Cards Issued (${Math.round(
              (kpi.admitCardsIssuedTotal / kpi.totalApplicationsReceived) * 100
            )}%)`
          : 'Tracking All Registered Applicants',
      accentHex: '#12305A',
      topBorderClass: 'border-t-[3px] border-t-[#12305A]',
      icon: Users,
      iconColor: 'text-[#12305A]',
      targetFilter: 'Admit Card / Active' as const,
      badgeText: 'Admit Cards Live',
    },
    {
      id: 'kpi-scrutiny',
      label: 'Verification Pending',
      value: kpi.verificationPendingCount.toLocaleString('en-IN'),
      trend: 'Requires Scrutiny Before Admit Lock',
      accentHex: '#F5B544',
      topBorderClass: 'border-t-[3px] border-t-[#F5B544]',
      icon: AlertTriangle,
      iconColor: 'text-[#D97706]',
      targetFilter: 'Pending / Scrutiny' as const,
      badgeText: 'Priority Action',
    },
    {
      id: 'kpi-results',
      label: 'Results Live',
      value: kpi.resultsLiveCount.toLocaleString('en-IN'),
      trend: 'Final Merit Lists & Cutoffs Published',
      accentHex: '#18864B',
      topBorderClass: 'border-t-[3px] border-t-[#18864B]',
      icon: FileCheck2,
      iconColor: 'text-[#18864B]',
      targetFilter: 'Result Announced' as const,
      badgeText: 'Verified Cycles',
    },
  ];

  return (
    <section
      aria-label="Portal Channel Key Performance Indicators"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full min-w-0"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeStatusFilter === card.targetFilter && card.targetFilter !== 'ALL';
        return (
          <button
            key={card.id}
            type="button"
            onClick={() =>
              onSelectChannel(
                activeStatusFilter === card.targetFilter ? 'ALL' : card.targetFilter
              )
            }
            data-testid={card.id}
            className={`text-left rounded-[6px] bg-white border border-[#E4E7EC] ${card.topBorderClass} p-4 sm:p-5 transition-colors hover:bg-[#F9FAFB] focus-visible:outline-2 focus-visible:outline-[#12305A] w-full min-w-0 ${
              isSelected ? 'ring-2 ring-[#12305A]/20 bg-[#F9F9FF]' : ''
            }`}
            style={{
              boxShadow: '0 1px 2px 0 rgba(18, 48, 90, 0.05)',
            }}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <span className="text-[12px] leading-[16px] font-medium tracking-[0.02em] text-[#667085] uppercase">
                {card.label}
              </span>
              <Icon className={`w-4 h-4 shrink-0 ${card.iconColor}`} aria-hidden="true" />
            </div>

            <div
              className="text-[28px] leading-[36px] font-bold tracking-[-0.02em] text-[#172033] tabular-data my-1"
              data-testid={`${card.id}-value`}
            >
              {card.value}
            </div>

            <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[#E4E7EC]/70">
              <span className="text-[12px] leading-[16px] text-[#667085] tabular-data">
                {card.trend}
              </span>
            </div>
          </button>
        );
      })}
    </section>
  );
};
