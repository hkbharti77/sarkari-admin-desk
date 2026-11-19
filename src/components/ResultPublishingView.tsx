import React, { useState, useEffect } from 'react';
import {
  CategoryBreakdown,
  PipelineStatus,
  RecruitmentNotification,
} from '../types/recruitment';
import { StatusBadge } from './StatusBadge';
import { Award, CheckCircle2, Send, SlidersHorizontal, FileCheck2 } from 'lucide-react';

interface ResultPublishingViewProps {
  notifications: RecruitmentNotification[];
  onPublishResult: (
    notificationId: string,
    cutoffMarks: CategoryBreakdown,
    gazetteRef: string,
    newStatus: PipelineStatus
  ) => void;
}

export const ResultPublishingView: React.FC<ResultPublishingViewProps> = ({
  notifications,
  onPublishResult,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    notifications[0]?.id ?? ''
  );

  const activeNotif =
    notifications.find((n) => n.id === selectedId) ?? notifications[0];

  const [cutoffs, setCutoffs] = useState<CategoryBreakdown>(
    activeNotif?.cutoffMarks ?? { UR: 0, OBC: 0, SC: 0, ST: 0, EWS: 0 }
  );
  const [gazetteInput, setGazetteInput] = useState<string>(
    activeNotif?.gazetteRef ?? ''
  );
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  useEffect(() => {
    if (activeNotif) {
      if (!selectedId) setSelectedId(activeNotif.id);
      setCutoffs(activeNotif.cutoffMarks || { UR: 0, OBC: 0, SC: 0, ST: 0, EWS: 0 });
      setGazetteInput(activeNotif.gazetteRef || '');
    }
  }, [activeNotif?.id]);

  const handleSelectNotification = (notif: RecruitmentNotification) => {
    setSelectedId(notif.id);
    setCutoffs({ ...notif.cutoffMarks });
    setGazetteInput(notif.gazetteRef);
    setFeedbackBanner(null);
  };

  const handleCutoffChange = (cat: keyof CategoryBreakdown, value: string) => {
    const parsed = parseFloat(value);
    setCutoffs((prev) => ({
      ...prev,
      [cat]: Number.isFinite(parsed) ? parsed : 0,
    }));
  };

  const handleReleaseResults = (targetStatus: PipelineStatus) => {
    if (!activeNotif) return;
    const cleanGazette = gazetteInput.trim() || activeNotif.gazetteRef || `GSR-${activeNotif.id}(E)/${new Date().getFullYear()}`;
    onPublishResult(activeNotif.id, cutoffs, cleanGazette, targetStatus);
    setFeedbackBanner(
      targetStatus === 'Result Announced'
        ? `Official Merit List & Cutoff Gazette (${cleanGazette}) published for ${activeNotif.advtNo}.`
        : `Admit Card batch & examination center allocation activated for ${activeNotif.advtNo}.`
    );
  };

  if (notifications.length === 0) {
    return (
      <div className="elevation-1 rounded-[6px] p-12 text-center bg-white border border-[#E4E7EC]">
        <Award className="w-10 h-10 text-[#667085] mx-auto mb-3" />
        <h3 className="text-[16px] font-semibold text-[#172033]">
          No Examination Pipelines Available
        </h3>
        <p className="text-[13px] text-[#667085] mt-1 max-w-md mx-auto">
          Requisitions must be published before configuring qualifying cutoffs or releasing Gazette result merit lists.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full min-w-0">
      {feedbackBanner && (
        <div
          role="status"
          className="p-3.5 rounded-[4px] bg-[#ECFDF3] border border-[#A6F4C5] text-[#18864B] text-[13px] font-medium flex items-center justify-between gap-3 w-full min-w-0"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{feedbackBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackBanner(null)}
            className="text-[12px] font-semibold underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full min-w-0">
        {/* Left: Examination Cycles List */}
        <div className="lg:col-span-7 elevation-1 rounded-[6px] overflow-hidden w-full min-w-0">
          <div className="px-4 py-3 border-b border-[#E4E7EC] flex items-center justify-between bg-white">
            <div>
              <h3 className="text-[16px] leading-[24px] font-semibold text-[#172033]">
                Examination Cycles & Merit List Pipelines
              </h3>
              <p className="text-[12px] text-[#667085]">
                Select a recruitment requisition to configure category cutoffs or publish results
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F4F6FA] border-b border-[#E4E7EC] text-[12px] leading-[16px] font-bold uppercase tracking-[0.02em] text-[#667085]">
                  <th className="py-2.5 px-4 whitespace-nowrap">Requisition / Advt No.</th>
                  <th className="py-2.5 px-4 whitespace-nowrap">Examination Title</th>
                  <th className="py-2.5 px-4 text-right whitespace-nowrap">UR Cutoff</th>
                  <th className="py-2.5 px-4 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC] text-[14px]">
                {notifications.map((notif) => {
                  const isSelected = activeNotif?.id === notif.id;
                  return (
                    <tr
                      key={notif.id}
                      onClick={() => handleSelectNotification(notif)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#EFF4FB] hover:bg-[#E5EEF9]'
                          : 'bg-white hover:bg-[#F4F6FA]/70'
                      }`}
                    >
                      <td className="py-2.5 px-4 tabular-data whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleSelectNotification(notif)}
                          className="font-semibold text-[#12305A] hover:underline text-left block"
                        >
                          {notif.id}
                        </button>
                        <div className="text-[12px] text-[#667085]">{notif.advtNo}</div>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-medium text-[#172033] line-clamp-1">
                          {notif.postTitle}
                        </div>
                        <div className="text-[12px] text-[#667085] tabular-data">
                          Exam: {notif.examDate} · Gazette: {notif.gazetteRef}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right font-semibold text-[#172033] tabular-data whitespace-nowrap">
                        {(notif.cutoffMarks?.UR ?? 0).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <StatusBadge status={notif.status} size="sm" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Cutoff Calibration & Gazette Result Publisher */}
        <div className="lg:col-span-5 elevation-1 rounded-[6px] overflow-hidden w-full min-w-0">
          {activeNotif && (
            <div>
              <div className="px-5 py-4 bg-[#12305A] text-white">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#F5B544] tabular-data">
                    Gazette Result Console · {activeNotif.id}
                  </span>
                  <StatusBadge status={activeNotif.status} size="sm" />
                </div>
                <h3 className="text-[16px] leading-[24px] font-semibold mt-1">
                  {activeNotif.postTitle}
                </h3>
                <p className="text-[12px] text-[#d6e3ff] mt-0.5 tabular-data">
                  {activeNotif.department} · Vacancies: {activeNotif.vacancies.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="p-5 space-y-4">
                {/* Category Cutoff Marks Calibration */}
                <div>
                  <div className="flex items-center gap-2 mb-2.5">
                    <SlidersHorizontal className="w-4 h-4 text-[#12305A]" aria-hidden="true" />
                    <h4 className="text-[12px] font-semibold uppercase tracking-[0.02em] text-[#172033]">
                      Qualifying Cutoff Marks by Statutory Category
                    </h4>
                  </div>

                  <div className="grid grid-cols-5 gap-2.5">
                    {(['UR', 'OBC', 'SC', 'ST', 'EWS'] as const).map((cat) => (
                      <div key={cat}>
                        <label
                          htmlFor={`cutoff-${cat}`}
                          className="block text-[11px] font-semibold text-[#667085] mb-1 text-center"
                        >
                          {cat}
                        </label>
                        <input
                          id={`cutoff-${cat}`}
                          type="number"
                          step="0.25"
                          value={cutoffs[cat]}
                          onChange={(e) => handleCutoffChange(cat, e.target.value)}
                          className="gov-input w-full px-2 text-center text-[13px] font-semibold tabular-data"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Seat Allocation Summary */}
                <div className="p-3.5 rounded-[4px] bg-[#F4F6FA] border border-[#E4E7EC]">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#667085] mb-2">
                    Sanctioned Category Seat Matrix
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-center text-[12px] tabular-data">
                    {(['UR', 'OBC', 'SC', 'ST', 'EWS'] as const).map((cat) => (
                      <div
                        key={cat}
                        className="bg-white border border-[#E4E7EC] rounded-[4px] py-1.5 px-1"
                      >
                        <div className="text-[11px] text-[#667085]">{cat} Seats</div>
                        <div className="font-bold text-[#172033]">
                          {activeNotif.categoryBreakdown?.[cat] ?? 0}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gazette Notification Reference Number */}
                <div>
                  <label
                    htmlFor="gazette-ref-input"
                    className="block text-[12px] font-medium text-[#172033] mb-1"
                  >
                    Official Gazette Notification Reference (e-Gazette ID)
                  </label>
                  <input
                    id="gazette-ref-input"
                    type="text"
                    value={gazetteInput}
                    onChange={(e) => setGazetteInput(e.target.value)}
                    className="gov-input w-full px-3 text-[13px] tabular-data"
                  />
                </div>

                <div className="pt-3 border-t border-[#E4E7EC] flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleReleaseResults('Result Announced')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-[4px] bg-[#12305A] text-white text-[13px] font-semibold hover:bg-[#1C4478] active:bg-[#0D2240] transition-colors whitespace-nowrap shrink-0"
                  >
                    <Award className="w-4 h-4 text-[#F5B544]" aria-hidden="true" />
                    <span>Publish Final Result Gazette</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReleaseResults('Admit Card / Active')}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[4px] bg-white border border-[#E4E7EC] text-[#172033] text-[13px] font-semibold hover:bg-[#F4F6FA] transition-colors whitespace-nowrap shrink-0"
                  >
                    <FileCheck2 className="w-4 h-4 text-[#18864B]" aria-hidden="true" />
                    <span>Release Admit Cards</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
