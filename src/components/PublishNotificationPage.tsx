import React, { useState, useEffect } from 'react';
import {
  NewNotificationInput,
  PipelineStatus,
  PostBreakdownInput,
} from '../types/recruitment';
import {
  computeCategoryBreakdown,
  validateNotificationInput,
} from '../utils/recruitmentLogic';
import { StatusBadge } from './StatusBadge';
import { api } from '../services/api';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  FilePlus2,
  Landmark,
  ShieldCheck,
  CreditCard,
  GraduationCap,
  Plus,
  Trash2,
  Briefcase,
  Link2,
  ListOrdered,
  FileText,
  HelpCircle,
} from 'lucide-react';

interface PublishNotificationPageProps {
  nextGazetteNumber: number;
  onCancel: () => void;
  onPublish: (input: NewNotificationInput) => void;
}

interface PostRow {
  id: string;
  postName: string;
  vacancies: string;
  qualification: string;
}

interface FaqRow {
  id: string;
  question: string;
  answer: string;
}

const DEFAULT_DEPARTMENTS = [
  'Union Public Service Commission (UPSC)',
  'Staff Selection Commission (SSC)',
  'Railway Recruitment Board (RRB)',
  'Institute of Banking Personnel Selection (IBPS)',
  'Defence Research & Development Org. (DRDO)',
];

const PAY_LEVELS = [
  'Level-10 (₹56,100 – ₹1,77,500)',
  'Level-8 (₹47,600 – ₹1,51,100)',
  'Level-7 (₹44,900 – ₹1,42,400)',
  'Level-6 (₹35,400 – ₹1,12,400)',
  'Scale-I Officer (₹48,480 – ₹85,920)',
];

export const PublishNotificationPage: React.FC<PublishNotificationPageProps> = ({
  nextGazetteNumber,
  onCancel,
  onPublish,
}) => {
  const [departments, setDepartments] = useState<string[]>(DEFAULT_DEPARTMENTS);
  const [advtNo, setAdvtNo] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [payLevel, setPayLevel] = useState('');
  const [vacanciesStr, setVacanciesStr] = useState('');
  const [startDate, setStartDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [deadlineDate, setDeadlineDate] = useState('');
  const [examDate, setExamDate] = useState('');
  const [isExamDateTBD, setIsExamDateTBD] = useState(false);
  const [status, setStatus] = useState<PipelineStatus>('Pending / Scrutiny');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dynamic Application Fee Structure
  const [feeGeneral, setFeeGeneral] = useState('100');
  const [feeObc, setFeeObc] = useState('100');
  const [feeScSt, setFeeScSt] = useState('0');
  const [feeFemale, setFeeFemale] = useState('0');
  const [paymentMode, setPaymentMode] = useState(
    'Online via Net Banking, Debit / Credit Card, or UPI'
  );

  // Dynamic Eligibility & Age Limit
  const [qualificationSummary, setQualificationSummary] = useState(
    'Graduate in required discipline from recognized university / board'
  );
  const [ageLimitSummary, setAgeLimitSummary] = useState(
    '18 to 32 Years (Relaxations: OBC 3 yrs, SC/ST 5 yrs, PwD 10 yrs)'
  );

  // Dynamic Post-Wise Vacancy & Qualification Breakdown
  const [posts, setPosts] = useState<PostRow[]>([
    {
      id: 'post-1',
      postName: '',
      vacancies: '',
      qualification: '',
    },
  ]);

  // Dynamic Official Direct Links
  const [applyOnlineUrl, setApplyOnlineUrl] = useState(
    'https://upsconline.nic.in'
  );
  const [officialNoticePdfUrl, setOfficialNoticePdfUrl] = useState(
    'https://upsc.gov.in/sites/default/files/Notice-CSP-2026.pdf'
  );
  const [officialWebsiteUrl, setOfficialWebsiteUrl] = useState(
    'https://upsc.gov.in'
  );

  // Dynamic Selection Process Stages
  const [selectionStages, setSelectionStages] = useState<string[]>([
    'Stage 1: Preliminary Computer Based Exam / Screening Test',
    'Stage 2: Main Written Examination / Technical Evaluation',
    'Stage 3: Document Verification & Final Cadre Allocation',
  ]);

  // Dynamic Official Job Description & Role Scope
  const [description, setDescription] = useState(
    'Official recruitment notification released under the authority of Government of India. Candidates are advised to review the statutory seat matrix, post-wise eligibility criteria, age limits, and scheme of examination carefully before applying.'
  );

  // Dynamic Frequently Asked Questions (FAQs)
  const [faqs, setFaqs] = useState<FaqRow[]>([
    {
      id: 'faq-1',
      question: 'What is the minimum educational qualification required to apply?',
      answer:
        'Candidates must hold a Bachelor Degree in any discipline from a recognized University or equivalent qualification recognized by the Central Government.',
    },
    {
      id: 'faq-2',
      question: 'Is there any fee exemption for female and reserved category applicants?',
      answer:
        'Yes. SC, ST, PwD, and all Female candidates are completely exempted from payment of the application fee (₹0). General/OBC candidates pay ₹100.',
    },
    {
      id: 'faq-3',
      question: 'Can candidates appearing in the final year of graduation apply?',
      answer:
        'Yes, final-year appearing candidates may apply provisionally, provided proof of passing is produced before the prescribed verification deadline.',
    },
  ]);

  useEffect(() => {
    api
      .getOrganizations()
      .then((orgs) => {
        if (orgs && orgs.length > 0) {
          const names = orgs.map((o) => `${o.name} (${o.code})`);
          setDepartments(names);
        }
      })
      .catch(() => {
        // Keep DEFAULT_DEPARTMENTS on network failure
      });
  }, []);

  const handleAddPost = () => {
    setPosts((prev) => [
      ...prev,
      {
        id: `post-${Date.now()}`,
        postName: '',
        vacancies: '',
        qualification: '',
      },
    ]);
  };

  const handleRemovePost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const handlePostChange = (
    id: string,
    field: keyof Omit<PostRow, 'id'>,
    value: string
  ) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleAddStage = () => {
    setSelectionStages((prev) => [
      ...prev,
      `Stage ${prev.length + 1}: `,
    ]);
  };

  const handleRemoveStage = (index: number) => {
    setSelectionStages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStageChange = (index: number, value: string) => {
    setSelectionStages((prev) =>
      prev.map((s, i) => (i === index ? value : s))
    );
  };

  const handleAddFaq = () => {
    setFaqs((prev) => [
      ...prev,
      {
        id: `faq-${Date.now()}`,
        question: '',
        answer: '',
      },
    ]);
  };

  const handleRemoveFaq = (id: string) => {
    if (faqs.length <= 1) return;
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  };

  const handleFaqChange = (
    id: string,
    field: 'question' | 'answer',
    value: string
  ) => {
    setFaqs((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  const numericVacancies = parseInt(vacanciesStr, 10) || 0;
  const breakdown = computeCategoryBreakdown(numericVacancies);
  const previewGazetteRef = `GSR-${nextGazetteNumber || 1}(E)/${new Date().getFullYear()}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const postBreakdownData: PostBreakdownInput[] = posts
      .filter((p) => p.postName.trim().length > 0)
      .map((p) => ({
        postName: p.postName.trim(),
        vacancies: parseInt(p.vacancies, 10) || 0,
        qualification:
          p.qualification.trim() ||
          qualificationSummary.trim() ||
          'Graduate in required discipline',
      }));

    const input: NewNotificationInput = {
      advtNo: advtNo.trim(),
      postTitle: postTitle.trim(),
      department,
      payLevel,
      vacancies: numericVacancies,
      startDate: startDate || undefined,
      deadlineDate,
      examDate: isExamDateTBD || !examDate ? '' : examDate,
      status,
      applicationFees: {
        general: parseInt(feeGeneral, 10) || 0,
        obc: parseInt(feeObc, 10) || parseInt(feeGeneral, 10) || 0,
        scSt: parseInt(feeScSt, 10) || 0,
        female: parseInt(feeFemale, 10) || 0,
        paymentMode:
          paymentMode.trim() ||
          'Online via Net Banking, Debit / Credit Card, or UPI',
      },
      qualificationSummary: qualificationSummary.trim() || undefined,
      ageLimitSummary: ageLimitSummary.trim() || undefined,
      postBreakdown:
        postBreakdownData.length > 0 ? postBreakdownData : undefined,
      applyOnlineUrl: applyOnlineUrl.trim() || undefined,
      officialNoticePdfUrl: officialNoticePdfUrl.trim() || undefined,
      officialWebsiteUrl: officialWebsiteUrl.trim() || undefined,
      selectionStages:
        selectionStages.filter((s) => s.trim().length > 0).length > 0
          ? selectionStages.filter((s) => s.trim().length > 0)
          : undefined,
      description: description.trim() || undefined,
      faqs:
        faqs
          .filter((f) => f.question.trim().length > 0 && f.answer.trim().length > 0)
          .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() })),
    };

    const validation = validateNotificationInput(input);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    onPublish(input);
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Top Breadcrumb / Back Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E7EC] w-full min-w-0">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#12305A] hover:text-[#1C4478] transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Recruitment Pipelines</span>
        </button>

        <div className="text-[12px] text-[#667085] tabular-data">
          Gazette Requisition Entry · Scheduled Reference:{' '}
          <strong className="text-[#12305A]">{previewGazetteRef}</strong>
        </div>
      </div>

      {/* Two-Column Full-Page Workspace: Form (7 Cols) + Live Gazette Preview (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full min-w-0">
        {/* Left Column: Structured Requisition Form */}
        <section
          aria-label="Recruitment Notification Entry Form"
          className="lg:col-span-7 elevation-1 rounded-[6px] overflow-hidden w-full min-w-0"
        >
          <div className="px-6 py-4 bg-[#12305A] text-white flex items-center gap-3">
            <div className="p-2 rounded-[4px] bg-[#1C4478] text-[#F5B544] shrink-0">
              <FilePlus2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-[16px] leading-[24px] font-semibold">
                Gazette Requisition & Statutory Seat Matrix Entry
              </h2>
              <p className="text-[12px] leading-[16px] text-[#d6e3ff]">
                Complete all mandatory departmental fields to publish the official recruitment notice
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="p-6 space-y-6">
            {Object.keys(errors).length > 0 && (
              <div
                role="alert"
                className="p-3.5 rounded-[4px] bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-[12px] leading-[18px] flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="font-semibold">
                    Procedural Validation Failed — Please rectify the following fields:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {Object.values(errors).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 1. Core Gazette Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="advt-no-input"
                    className="block text-[12px] leading-[16px] font-medium tracking-[0.02em] text-[#172033] mb-1.5"
                  >
                    Advertisement No. <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    id="advt-no-input"
                    type="text"
                    value={advtNo}
                    onChange={(e) => setAdvtNo(e.target.value)}
                    placeholder="e.g. Advt. No. 14/CSP-UPSC"
                    className="gov-input w-full px-3 text-[14px] tabular-data"
                  />
                </div>

                <div>
                  <label
                    htmlFor="department-select"
                    className="block text-[12px] leading-[16px] font-medium tracking-[0.02em] text-[#172033] mb-1.5"
                  >
                    Commission / Recruitment Board <span className="text-[#DC2626]">*</span>
                  </label>
                  <select
                    id="department-select"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="gov-select w-full px-3 text-[14px]"
                  >
                    <option value="">-- Select Commission / Board --</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="post-title-input"
                  className="block text-[12px] leading-[16px] font-medium tracking-[0.02em] text-[#172033] mb-1.5"
                >
                  Official Post & Examination Title <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  id="post-title-input"
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. Combined Graduate Level Examination / Assistant Section Officer"
                  className="gov-input w-full px-3 text-[14px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="vacancies-input"
                    className="block text-[12px] leading-[16px] font-medium tracking-[0.02em] text-[#172033] mb-1.5"
                  >
                    Sanctioned Vacancies <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    id="vacancies-input"
                    type="number"
                    min={1}
                    max={100000}
                    value={vacanciesStr}
                    onChange={(e) => setVacanciesStr(e.target.value)}
                    className="gov-input w-full px-3 text-[14px] tabular-data"
                  />
                </div>

                <div>
                  <label
                    htmlFor="pay-level-select"
                    className="block text-[12px] leading-[16px] font-medium tracking-[0.02em] text-[#172033] mb-1.5"
                  >
                    7th CPC Pay Matrix Level
                  </label>
                  <select
                    id="pay-level-select"
                    value={payLevel}
                    onChange={(e) => setPayLevel(e.target.value)}
                    className="gov-select w-full px-3 text-[14px]"
                  >
                    <option value="">-- Select Pay Matrix Level --</option>
                    {PAY_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="initial-status-select"
                    className="block text-[12px] leading-[16px] font-medium tracking-[0.02em] text-[#172033] mb-1.5"
                  >
                    Initial Channel Status
                  </label>
                  <select
                    id="initial-status-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PipelineStatus)}
                    className="gov-select w-full px-3 text-[14px]"
                  >
                    <option value="Admit Card / Active">Admit Card / Active</option>
                    <option value="Pending / Scrutiny">Pending / Scrutiny</option>
                    <option value="Result Announced">Result Announced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="start-date-input"
                    className="block text-[12px] leading-[16px] font-medium tracking-[0.02em] text-[#172033] mb-1.5"
                  >
                    Application Begin / Opening Date
                  </label>
                  <input
                    id="start-date-input"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="gov-input w-full px-3 text-[14px] tabular-data"
                  />
                  <span className="block text-[11px] text-[#667085] mt-1">
                    Official Gazette notification release
                  </span>
                </div>

                <div>
                  <label
                    htmlFor="deadline-date-input"
                    className="block text-[12px] leading-[16px] font-medium tracking-[0.02em] text-[#172033] mb-1.5"
                  >
                    Registration Closing Deadline <span className="text-[#DC2626]">*</span>
                  </label>
                  <input
                    id="deadline-date-input"
                    type="date"
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="gov-input w-full px-3 text-[14px] tabular-data"
                  />
                  <span className="block text-[11px] text-[#667085] mt-1">
                    Last date for registration & fees
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="exam-date-input"
                      className="block text-[12px] leading-[16px] font-medium tracking-[0.02em] text-[#172033]"
                    >
                      Scheduled Exam Date
                    </label>
                    <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#12305A] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isExamDateTBD}
                        onChange={(e) => {
                          setIsExamDateTBD(e.target.checked);
                          if (e.target.checked) setExamDate('');
                        }}
                        className="rounded border-[#E4E7EC] text-[#12305A] focus:ring-[#12305A] h-3.5 w-3.5"
                      />
                      <span>Notify Soon</span>
                    </label>
                  </div>
                  {isExamDateTBD ? (
                    <div className="h-[38px] px-3 rounded-[4px] bg-[#E9EDFF] border border-[#C4C6D0] flex items-center text-[12px] font-semibold text-[#12305A]">
                      📢 Will be announced soon
                    </div>
                  ) : (
                    <input
                      id="exam-date-input"
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="gov-input w-full px-3 text-[14px] tabular-data"
                    />
                  )}
                  <span className="block text-[11px] text-[#667085] mt-1">
                    {isExamDateTBD || !examDate
                      ? 'Will display "As per schedule / To be announced soon"'
                      : 'Target CBT / written exam date'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Application Fee Structure */}
            <div className="pt-5 border-t border-[#E4E7EC] space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#12305A]" aria-hidden="true" />
                <h3 className="text-[13px] font-bold uppercase tracking-[0.03em] text-[#12305A]">
                  Application Fee Structure
                </h3>
              </div>
              <p className="text-[12px] text-[#667085]">
                Configure departmental application fee amounts in ₹ (INR) for candidate categories. Enter 0 for exempted.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label
                    htmlFor="fee-gen-input"
                    className="block text-[11px] font-semibold text-[#172033] mb-1"
                  >
                    General / EWS (₹)
                  </label>
                  <input
                    id="fee-gen-input"
                    type="number"
                    min={0}
                    value={feeGeneral}
                    onChange={(e) => setFeeGeneral(e.target.value)}
                    className="gov-input w-full px-3 text-[13px] tabular-data"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="fee-obc-input"
                    className="block text-[11px] font-semibold text-[#172033] mb-1"
                  >
                    OBC Candidates (₹)
                  </label>
                  <input
                    id="fee-obc-input"
                    type="number"
                    min={0}
                    value={feeObc}
                    onChange={(e) => setFeeObc(e.target.value)}
                    className="gov-input w-full px-3 text-[13px] tabular-data"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="fee-sc-input"
                    className="block text-[11px] font-semibold text-[#172033] mb-1"
                  >
                    SC / ST / PwD (₹)
                  </label>
                  <input
                    id="fee-sc-input"
                    type="number"
                    min={0}
                    value={feeScSt}
                    onChange={(e) => setFeeScSt(e.target.value)}
                    className="gov-input w-full px-3 text-[13px] tabular-data"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label
                    htmlFor="fee-female-input"
                    className="block text-[11px] font-semibold text-[#172033] mb-1"
                  >
                    Female (₹)
                  </label>
                  <input
                    id="fee-female-input"
                    type="number"
                    min={0}
                    value={feeFemale}
                    onChange={(e) => setFeeFemale(e.target.value)}
                    className="gov-input w-full px-3 text-[13px] tabular-data"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="payment-mode-input"
                  className="block text-[11px] font-semibold text-[#172033] mb-1"
                >
                  Payment Mode / Gateway Details
                </label>
                <input
                  id="payment-mode-input"
                  type="text"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="gov-input w-full px-3 text-[13px]"
                  placeholder="Online via Net Banking, Debit / Credit Card, or UPI"
                />
              </div>
            </div>

            {/* 3. Eligibility & Age Limit Requirements */}
            <div className="pt-5 border-t border-[#E4E7EC] space-y-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#12305A]" aria-hidden="true" />
                <h3 className="text-[13px] font-bold uppercase tracking-[0.03em] text-[#12305A]">
                  Eligibility & Age Limit Requirements
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="qual-summary-input"
                    className="block text-[11px] font-semibold text-[#172033] mb-1"
                  >
                    Educational Qualification Summary
                  </label>
                  <textarea
                    id="qual-summary-input"
                    rows={2}
                    value={qualificationSummary}
                    onChange={(e) => setQualificationSummary(e.target.value)}
                    className="gov-input w-full px-3 py-2 text-[13px] h-auto min-h-[58px]"
                    placeholder="e.g. Graduate in required discipline from recognized university / board"
                  />
                </div>

                <div>
                  <label
                    htmlFor="age-summary-input"
                    className="block text-[11px] font-semibold text-[#172033] mb-1"
                  >
                    Age Calculation & Limit Specifications
                  </label>
                  <textarea
                    id="age-summary-input"
                    rows={2}
                    value={ageLimitSummary}
                    onChange={(e) => setAgeLimitSummary(e.target.value)}
                    className="gov-input w-full px-3 py-2 text-[13px] h-auto min-h-[58px]"
                    placeholder="e.g. 18 to 32 Years (Relaxations: OBC 3 yrs, SC/ST 5 yrs, PwD 10 yrs)"
                  />
                </div>
              </div>
            </div>

            {/* 4. Post-Wise Vacancy & Eligibility Breakdown */}
            <div className="pt-5 border-t border-[#E4E7EC] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#12305A]" aria-hidden="true" />
                    <h3 className="text-[13px] font-bold uppercase tracking-[0.03em] text-[#12305A]">
                      Post-Wise Vacancies & Eligibility Breakdown
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#667085] mt-0.5">
                    Configure distinct post designations, specific eligibility criteria, and vacancies
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddPost}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#F4F6FA] hover:bg-[#E4E7EC] text-[#12305A] text-[12px] font-bold border border-[#E4E7EC] transition-colors self-start"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Add Post / Cadre</span>
                </button>
              </div>

              {posts.length === 0 ? (
                <div className="p-4 rounded-[4px] border border-dashed border-[#E4E7EC] text-center text-[12px] text-[#667085]">
                  No post-wise breakdown specified. The portal will display global qualification.
                  <button
                    type="button"
                    onClick={handleAddPost}
                    className="ml-2 font-semibold text-[#12305A] hover:underline"
                  >
                    + Add Post
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {posts.map((post, idx) => (
                    <div
                      key={post.id}
                      className="p-3.5 rounded-[6px] bg-[#F9FAFB] border border-[#E4E7EC] space-y-2.5 relative"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#12305A]">
                          Cadre #{idx + 1}
                        </span>
                        {posts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePost(post.id)}
                            className="text-[#DC2626] hover:text-[#991B1B] p-1 rounded hover:bg-rose-50 transition-colors"
                            title="Remove Post"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-7">
                          <label className="block text-[11px] font-medium text-[#172033] mb-1">
                            Post Designation / Title <span className="text-[#DC2626]">*</span>
                          </label>
                          <input
                            type="text"
                            value={post.postName}
                            onChange={(e) =>
                              handlePostChange(post.id, 'postName', e.target.value)
                            }
                            className="gov-input w-full px-2.5 text-[12px]"
                            placeholder="e.g. Assistant Section Officer / Inspector"
                          />
                        </div>
                        <div className="sm:col-span-5">
                          <label className="block text-[11px] font-medium text-[#172033] mb-1">
                            Vacancies
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={post.vacancies}
                            onChange={(e) =>
                              handlePostChange(post.id, 'vacancies', e.target.value)
                            }
                            className="gov-input w-full px-2.5 text-[12px] tabular-data"
                            placeholder="e.g. 150"
                          />
                        </div>
                        <div className="sm:col-span-12">
                          <label className="block text-[11px] font-medium text-[#172033] mb-1">
                            Specific Educational Qualification & Experience
                          </label>
                          <input
                            type="text"
                            value={post.qualification}
                            onChange={(e) =>
                              handlePostChange(post.id, 'qualification', e.target.value)
                            }
                            className="gov-input w-full px-2.5 text-[12px]"
                            placeholder="e.g. Bachelor Degree in Commerce/Statistics with 60% aggregate"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Selection Process & Exam Scheme */}
            <div className="pt-5 border-t border-[#E4E7EC] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-[#12305A]" aria-hidden="true" />
                    <h3 className="text-[13px] font-bold uppercase tracking-[0.03em] text-[#12305A]">
                      Selection Process & Exam Scheme
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#667085] mt-0.5">
                    Define recruitment stages (e.g. CBT, Physical Standard Test, Interview, Document Verification)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddStage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#F4F6FA] hover:bg-[#E4E7EC] text-[#12305A] text-[12px] font-bold border border-[#E4E7EC] transition-colors self-start"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Add Stage</span>
                </button>
              </div>

              <div className="space-y-2">
                {selectionStages.map((stage, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#12305A] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={stage}
                      onChange={(e) => handleStageChange(idx, e.target.value)}
                      className="gov-input w-full px-2.5 text-[12px]"
                      placeholder={`e.g. Stage ${idx + 1}: Written Examination / Physical Test`}
                    />
                    {selectionStages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStage(idx)}
                        className="text-[#DC2626] hover:text-[#991B1B] p-1.5 rounded hover:bg-rose-50 transition-colors shrink-0"
                        title="Remove Stage"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Official Direct Links & Gazette URLs */}
            <div className="pt-5 border-t border-[#E4E7EC] space-y-4">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#12305A]" aria-hidden="true" />
                <h3 className="text-[13px] font-bold uppercase tracking-[0.03em] text-[#12305A]">
                  Official Commission Links & Portal URLs
                </h3>
              </div>
              <p className="text-[12px] text-[#667085]">
                Provide official verified destinations for candidates. Links open directly on official commission portals.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="apply-online-url-input"
                    className="block text-[11px] font-semibold text-[#172033] mb-1"
                  >
                    Apply Online Portal URL
                  </label>
                  <input
                    id="apply-online-url-input"
                    type="url"
                    value={applyOnlineUrl}
                    onChange={(e) => setApplyOnlineUrl(e.target.value)}
                    className="gov-input w-full px-3 text-[12px]"
                    placeholder="https://upsconline.nic.in"
                  />
                  <span className="block text-[10px] text-[#667085] mt-1">
                    Candidate registration & login page
                  </span>
                </div>

                <div>
                  <label
                    htmlFor="notice-pdf-url-input"
                    className="block text-[11px] font-semibold text-[#172033] mb-1"
                  >
                    Official Notification PDF URL
                  </label>
                  <input
                    id="notice-pdf-url-input"
                    type="url"
                    value={officialNoticePdfUrl}
                    onChange={(e) => setOfficialNoticePdfUrl(e.target.value)}
                    className="gov-input w-full px-3 text-[12px]"
                    placeholder="https://upsc.gov.in/notice.pdf"
                  />
                  <span className="block text-[10px] text-[#667085] mt-1">
                    Gazette bulletin / notification PDF
                  </span>
                </div>

                <div>
                  <label
                    htmlFor="commission-website-url-input"
                    className="block text-[11px] font-semibold text-[#172033] mb-1"
                  >
                    Official Commission Website
                  </label>
                  <input
                    id="commission-website-url-input"
                    type="url"
                    value={officialWebsiteUrl}
                    onChange={(e) => setOfficialWebsiteUrl(e.target.value)}
                    className="gov-input w-full px-3 text-[12px]"
                    placeholder="https://upsc.gov.in"
                  />
                  <span className="block text-[10px] text-[#667085] mt-1">
                    Commission root homepage
                  </span>
                </div>
              </div>
            </div>

            {/* 7. Official Job Description & Recruitment Overview */}
            <div className="pt-5 border-t border-[#E4E7EC] space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#12305A]" aria-hidden="true" />
                <h3 className="text-[13px] font-bold uppercase tracking-[0.03em] text-[#12305A]">
                  7. Official Job Description & Candidate Overview
                </h3>
              </div>
              <p className="text-[12px] text-[#667085]">
                Provide an executive summary, cadre scope, responsibilities, or notification overview for citizen applicants.
              </p>

              <div>
                <textarea
                  id="job-description-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="gov-input w-full p-2.5 text-[12px] leading-relaxed resize-y"
                  placeholder="Enter detailed official recruitment overview, cadre responsibilities, and instructions for applicants..."
                />
                <div className="flex justify-between items-center text-[10px] text-[#667085] mt-1">
                  <span>Displayed prominently on the BharatRojgar notification detail page</span>
                  <span>{description.length} characters</span>
                </div>
              </div>
            </div>

            {/* 8. Candidate FAQs (Frequently Asked Questions) */}
            <div className="pt-5 border-t border-[#E4E7EC] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#12305A]" aria-hidden="true" />
                    <h3 className="text-[13px] font-bold uppercase tracking-[0.03em] text-[#12305A]">
                      8. Candidate Frequently Asked Questions (Recruitment FAQs)
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#667085] mt-0.5">
                    Configure official Q&amp;A for applicants (eligibility, exemptions, exams, normalization, results)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#F4F6FA] hover:bg-[#E4E7EC] text-[#12305A] text-[12px] font-bold border border-[#E4E7EC] transition-colors self-start"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Add FAQ</span>
                </button>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div
                    key={faq.id}
                    className="p-3 rounded-[6px] border border-[#E4E7EC] bg-[#FAFAFC] space-y-2 relative"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-5 h-5 rounded-full bg-[#12305A] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          Q{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => handleFaqChange(faq.id, 'question', e.target.value)}
                          className="gov-input w-full px-2.5 text-[12px] font-semibold"
                          placeholder={`Question ${idx + 1} (e.g. Can final year students apply?)`}
                        />
                      </div>
                      {faqs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(faq.id)}
                          className="text-[#DC2626] hover:text-[#991B1B] p-1.5 rounded hover:bg-rose-50 transition-colors shrink-0"
                          title="Remove FAQ"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-start gap-2 pl-7">
                      <textarea
                        value={faq.answer}
                        onChange={(e) => handleFaqChange(faq.id, 'answer', e.target.value)}
                        rows={2}
                        className="gov-input w-full p-2 text-[12px] leading-relaxed resize-y"
                        placeholder="Official departmental answer for candidates..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-5 border-t border-[#E4E7EC]">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-[4px] bg-white border border-[#E4E7EC] text-[#172033] text-[14px] leading-[20px] font-semibold hover:bg-[#F4F6FA] transition-colors whitespace-nowrap shrink-0"
              >
                Cancel & Return to Pipelines
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-[4px] bg-[#12305A] text-white text-[14px] leading-[20px] font-semibold hover:bg-[#1C4478] active:bg-[#0D2240] transition-colors whitespace-nowrap shrink-0"
              >
                Publish Gazette Notification
              </button>
            </div>
          </form>
        </section>

        {/* Right Column: Sticky Live e-Gazette Preview & Auto-Computed Reservation Roster */}
        <aside
          aria-label="Live Gazette Notification Preview"
          className="lg:col-span-5 elevation-1 rounded-[6px] overflow-hidden lg:sticky lg:top-20"
        >
          <div className="px-5 py-4 border-b border-[#E4E7EC] bg-[#F4F6FA] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-[#12305A]" aria-hidden="true" />
              <span className="text-[12px] font-bold uppercase tracking-[0.04em] text-[#12305A]">
                Live e-Gazette Notice Preview
              </span>
            </div>
            <StatusBadge status={status} size="sm" />
          </div>

          <div className="p-5 space-y-4 bg-white">
            {/* Gazette Header Preview */}
            <div className="pb-3 border-b border-[#E4E7EC] space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#667085] tabular-data">
                <span>{advtNo.trim() || 'ADVT. NO. PENDING ENTRY'}</span>
                <span>{previewGazetteRef}</span>
              </div>
              <h3 className="text-[17px] leading-[23px] font-bold text-[#172033]">
                {postTitle.trim() || 'Official Post & Examination Title Preview'}
              </h3>
              <p className="text-[13px] font-medium text-[#12305A]">
                {department || 'Commission Pending Selection'}
              </p>
              <div className="text-[12px] text-[#667085] tabular-data">
                Pay Scale: {payLevel || 'Pending Selection'}
              </div>
            </div>

            {/* Auto-Computed Statutory Reservation Roster */}
            <div className="p-3.5 rounded-[4px] bg-[#F4F6FA] border border-[#E4E7EC]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] leading-[14px] font-semibold tracking-[0.04em] uppercase text-[#667085]">
                  Standard Reservation Quota Roster
                </span>
                <span className="text-[12px] font-bold text-[#12305A] tabular-data">
                  Total: {numericVacancies.toLocaleString('en-IN')} Posts
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 text-center">
                {(
                  [
                    ['UR (40.5%)', breakdown.UR],
                    ['OBC (27%)', breakdown.OBC],
                    ['SC (15%)', breakdown.SC],
                    ['ST (7.5%)', breakdown.ST],
                    ['EWS (10%)', breakdown.EWS],
                  ] as const
                ).map(([label, count]) => (
                  <div
                    key={label}
                    className="bg-white border border-[#E4E7EC] rounded-[4px] py-1.5 px-1"
                  >
                    <div className="text-[10px] text-[#667085] font-medium whitespace-nowrap">
                      {label}
                    </div>
                    <div className="text-[14px] font-bold text-[#172033] tabular-data mt-0.5">
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Fees Summary Card in Preview */}
            <div className="p-3 rounded-[4px] bg-[#F4F6FA] border border-[#E4E7EC] space-y-1.5 text-[12px]">
              <div className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#12305A] flex items-center justify-between">
                <span>Application Fees</span>
                <span className="text-[10px] text-[#667085] font-normal">Official Rates</span>
              </div>
              <div className="flex justify-between text-[#172033]">
                <span className="text-[#667085]">General / EWS / OBC:</span>
                <span className="font-bold">₹{feeGeneral || '0'}/-</span>
              </div>
              <div className="flex justify-between text-[#172033]">
                <span className="text-[#667085]">SC / ST / PwD:</span>
                <span className="font-semibold text-[#18864B]">
                  {feeScSt === '0' || !feeScSt ? 'Exempted (₹0)' : `₹${feeScSt}/-`}
                </span>
              </div>
              <div className="flex justify-between text-[#172033]">
                <span className="text-[#667085]">Female Candidates:</span>
                <span className="font-semibold text-[#18864B]">
                  {feeFemale === '0' || !feeFemale ? 'Exempted (₹0)' : `₹${feeFemale}/-`}
                </span>
              </div>
            </div>

            {/* Eligibility & Cadre Breakdown Preview */}
            <div className="p-3 rounded-[4px] bg-[#F4F6FA] border border-[#E4E7EC] space-y-1.5 text-[12px]">
              <div className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#12305A]">
                Eligibility & Age Limit
              </div>
              <p className="text-[11px] text-[#172033] line-clamp-2 leading-relaxed">
                {qualificationSummary || 'General qualification criteria pending'}
              </p>
              <div className="text-[11px] text-[#667085]">
                <strong className="text-[#12305A]">Age: </strong>
                {ageLimitSummary || 'Per notification norms'}
              </div>
              {posts.filter((p) => p.postName.trim()).length > 0 && (
                <div className="pt-1.5 border-t border-[#E4E7EC] text-[11px] text-[#12305A] font-semibold">
                  {posts.filter((p) => p.postName.trim()).length} specific cadre breakdown(s) defined
                </div>
              )}
            </div>

            {/* Selection Stages Preview */}
            <div className="p-3 rounded-[4px] bg-[#F4F6FA] border border-[#E4E7EC] space-y-1.5 text-[12px]">
              <div className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#12305A] flex items-center justify-between">
                <span>Selection Scheme</span>
                <span className="text-[10px] text-[#667085] font-normal">
                  {selectionStages.filter((s) => s.trim().length > 0).length} Stages
                </span>
              </div>
              <ul className="space-y-1 text-[11px] text-[#172033]">
                {selectionStages
                  .filter((s) => s.trim().length > 0)
                  .slice(0, 3)
                  .map((st, i) => (
                    <li key={i} className="line-clamp-1 flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded-full bg-[#12305A] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span>{st}</span>
                    </li>
                  ))}
                {selectionStages.filter((s) => s.trim().length > 0).length > 3 && (
                  <li className="text-[10px] text-[#667085] italic pl-5">
                    + {selectionStages.filter((s) => s.trim().length > 0).length - 3} more stages
                  </li>
                )}
              </ul>
            </div>

            {/* Direct Official Action Links Preview */}
            <div className="p-3 rounded-[4px] bg-[#F4F6FA] border border-[#E4E7EC] space-y-1.5 text-[12px]">
              <div className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#12305A]">
                Direct Action Portal Links
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-[#12305A] text-white py-1 px-2 rounded text-center font-semibold truncate">
                  Apply Online
                </div>
                <div className="bg-white border border-[#E4E7EC] text-[#12305A] py-1 px-2 rounded text-center font-semibold truncate">
                  Notice PDF
                </div>
              </div>
            </div>

            {/* Job Description & Candidate FAQs Preview Snippets */}
            <div className="p-3 rounded-[4px] bg-[#FAFAFC] border border-[#E4E7EC] space-y-2 text-[12px]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-[#12305A] block mb-1">
                  Recruitment Overview
                </span>
                <p className="text-[11px] text-[#475467] line-clamp-2 leading-relaxed italic">
                  "{description || 'Official recruitment notification under the Government of India...'}"
                </p>
              </div>

              <div className="pt-2 border-t border-[#E4E7EC] flex items-center justify-between text-[11px]">
                <span className="text-[#667085]">Candidate FAQs Configured:</span>
                <span className="font-bold text-[#12305A] bg-[#E9EDFF] px-2 py-0.5 rounded">
                  {faqs.filter((f) => f.question.trim().length > 0).length} Questions
                </span>
              </div>
            </div>

            {/* Schedule & Compliance Summary */}
            <div className="space-y-2 text-[12px] tabular-data">
              <div className="flex items-center justify-between py-1.5 border-b border-[#E4E7EC]">
                <span className="text-[#667085] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#12305A]" aria-hidden="true" />
                  <span>Application Begin Date</span>
                </span>
                <span className="font-semibold text-[#172033]">
                  {startDate || 'Today (Gazette Release)'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#E4E7EC]">
                <span className="text-[#667085] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#DC2626]" aria-hidden="true" />
                  <span>Application Closing Deadline</span>
                </span>
                <span className="font-semibold text-[#172033]">
                  {deadlineDate || 'Not Selected'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#E4E7EC]">
                <span className="text-[#667085] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#18864B]" aria-hidden="true" />
                  <span>Scheduled Exam Date</span>
                </span>
                {isExamDateTBD || !examDate ? (
                  <span className="font-semibold text-[#12305A] bg-[#E9EDFF] px-2 py-0.5 rounded text-[11px]">
                    Will be announced soon
                  </span>
                ) : (
                  <span className="font-semibold text-[#172033]">
                    {examDate}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#667085] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#12305A]" aria-hidden="true" />
                  <span>Horizontal PwBD Quota</span>
                </span>
                <span className="font-semibold text-[#12305A]">4% Statutory Allocation</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
