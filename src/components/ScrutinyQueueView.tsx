import React, { useState, useEffect } from 'react';
import {
  CandidateDocuments,
  CandidateDossier,
  PipelineStatus,
} from '../types/recruitment';
import {
  evaluateCandidateReadiness,
  filterCandidates,
} from '../utils/recruitmentLogic';
import { StatusBadge } from './StatusBadge';
import {
  Search,
  Check,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  FileText,
  UserCheck,
} from 'lucide-react';

interface ScrutinyQueueViewProps {
  candidates: CandidateDossier[];
  onUpdateCandidate: (
    rollNumber: string,
    updates: Partial<CandidateDossier>,
    auditDescription: string
  ) => void;
}

const DOC_KEYS: Array<{
  key: keyof CandidateDocuments;
  label: string;
  code: string;
}> = [
  {
    key: 'photoSignature',
    label: 'ICAO Biometric Photograph & Scanned Signature Specimen',
    code: 'DOC-01',
  },
  {
    key: 'nationalId',
    label: 'UIDAI Aadhaar / Passport / EPIC Government Photo Identity',
    code: 'DOC-02',
  },
  {
    key: 'degreeCertificate',
    label: 'UGC Recognized Bachelor Degree & Consolidated Transcript',
    code: 'DOC-03',
  },
  {
    key: 'categoryCertificate',
    label: 'Central Format Caste / EWS / Domicile Certificate (Tehsildar Signed)',
    code: 'DOC-04',
  },
  {
    key: 'feeReceipt',
    label: 'SBI e-MOPS Treasury Fee Challan Reconciliation',
    code: 'DOC-05',
  },
];

export const ScrutinyQueueView: React.FC<ScrutinyQueueViewProps> = ({
  candidates,
  onUpdateCandidate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PipelineStatus | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedRoll, setSelectedRoll] = useState<string>(
    candidates[0]?.rollNumber ?? ''
  );
  const [remarksInput, setRemarksInput] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const filteredCandidates = filterCandidates(candidates, {
    searchQuery,
    statusFilter,
    categoryFilter,
  });

  useEffect(() => {
    if (!selectedRoll && filteredCandidates.length > 0) {
      setSelectedRoll(filteredCandidates[0].rollNumber);
    }
  }, [candidates, filteredCandidates, selectedRoll]);

  const activeCandidate =
    candidates.find((c) => c.rollNumber === selectedRoll) ??
    filteredCandidates[0] ??
    null;

  const readiness = activeCandidate
    ? evaluateCandidateReadiness(activeCandidate)
    : null;

  const handleToggleDocument = (docKey: keyof CandidateDocuments) => {
    if (!activeCandidate) return;
    setValidationError(null);
    const updatedDocs = {
      ...activeCandidate.documents,
      [docKey]: !activeCandidate.documents[docKey],
    };
    onUpdateCandidate(
      activeCandidate.rollNumber,
      { documents: updatedDocs },
      `Updated document verification checklist (${docKey}) for Roll No. ${activeCandidate.rollNumber}`
    );
  };

  const handleApproveCandidate = () => {
    if (!activeCandidate) return;
    setValidationError(null);
    const updatedDocs: CandidateDocuments = {
      photoSignature: true,
      nationalId: true,
      degreeCertificate: true,
      categoryCertificate: true,
      feeReceipt: true,
    };
    const finalRemark =
      remarksInput.trim() ||
      'All statutory credentials verified. e-Admit Card authorized.';
    onUpdateCandidate(
      activeCandidate.rollNumber,
      {
        status: 'Admit Card / Active',
        documents: updatedDocs,
        scrutinyRemarks: finalRemark,
        verifiedBy: 'Authorized Scrutiny Officer',
      },
      `Approved Dossier & Issued Admit Card for ${activeCandidate.fullName} (Roll ${activeCandidate.rollNumber})`
    );
    setRemarksInput('');
  };

  const handleFlagPending = () => {
    if (!activeCandidate) return;
    setValidationError(null);
    const finalRemark =
      remarksInput.trim() ||
      'Placed under secondary scrutiny pending regional board confirmation.';
    onUpdateCandidate(
      activeCandidate.rollNumber,
      {
        status: 'Pending / Scrutiny',
        scrutinyRemarks: finalRemark,
        verifiedBy: 'Flagged for Review',
      },
      `Flagged Dossier ${activeCandidate.rollNumber} for secondary scrutiny`
    );
    setRemarksInput('');
  };

  const handleRejectCandidate = () => {
    if (!activeCandidate) return;
    const reason = remarksInput.trim();
    if (reason.length < 5) {
      setValidationError(
        'Procedural Requirement: A formal rejection reason (minimum 5 characters) must be recorded in Scrutiny Remarks before rejecting a candidate dossier.'
      );
      return;
    }
    setValidationError(null);
    onUpdateCandidate(
      activeCandidate.rollNumber,
      {
        status: 'Rejected / Cancelled',
        scrutinyRemarks: reason,
        verifiedBy: 'Authorized Scrutiny Officer',
      },
      `Rejected Candidate Dossier ${activeCandidate.rollNumber} — Reason: ${reason}`
    );
    setRemarksInput('');
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Top Filter & Search Bar */}
      <div className="elevation-1 rounded-[6px] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full min-w-0">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search
              className="w-4 h-4 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              aria-label="Search candidates by Roll Number, Registration ID, or Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Roll No., Registration ID, or Candidate Name..."
              className="gov-input w-full pl-9 pr-3 text-[14px] tabular-data"
            />
          </div>

          <select
            aria-label="Filter candidates by verification status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as PipelineStatus | 'ALL')
            }
            className="gov-select px-3 text-[13px] max-w-[200px]"
          >
            <option value="ALL">All Statuses ({candidates.length})</option>
            <option value="Pending / Scrutiny">Pending / Scrutiny</option>
            <option value="Admit Card / Active">Admit Card / Active</option>
            <option value="Result Announced">Result Announced</option>
            <option value="Rejected / Cancelled">Rejected / Cancelled</option>
          </select>

          <select
            aria-label="Filter candidates by reservation category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="gov-select px-3 text-[13px] max-w-[160px]"
          >
            <option value="ALL">All Categories</option>
            <option value="UR">UR (Unreserved)</option>
            <option value="OBC">OBC-NCL</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="EWS">EWS</option>
          </select>
        </div>

        <div className="text-[12px] text-[#667085] tabular-data shrink-0">
          Showing <strong className="text-[#172033]">{filteredCandidates.length}</strong> of{' '}
          {candidates.length} candidate dossiers
        </div>
      </div>

      {/* Split Workspace: Candidate Table (7 cols) + Active Dossier Inspector (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full min-w-0">
        {/* Left: Candidate Roll Call Table */}
        <div className="lg:col-span-7 elevation-1 rounded-[6px] overflow-hidden w-full min-w-0">
          <div className="px-4 py-3 border-b border-[#E4E7EC] flex items-center justify-between bg-white">
            <h3 className="text-[16px] leading-[24px] font-semibold text-[#172033]">
              Candidate Roll Call & Verification Queue
            </h3>
            <span className="text-[12px] text-[#667085] tabular-data">
              Click a row to inspect dossier
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F4F6FA] border-b border-[#E4E7EC] text-[11px] leading-[15px] font-bold uppercase tracking-[0.03em] text-[#667085]">
                  <th className="py-2.5 px-3.5 whitespace-nowrap">Roll No. / Reg ID</th>
                  <th className="py-2.5 px-3.5">Candidate & Requisition</th>
                  <th className="py-2.5 px-3.5 text-right whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E7EC] text-[13px] leading-[18px]">
                {filteredCandidates.map((cand) => {
                  const isSelected = activeCandidate?.rollNumber === cand.rollNumber;
                  return (
                    <tr
                      key={cand.rollNumber}
                      onClick={() => {
                        setSelectedRoll(cand.rollNumber);
                        setValidationError(null);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#EFF4FB] hover:bg-[#E5EEF9]'
                          : 'bg-white hover:bg-[#F4F6FA]/70'
                      }`}
                    >
                      <td className="py-2.5 px-3.5 tabular-data whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedRoll(cand.rollNumber);
                            setValidationError(null);
                          }}
                          className="font-semibold text-[#12305A] hover:underline text-left block"
                        >
                          {cand.rollNumber}
                        </button>
                        <div className="text-[11px] text-[#667085] tabular-data">
                          {cand.registrationId}
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5 max-w-[260px]">
                        <div className="font-semibold text-[#172033] truncate">
                          {cand.fullName}
                        </div>
                        <div className="text-[11px] text-[#667085] tabular-data truncate">
                          Cat: <strong className="text-[#172033]">{cand.category}</strong> · {cand.ageYears} yrs · {cand.appliedAdvtId} ({cand.examCenterCode})
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                        <StatusBadge status={cand.status} size="sm" />
                      </td>
                    </tr>
                  );
                })}
                {filteredCandidates.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-12 px-4 text-center text-[#667085]">
                      <div className="text-[14px] font-semibold text-[#172033]">
                        {candidates.length === 0
                          ? 'No Candidate Dossiers in Queue'
                          : 'No candidate dossiers match the active search or filter criteria.'}
                      </div>
                      <p className="text-[12px] text-[#667085] mt-1">
                        {candidates.length === 0
                          ? 'Candidate applications will appear here once submitted.'
                          : 'Try clearing your search query or switching filters.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Active Candidate Dossier Verification Panel */}
        <div className="lg:col-span-5 elevation-1 rounded-[6px] overflow-hidden w-full min-w-0">
          {activeCandidate && readiness ? (
            <div>
              <div className="px-5 py-4 bg-[#12305A] text-white flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#F5B544] tabular-data">
                    Dossier Scrutiny · Roll No. {activeCandidate.rollNumber}
                  </div>
                  <h3 className="text-[18px] leading-[24px] font-semibold mt-0.5">
                    {activeCandidate.fullName}
                  </h3>
                  <p className="text-[12px] text-[#d6e3ff] tabular-data mt-0.5">
                    {activeCandidate.registrationId} · DOB: {activeCandidate.dateOfBirth} (
                    {activeCandidate.ageYears} Yrs) · Quota: {activeCandidate.category}
                  </p>
                </div>
                <StatusBadge status={activeCandidate.status} size="sm" />
              </div>

              <div className="p-5 space-y-4">
                {/* Applied Post Summary */}
                <div className="p-3 rounded-[4px] bg-[#F4F6FA] border border-[#E4E7EC] text-[12px] space-y-1">
                  <div className="flex justify-between gap-2">
                    <span className="text-[#667085]">Requisition ID:</span>
                    <span className="font-semibold text-[#172033] tabular-data">
                      {activeCandidate.appliedAdvtId}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#667085]">Commission:</span>
                    <span className="font-medium text-[#172033]">
                      {activeCandidate.department}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#667085]">Exam Center Code:</span>
                    <span className="font-semibold text-[#12305A] tabular-data">
                      {activeCandidate.examCenterCode}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#667085]">Last Officer Sign-Off:</span>
                    <span className="font-medium text-[#172033]">
                      {activeCandidate.verifiedBy}
                    </span>
                  </div>
                </div>

                {/* Statutory Credential Checklist using GovJob Admin Checkbox Spec */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[12px] font-semibold uppercase tracking-[0.02em] text-[#667085]">
                      Statutory Document Checklist
                    </h4>
                    <span className="text-[12px] font-semibold text-[#12305A] tabular-data">
                      {readiness.verifiedCount} / {readiness.totalDocs} Verified
                    </span>
                  </div>

                  <div className="divide-y divide-[#E4E7EC] border border-[#E4E7EC] rounded-[4px]">
                    {DOC_KEYS.map((doc) => {
                      const checked = activeCandidate.documents[doc.key];
                      return (
                        <label
                          key={doc.key}
                          className="flex items-center justify-between gap-3 px-3 py-2.5 cursor-pointer hover:bg-[#F4F6FA]/60 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleDocument(doc.key)}
                              className="sr-only"
                            />
                            {/* Custom Checkbox per Spec: Square with 1.5px solid #667085 border, snapping to #12305A fill with sharp white checkmark */}
                            <span
                              aria-hidden="true"
                              className={`w-4 h-4 rounded-[2px] flex items-center justify-center shrink-0 transition-colors ${
                                checked
                                  ? 'bg-[#12305A] border-[1.5px] border-[#12305A] text-white'
                                  : 'bg-white border-[1.5px] border-[#667085]'
                              }`}
                            >
                              {checked && <Check className="w-3 h-3 stroke-[3]" />}
                            </span>
                            <div>
                              <div className="text-[13px] font-medium text-[#172033]">
                                {doc.label}
                              </div>
                              <div className="text-[11px] text-[#667085] tabular-data">
                                {doc.code} · {checked ? 'Verified & Locked' : 'Deficiency / Unverified'}
                              </div>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Current Officer Remarks */}
                <div className="p-3 rounded-[4px] bg-[#FFFBEB] border border-[#FDE68A] text-[12px] text-[#724d00]">
                  <div className="font-semibold flex items-center gap-1.5 text-[#D97706] mb-0.5">
                    <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Recorded Scrutiny Note:</span>
                  </div>
                  <p>{activeCandidate.scrutinyRemarks}</p>
                </div>

                {/* Officer Decision Note Input */}
                <div>
                  <label
                    htmlFor="scrutiny-remarks-input"
                    className="block text-[12px] font-medium text-[#172033] mb-1"
                  >
                    Officer Verification / Rejection Order Note
                  </label>
                  <input
                    id="scrutiny-remarks-input"
                    type="text"
                    value={remarksInput}
                    onChange={(e) => {
                      setRemarksInput(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="Enter verification note or mandatory rejection reason..."
                    className="gov-input w-full px-3 text-[13px]"
                  />
                </div>

                {validationError && (
                  <div
                    role="alert"
                    className="p-2.5 rounded-[4px] bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-[12px]"
                  >
                    {validationError}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-[#E4E7EC]">
                  <button
                    type="button"
                    onClick={handleApproveCandidate}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[4px] bg-[#12305A] text-white text-[13px] font-semibold hover:bg-[#1C4478] active:bg-[#0D2240] transition-colors whitespace-nowrap shrink-0"
                  >
                    <UserCheck className="w-4 h-4" aria-hidden="true" />
                    <span>Approve & Issue Admit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFlagPending}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-[4px] bg-[#F5B544] text-[#172033] text-[13px] font-semibold hover:bg-[#E5A330] transition-colors whitespace-nowrap shrink-0"
                  >
                    <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                    <span>Hold in Scrutiny</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRejectCandidate}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-[4px] bg-[#DC2626] text-white text-[13px] font-semibold hover:bg-[#B91C1C] transition-colors whitespace-nowrap shrink-0"
                  >
                    <XCircle className="w-4 h-4" aria-hidden="true" />
                    <span>Reject Dossier</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-[#667085]">
              Select a candidate from the queue to inspect documents and perform scrutiny.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
