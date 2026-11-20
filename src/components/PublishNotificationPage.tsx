import React, { useState, useEffect, useRef } from 'react';
import {
  NewNotificationInput,
  PipelineStatus,
  PostBreakdownInput,
  RecruitmentNotification,
} from '../types/recruitment';
import {
  validateNotificationInput,
} from '../utils/recruitmentLogic';
import { StatusBadge } from './StatusBadge';
import { api } from '../services/api';
import { aiIntakeService, ExtractedJobData } from '../services/aiIntakeService';
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
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Check,
  Clock,
  Layers,
  Send,
  Eye,
  Building2,
  BadgeAlert,
  Ticket,
  KeyRound,
  BookOpen,
  UploadCloud,
  FileSpreadsheet,
  Save,
  RotateCcw,
  Database,
  Bot,
  Loader2,
  CheckCheck,
  FileCode,
  XCircle,
  X,
} from 'lucide-react';

const SAMPLE_NOTIFICATION_TEXT = `UNION PUBLIC SERVICE COMMISSION (UPSC)
EXAMINATION NOTICE NO. 05/2026-CSP
DATE OF NOTIFICATION: 14/02/2026
LAST DATE FOR SUBMISSION OF APPLICATIONS: 05/03/2026 UP TO 18:00 HOURS
CIVIL SERVICES (PRELIMINARY) EXAMINATION 2026

1. CANDIDATES TO ENSURE THEIR ELIGIBILITY:
Candidates applying for the examination should ensure that they fulfill all eligibility conditions for admission to examination.
2. HOW TO APPLY:
Candidates are required to apply online by using the official website https://upsconline.nic.in.
Official Website: https://upsc.gov.in
Official Gazette Notification PDF: https://upsc.gov.in/sites/default/files/Notice-CSP-2026.pdf
3. NUMBER OF VACANCIES:
The number of vacancies to be filled through the examination is expected to be approximately 1056.
Cadre Post Breakdown:
- Indian Administrative Service (IAS): 180 vacancies (Graduate Degree in Any Stream)
- Indian Police Service (IPS): 200 vacancies (Graduate Degree in Any Stream)
- Indian Foreign Service (IFS): 45 vacancies (Graduate Degree in Any Stream)
- Central Services Group 'A' (IRS, IAAS, ICAS): 631 vacancies (Graduate Degree in Any Stream)
4. PAY SCALE:
Pay Level-10 (₹56,100 – ₹1,77,500) as per 7th Central Pay Commission matrix for Group-A services.
5. AGE LIMITS:
A candidate must have attained the age of 21 years and must not have attained the age of 32 years on the 1st of August, 2026. Upper age limit relaxable for SC/ST by 5 years, OBC by 3 years, PwBD by 10 years.
6. MINIMUM EDUCATIONAL QUALIFICATIONS:
A candidate must hold a Graduate degree in any stream from recognized University or equivalent.
7. APPLICATION FEE:
Candidates (except Female/SC/ST/PwBD candidates who are exempted from payment of fee) are required to pay a fee of Rs. 100/- (Rupees One Hundred only) either by remitting the money in any Branch of SBI by cash, or by using Net Banking, Debit/Credit Card, or UPI.
8. DATE OF EXAMINATION:
The Civil Services (Preliminary) Examination, 2026 will be held on 2026-05-24.
9. PLAN OF EXAMINATION:
Stage 1: Preliminary Examination (Objective Type Screening Test)
Stage 2: Main Written Examination (Descriptive Nine Papers)
Stage 3: Personality Test / Interview & Final Cadre Allocation`;

interface PublishNotificationPageProps {
  nextGazetteNumber: number;
  initialJob?: RecruitmentNotification | null;
  onCancel: () => void;
  onPublish: (input: NewNotificationInput) => void;
  onUpdate?: (id: string, input: NewNotificationInput) => void;
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
  'Defence Research & Development Organisation (DRDO)',
  'Food Corporation of India (FCI)',
  'Oil and Natural Gas Corporation (ONGC)',
  'Indian Oil Corporation Limited (IOCL)',
  'NTPC Limited (NTPC)',
  'Steel Authority of India Limited (SAIL)',
  'Bharat Heavy Electricals Limited (BHEL)',
  'GAIL (India) Limited (GAIL)',
  'Hindustan Petroleum Corporation Limited (HPCL)',
  'Bharat Petroleum Corporation Limited (BPCL)',
  'Coal India Limited (CIL)',
  'Power Grid Corporation of India (PGCIL)',
  'Bharat Electronics Limited (BEL)',
  'Hindustan Aeronautics Limited (HAL)',
  'Delhi Metro Rail Corporation (DMRC)',
  'Uttar Pradesh Metro Rail Corporation (UPMRC)',
  'State Bank of India (SBI)',
  'Reserve Bank of India (RBI)',
  'National Bank for Agriculture and Rural Development (NABARD)',
  'Securities and Exchange Board of India (SEBI)',
  'Life Insurance Corporation of India (LIC)',
  'Delhi Subordinate Services Selection Board (DSSSB)',
  'National Testing Agency (NTA)',
  'Central Board of Secondary Education (CBSE)',
  'All India Institute of Medical Sciences (AIIMS)',
  'Kendriya Vidyalaya Sangathan (KVS)',
  'Navodaya Vidyalaya Samiti (NVS)',
  'Airports Authority of India (AAI)',
  'Uttar Pradesh Public Service Commission (UPPSC)',
  'Uttar Pradesh Subordinate Services Selection Commission (UPSSSC)',
  'Uttar Pradesh Police Recruitment and Promotion Board (UPPRPB)',
  'Bihar Public Service Commission (BPSC)',
  'Bihar Staff Selection Commission (BSSC)',
  'Central Selection Board of Constable (CSBC)',
  'Rajasthan Public Service Commission (RPSC)',
  'Rajasthan Staff Selection Board (RSMSSB)',
  'Madhya Pradesh Public Service Commission (MPPSC)',
  'Madhya Pradesh Employees Selection Board (MPESB)',
  'Haryana Staff Selection Commission (HSSC)',
  'Haryana Public Service Commission (HPSC)',
  'Uttarakhand Public Service Commission (UKPSC)',
  'West Bengal Public Service Commission (WBPSC)',
  'Jharkhand Staff Selection Commission (JSSC)',
  'Maharashtra Public Service Commission (MPSC)',
  'Gujarat Public Service Commission (GPSC)',
  'Join Indian Army (Indian Army)',
  'Join Indian Navy (Indian Navy)',
  'Indian Air Force (Indian Air Force)',
  'Central Reserve Police Force (CRPF)',
  'Border Security Force (BSF)',
  'Central Industrial Security Force (CISF)',
  'Indo-Tibetan Border Police (ITBP)',
  'Delhi Police Recruitment Cell (Delhi Police)',
];

const PAY_LEVELS = [
  // 7th CPC Matrix Levels
  'Level-1 (₹18,000 – ₹56,900) · Group D / MTS / Helper',
  'Level-2 (₹19,900 – ₹63,200) · LDC / Junior Clerk',
  'Level-3 (₹21,700 – ₹69,100) · Constable / Clerk Grade-II',
  'Level-4 (₹25,500 – ₹81,100) · Head Constable / Postal Assistant',
  'Level-5 (₹29,200 – ₹92,300) · Sub-Inspector / Senior Clerk',
  'Level-6 (₹35,400 – ₹1,12,400) · Inspector / Assistant / JE',
  'Level-7 (₹44,900 – ₹1,42,400) · Assistant Section Officer / Inspector',
  'Level-8 (₹47,600 – ₹1,51,100) · Section Officer / AAO',
  'Level-9 (₹53,100 – ₹1,67,800) · Assistant Commissioner / Account Officer',
  'Level-10 (₹56,100 – ₹1,77,500) · Group-A / SDM / Medical Officer',
  'Level-11 (₹67,700 – ₹2,08,700) · Deputy Secretary / Executive Engineer',
  'Level-12 (₹78,800 – ₹2,09,200) · Director / Chief Engineer',
  'Level-13 (₹1,23,100 – ₹2,15,900) · Joint Secretary / Chief Conservator',
  'Level-14 (₹1,44,200 – ₹2,18,200) · Additional Secretary / Director General',

  // Banking & Financial Cadres
  'Bank Clerk Cadre (₹19,900 – ₹47,920)',
  'Scale-I Officer / Probationary Officer (₹48,480 – ₹85,920)',
  'Scale-II Manager (₹64,820 – ₹93,960)',
  'Scale-III Senior Manager (₹76,010 – ₹1,00,350)',

  // Public Sector & Corporation IDA Scales
  'Executive Scale E-1 (₹40,000 – ₹1,40,000)',
  'Executive Scale E-2 (₹50,000 – ₹1,60,000)',
  'Executive Scale E-3 (₹60,000 – ₹1,80,000)',
  'Non-Executive / Technician (₹21,500 – ₹86,500)',

  // Contractual / Consolidated Monthly Salary
  'Consolidated ₹25,000/- Per Month',
  'Consolidated ₹35,000/- Per Month',
  'Consolidated ₹50,000/- Per Month',
  'Agniveer Stipend (₹30,000 – ₹40,000 Per Month)',
];

const PIPELINE_STATUS_OPTIONS: Array<{
  value: PipelineStatus;
  label: string;
  badgeText: string;
  description: string;
}> = [
  {
    value: 'Application Open / Active',
    label: 'Application Open / Active (Online Form Live)',
    badgeText: '🟢 Live Form',
    description: 'Online application open for applicants · Appears in Latest Notifications on BharatRojgar',
  },
  {
    value: 'Admit Card / Active',
    label: 'Admit Card / Active (Exam Hall Ticket Out)',
    badgeText: '🎫 Hall Ticket Out',
    description: 'Admit cards released for scheduled exam · Appears in Admit Cards channel',
  },
  {
    value: 'Answer Key Out',
    label: 'Answer Key Out (Provisional / Final Keys)',
    badgeText: '🔑 Answer Key Out',
    description: 'Question papers & objection key live · Appears in Answer Keys channel',
  },
  {
    value: 'Result Announced',
    label: 'Result Announced (Cutoff & Merit List Declared)',
    badgeText: '🏆 Result Declared',
    description: 'Final merit list and scorecard published · Appears in Results channel',
  },
  {
    value: 'Pending / Scrutiny',
    label: 'Pending / Scrutiny (Pre-Application Window)',
    badgeText: '⏳ Under Review',
    description: 'Requisition verified by commission · Awaiting formal application opening',
  },
  {
    value: 'Rejected / Cancelled',
    label: 'Rejected / Cancelled (Requisition Cancelled)',
    badgeText: '🚫 Cancelled',
    description: 'Notification cancelled or deferred by issuing authority',
  },
];

export const PublishNotificationPage: React.FC<PublishNotificationPageProps> = ({
  nextGazetteNumber,
  initialJob,
  onCancel,
  onPublish,
  onUpdate,
}) => {
  const isEditMode = Boolean(initialJob);

  const [departments, setDepartments] = useState<string[]>(DEFAULT_DEPARTMENTS);
  const [advtNo, setAdvtNo] = useState(initialJob?.advtNo || '');
  const [postTitle, setPostTitle] = useState(initialJob?.postTitle || '');
  const [department, setDepartment] = useState(initialJob?.department || '');
  const [isCustomDept, setIsCustomDept] = useState(() => {
    if (!initialJob?.department) return false;
    return !DEFAULT_DEPARTMENTS.some(
      (d) => d.toLowerCase() === initialJob.department.toLowerCase()
    );
  });
  const [payLevel, setPayLevel] = useState(initialJob?.payLevel || '');
  const [isCustomPay, setIsCustomPay] = useState(() => {
    if (!initialJob?.payLevel) return false;
    return !PAY_LEVELS.some(
      (p) =>
        p.toLowerCase().startsWith(initialJob.payLevel.toLowerCase()) ||
        initialJob.payLevel.toLowerCase().includes(p.toLowerCase())
    );
  });
  const [vacanciesStr, setVacanciesStr] = useState(
    initialJob ? String(initialJob.vacancies) : ''
  );
  // Category-wise vacancy breakdown (UR, OBC, SC, ST, EWS) — strictly from PDF or admin entry, no mathematical fabrication
  const [catUR, setCatUR] = useState(
    initialJob?.categoryBreakdown?.UR !== undefined && initialJob.categoryBreakdown.UR > 0
      ? String(initialJob.categoryBreakdown.UR)
      : ''
  );
  const [catOBC, setCatOBC] = useState(
    initialJob?.categoryBreakdown?.OBC !== undefined && initialJob.categoryBreakdown.OBC > 0
      ? String(initialJob.categoryBreakdown.OBC)
      : ''
  );
  const [catSC, setCatSC] = useState(
    initialJob?.categoryBreakdown?.SC !== undefined && initialJob.categoryBreakdown.SC > 0
      ? String(initialJob.categoryBreakdown.SC)
      : ''
  );
  const [catST, setCatST] = useState(
    initialJob?.categoryBreakdown?.ST !== undefined && initialJob.categoryBreakdown.ST > 0
      ? String(initialJob.categoryBreakdown.ST)
      : ''
  );
  const [catEWS, setCatEWS] = useState(
    initialJob?.categoryBreakdown?.EWS !== undefined && initialJob.categoryBreakdown.EWS > 0
      ? String(initialJob.categoryBreakdown.EWS)
      : ''
  );
  const [startDate, setStartDate] = useState(
    initialJob?.startDate || new Date().toISOString().slice(0, 10)
  );
  const [deadlineDate, setDeadlineDate] = useState(initialJob?.deadlineDate || '');
  const [examDate, setExamDate] = useState(initialJob?.examDate || '');
  const [isExamDateTBD, setIsExamDateTBD] = useState(
    initialJob ? !initialJob.examDate || initialJob.examDate.trim().length === 0 : false
  );
  const [status, setStatus] = useState<PipelineStatus>(
    initialJob?.status || 'Application Open / Active'
  );
  const [forceAiRefresh, setForceAiRefresh] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dynamic Application Fee Structure
  const [feeGeneral, setFeeGeneral] = useState(
    initialJob?.applicationFees?.general !== undefined
      ? String(initialJob.applicationFees.general)
      : ''
  );
  const [feeObc, setFeeObc] = useState(
    initialJob?.applicationFees?.obc !== undefined
      ? String(initialJob.applicationFees.obc)
      : ''
  );
  const [feeScSt, setFeeScSt] = useState(
    initialJob?.applicationFees?.scSt !== undefined
      ? String(initialJob.applicationFees.scSt)
      : ''
  );
  const [feeFemale, setFeeFemale] = useState(
    initialJob?.applicationFees?.female !== undefined
      ? String(initialJob.applicationFees.female)
      : ''
  );
  const [paymentMode, setPaymentMode] = useState(
    initialJob?.applicationFees?.paymentMode || ''
  );

  // Dynamic Eligibility & Age Limit
  const [qualificationSummary, setQualificationSummary] = useState(
    initialJob?.qualificationSummary || ''
  );
  const [ageLimitSummary, setAgeLimitSummary] = useState(
    initialJob?.ageLimitSummary || ''
  );

  // Dynamic Post-Wise Vacancy & Qualification Breakdown
  const [posts, setPosts] = useState<PostRow[]>(() => {
    if (initialJob?.postBreakdown && initialJob.postBreakdown.length > 0) {
      return initialJob.postBreakdown.map((pb, idx) => ({
        id: `post-${idx + 1}`,
        postName: pb.postName,
        vacancies: String(pb.vacancies),
        qualification: pb.qualification,
      }));
    }
    return [
      {
        id: 'post-1',
        postName: '',
        vacancies: '',
        qualification: '',
      },
    ];
  });

  // Dynamic Official Direct Links
  const [applyOnlineUrl, setApplyOnlineUrl] = useState(
    initialJob?.applyOnlineUrl || ''
  );
  const [officialNoticePdfUrl, setOfficialNoticePdfUrl] = useState(
    initialJob?.officialNoticePdfUrl || ''
  );
  const [officialWebsiteUrl, setOfficialWebsiteUrl] = useState(
    initialJob?.officialWebsiteUrl || ''
  );
  const [admitCardUrl, setAdmitCardUrl] = useState(
    initialJob?.admitCardUrl || ''
  );
  const [answerKeyUrl, setAnswerKeyUrl] = useState(
    initialJob?.answerKeyUrl || ''
  );
  const [syllabusUrl, setSyllabusUrl] = useState(
    initialJob?.syllabusUrl || ''
  );

  // Dynamic Selection Process Stages
  const [selectionStages, setSelectionStages] = useState<string[]>(
    initialJob?.selectionStages && initialJob.selectionStages.length > 0
      ? initialJob.selectionStages
      : []
  );

  // Dynamic Official Job Description & Role Scope
  const [description, setDescription] = useState(
    initialJob?.description || ''
  );

  // Dynamic Frequently Asked Questions (FAQs)
  const [faqs, setFaqs] = useState<FaqRow[]>(() => {
    if (initialJob?.faqs && initialJob.faqs.length > 0) {
      return initialJob.faqs.map((f, idx) => ({
        id: `faq-${idx + 1}`,
        question: f.question,
        answer: f.answer,
      }));
    }
    return [];
  });

  useEffect(() => {
    api
      .getOrganizations()
      .then((orgs) => {
        if (orgs && orgs.length > 0) {
          const names = orgs.map((o) => `${o.name} (${o.code})`);
          const combined = Array.from(new Set([...names, ...DEFAULT_DEPARTMENTS]));
          combined.sort((a, b) => a.localeCompare(b));
          setDepartments(combined);
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
    if (posts.length <= 1) return;
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
    if (selectionStages.length <= 1) return;
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

  const handleInsertDescriptionTemplate = () => {
    setDescription(
      `Official recruitment notification released under the authority of Government of India by ${
        department || 'the competent recruiting authority'
      }. The examination is conducted to fill ${
        vacanciesStr ? vacanciesStr + ' sanctioned vacancies' : 'sanctioned vacancies'
      } across designated cadres. Candidates are advised to review the statutory seat matrix, post-wise eligibility criteria, age limits, and scheme of examination carefully before submitting their application.`
    );
  };

  // ─── AI INTAKE & AUTO-DRAFT STATE ──────────────────────────────────────
  const [aiDeskOpen, setAiDeskOpen] = useState(true);
  const [aiInputMode, setAiInputMode] = useState<'upload' | 'paste'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisSuccess, setAnalysisSuccess] = useState<string | null>(null);
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());

  // Option B: Direct DB Auto-Saved Draft from MongoDB
  const [dbDraftJob, setDbDraftJob] = useState<{
    _id: string;
    customId: string;
    gazetteRef: string;
    status: string;
  } | null>(null);

  // Draft auto-save state
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [restoredFromDraft, setRestoredFromDraft] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const numericVacancies = parseInt(vacanciesStr, 10) || 0;
  const breakdown = {
    UR: parseInt(catUR, 10) || 0,
    OBC: parseInt(catOBC, 10) || 0,
    SC: parseInt(catSC, 10) || 0,
    ST: parseInt(catST, 10) || 0,
    EWS: parseInt(catEWS, 10) || 0,
  };
  const totalCategorySum = breakdown.UR + breakdown.OBC + breakdown.SC + breakdown.ST + breakdown.EWS;
  const hasCategoryBreakdown = Boolean(catUR || catOBC || catSC || catST || catEWS);
  const previewGazetteRef = `GSR-${nextGazetteNumber || 1}(E)/${new Date().getFullYear()}`;

  // Helper to construct complete NewNotificationInput payload
  const buildInputPayload = (targetStatus?: PipelineStatus): NewNotificationInput => {
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

    return {
      advtNo: advtNo.trim(),
      postTitle: postTitle.trim(),
      department,
      payLevel,
      vacancies: numericVacancies,
      categoryBreakdown: hasCategoryBreakdown ? breakdown : undefined,
      startDate: startDate || undefined,
      deadlineDate,
      examDate: isExamDateTBD || !examDate ? '' : examDate,
      status: targetStatus || status,
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
      admitCardUrl: admitCardUrl.trim() || undefined,
      answerKeyUrl: answerKeyUrl.trim() || undefined,
      syllabusUrl: syllabusUrl.trim() || undefined,
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
  };

  // 1. Check and restore auto-saved draft on initial mount
  useEffect(() => {
    if (!isEditMode) {
      const saved = aiIntakeService.loadDraft();
      if (saved && saved.data) {
        if (!advtNo && !postTitle) {
          applyExtractedData(saved.data as ExtractedJobData);
          setDraftSavedAt(new Date(saved.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          setRestoredFromDraft(true);
        }
      }
    }
  }, []);

  // 2. Debounced auto-save to Draft storage
  useEffect(() => {
    if (isEditMode) return;
    const timer = setTimeout(() => {
      if (advtNo || postTitle || (vacanciesStr && vacanciesStr !== '0')) {
        const payload = buildInputPayload(status);
        aiIntakeService.saveDraft(payload, autoFilledFields.size > 0 ? 'backend_ai' : 'manual');
        setDraftSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [
    advtNo,
    postTitle,
    department,
    payLevel,
    vacanciesStr,
    startDate,
    deadlineDate,
    examDate,
    status,
    feeGeneral,
    feeObc,
    feeScSt,
    feeFemale,
    paymentMode,
    qualificationSummary,
    ageLimitSummary,
    posts,
    selectionStages,
    applyOnlineUrl,
    officialNoticePdfUrl,
    officialWebsiteUrl,
    admitCardUrl,
    answerKeyUrl,
    syllabusUrl,
    description,
    faqs,
  ]);

  // Apply extracted fields from backend AI into component state
  const applyExtractedData = (data: ExtractedJobData) => {
    const filled = new Set<string>();

    if (data.advtNo && data.advtNo.trim().length > 0) {
      setAdvtNo(data.advtNo.trim());
      filled.add('advtNo');
    } else {
      setAdvtNo('');
    }

    if (data.postTitle && data.postTitle.trim().length > 0) {
      setPostTitle(data.postTitle.trim());
      filled.add('postTitle');
    } else {
      setPostTitle('');
    }

    if (data.department && data.department.trim().length > 0) {
      const cleanDept = data.department.trim();
      const match = departments.find(
        (d) =>
          d.toLowerCase() === cleanDept.toLowerCase() ||
          d.toLowerCase().includes(cleanDept.toLowerCase()) ||
          cleanDept.toLowerCase().includes(d.toLowerCase())
      );
      if (match) {
        setIsCustomDept(false);
        setDepartment(match);
      } else {
        setIsCustomDept(true);
        setDepartment(cleanDept);
      }
      filled.add('department');
    } else {
      // Data not available in notification: auto-switch to custom and set 'N/A'
      setIsCustomDept(true);
      setDepartment('N/A');
    }

    if (data.payLevel && data.payLevel.trim().length > 0) {
      const cleanPay = data.payLevel.trim();
      const matchPay = PAY_LEVELS.find((p) =>
        p.toLowerCase().includes(cleanPay.toLowerCase().slice(0, 8))
      );
      if (matchPay) {
        setIsCustomPay(false);
        setPayLevel(matchPay);
      } else {
        setIsCustomPay(true);
        setPayLevel(cleanPay);
      }
      filled.add('payLevel');
    } else {
      // Data not available in notification: auto-switch to custom and set 'N/A'
      setIsCustomPay(true);
      setPayLevel('N/A');
    }

    if (data.vacancies !== undefined && data.vacancies !== null && data.vacancies > 0) {
      setVacanciesStr(String(data.vacancies));
      filled.add('vacancies');
    } else {
      setVacanciesStr('');
    }

    // Category breakdown: Only populated if explicitly extracted from notice; otherwise vacant (no mathematical fabrication)
    if (data.categoryBreakdown) {
      const cb = data.categoryBreakdown;
      const hasAny =
        (cb.UR || 0) > 0 ||
        (cb.OBC || 0) > 0 ||
        (cb.SC || 0) > 0 ||
        (cb.ST || 0) > 0 ||
        (cb.EWS || 0) > 0;
      if (hasAny) {
        setCatUR(cb.UR && cb.UR > 0 ? String(cb.UR) : '');
        setCatOBC(cb.OBC && cb.OBC > 0 ? String(cb.OBC) : '');
        setCatSC(cb.SC && cb.SC > 0 ? String(cb.SC) : '');
        setCatST(cb.ST && cb.ST > 0 ? String(cb.ST) : '');
        setCatEWS(cb.EWS && cb.EWS > 0 ? String(cb.EWS) : '');
        filled.add('categoryBreakdown');
      } else {
        setCatUR('');
        setCatOBC('');
        setCatSC('');
        setCatST('');
        setCatEWS('');
      }
    } else {
      setCatUR('');
      setCatOBC('');
      setCatSC('');
      setCatST('');
      setCatEWS('');
    }

    if (data.startDate && data.startDate.trim().length > 0) {
      setStartDate(data.startDate.trim());
      filled.add('startDate');
    } else {
      setStartDate('');
    }

    if (data.deadlineDate && data.deadlineDate.trim().length > 0) {
      setDeadlineDate(data.deadlineDate.trim());
      filled.add('deadlineDate');
    } else {
      setDeadlineDate('');
    }

    if (data.examDate && data.examDate.trim().length > 0) {
      setExamDate(data.examDate.trim());
      setIsExamDateTBD(false);
      filled.add('examDate');
    } else {
      setExamDate('');
      setIsExamDateTBD(true);
    }

    if (data.applicationFees) {
      if (data.applicationFees.general !== undefined && data.applicationFees.general > 0) {
        setFeeGeneral(String(data.applicationFees.general));
        filled.add('feeGeneral');
      } else {
        setFeeGeneral('');
      }

      if (data.applicationFees.obc !== undefined && data.applicationFees.obc > 0) {
        setFeeObc(String(data.applicationFees.obc));
        filled.add('feeObc');
      } else {
        setFeeObc('');
      }

      if (data.applicationFees.scSt !== undefined && data.applicationFees.scSt > 0) {
        setFeeScSt(String(data.applicationFees.scSt));
        filled.add('feeScSt');
      } else {
        setFeeScSt('');
      }

      if (data.applicationFees.female !== undefined && data.applicationFees.female > 0) {
        setFeeFemale(String(data.applicationFees.female));
        filled.add('feeFemale');
      } else {
        setFeeFemale('');
      }

      if (data.applicationFees.paymentMode && data.applicationFees.paymentMode.trim().length > 0) {
        setPaymentMode(data.applicationFees.paymentMode.trim());
        filled.add('paymentMode');
      } else {
        setPaymentMode('');
      }
    } else {
      setFeeGeneral('');
      setFeeObc('');
      setFeeScSt('');
      setFeeFemale('');
      setPaymentMode('');
    }

    if (data.qualificationSummary && data.qualificationSummary.trim().length > 0) {
      setQualificationSummary(data.qualificationSummary.trim());
      filled.add('qualificationSummary');
    } else {
      setQualificationSummary('');
    }

    if (data.ageLimitSummary && data.ageLimitSummary.trim().length > 0) {
      setAgeLimitSummary(data.ageLimitSummary.trim());
      filled.add('ageLimitSummary');
    } else {
      setAgeLimitSummary('');
    }

    if (data.postBreakdown && data.postBreakdown.length > 0) {
      setPosts(
        data.postBreakdown.map((pb, idx) => ({
          id: `post-${idx + 1}-${Date.now()}`,
          postName: pb.postName || '',
          vacancies: String(pb.vacancies || 0),
          qualification: pb.qualification || '',
        }))
      );
      filled.add('posts');
    } else {
      setPosts([
        {
          id: 'post-1',
          postName: '',
          vacancies: '',
          qualification: '',
        },
      ]);
    }

    if (data.selectionStages && data.selectionStages.length > 0) {
      setSelectionStages(data.selectionStages.map((s) => String(s).trim()));
      filled.add('selectionStages');
    } else {
      setSelectionStages([]);
    }

    if (data.applyOnlineUrl && data.applyOnlineUrl.trim().length > 0) {
      setApplyOnlineUrl(data.applyOnlineUrl.trim());
      filled.add('applyOnlineUrl');
    } else {
      setApplyOnlineUrl('');
    }

    if (data.officialNoticePdfUrl && data.officialNoticePdfUrl.trim().length > 0) {
      setOfficialNoticePdfUrl(data.officialNoticePdfUrl.trim());
      filled.add('officialNoticePdfUrl');
    } else {
      setOfficialNoticePdfUrl('');
    }

    if (data.officialWebsiteUrl && data.officialWebsiteUrl.trim().length > 0) {
      setOfficialWebsiteUrl(data.officialWebsiteUrl.trim());
      filled.add('officialWebsiteUrl');
    } else {
      setOfficialWebsiteUrl('');
    }

    if (data.admitCardUrl && data.admitCardUrl.trim().length > 0) {
      setAdmitCardUrl(data.admitCardUrl.trim());
      filled.add('admitCardUrl');
    } else {
      setAdmitCardUrl('');
    }

    if (data.answerKeyUrl && data.answerKeyUrl.trim().length > 0) {
      setAnswerKeyUrl(data.answerKeyUrl.trim());
      filled.add('answerKeyUrl');
    } else {
      setAnswerKeyUrl('');
    }

    if (data.syllabusUrl && data.syllabusUrl.trim().length > 0) {
      setSyllabusUrl(data.syllabusUrl.trim());
      filled.add('syllabusUrl');
    } else {
      setSyllabusUrl('');
    }

    if (data.description && data.description.trim().length > 0) {
      setDescription(data.description.trim());
      filled.add('description');
    } else {
      setDescription('');
    }

    if (data.faqs && data.faqs.length > 0) {
      setFaqs(
        data.faqs.map((f, idx) => ({
          id: `faq-${idx + 1}-${Date.now()}`,
          question: f.question,
          answer: f.answer,
        }))
      );
      filled.add('faqs');
    } else {
      setFaqs([]);
    }

    // Crucial: Set status to Draft ('Pending / Scrutiny') so it is NOT directly live on citizen portal!
    setStatus('Pending / Scrutiny');
    setAutoFilledFields(filled);

    // If backend auto-saved the draft directly into MongoDB (Option B)
    if (data.draftJob) {
      setDbDraftJob({
        _id: data.draftJob._id || (data.draftJob as any).id,
        customId: data.draftJob.customId || '',
        gazetteRef: data.draftJob.gazetteRef || '',
        status: data.draftJob.status || 'Pending / Scrutiny',
      });
    }

    // Save auto-filled values directly into draft storage
    const currentPayload = buildInputPayload('Pending / Scrutiny');
    aiIntakeService.saveDraft(
      currentPayload,
      'backend_ai',
      selectedFile?.name || 'Copied Notification Text',
      data.draftJob?._id,
      data.draftJob?.gazetteRef
    );
    setDraftSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  // Action: Analyze document or text using backend AI
  const handleAnalyze = async () => {
    setAnalysisError(null);
    setAnalysisSuccess(null);

    if (aiInputMode === 'upload' && !selectedFile) {
      setAnalysisError('Please choose or drag-and-drop an official notification file (PDF, TXT, DOCX).');
      return;
    }

    if (aiInputMode === 'paste' && (!pastedText || pastedText.trim().length < 20)) {
      setAnalysisError('Please paste notification text or circular details (at least 20 characters).');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress('Initializing backend AI engine...');

    try {
      let extracted: ExtractedJobData;
      if (aiInputMode === 'upload' && selectedFile) {
        extracted = await aiIntakeService.extractFromFile(selectedFile, {
          onProgress: (step) => setAnalysisProgress(step),
          autoSaveDraft: true,
          forceRefresh: forceAiRefresh,
        });
      } else {
        extracted = await aiIntakeService.extractFromText(pastedText, {
          onProgress: (step) => setAnalysisProgress(step),
          autoSaveDraft: true,
          forceRefresh: forceAiRefresh,
        });
      }

      applyExtractedData(extracted);
      if (extracted.draftJob) {
        setAnalysisSuccess(
          `Analysis Successful! 18 parameters extracted and directly saved to MongoDB as an unpublished Draft (${extracted.draftJob.customId} · ${extracted.draftJob.gazetteRef}). Status: Pending / Scrutiny (internal only — NOT visible on public portal). Review fields below and click "Publish Gazette Notification" when ready.`
        );
      } else {
        setAnalysisSuccess(
          `Analysis Successful! 18 parameters extracted from official notification. The form has been populated and saved to internal Draft. Review all details below before publishing live.`
        );
      }
    } catch (err: any) {
      console.error('[PublishPage] AI Extraction Error:', err);
      setAnalysisError(err?.message || 'Failed to extract notification details from document. Please verify the document format or try again.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress('');
    }
  };

  // Action: Save as Draft (Internal Scrutiny - NOT live to public)
  const handleSaveAsDraft = () => {
    if (!advtNo.trim()) {
      setErrors({ advtNo: 'Advertisement Number is required to save a draft.' });
      return;
    }
    if (!postTitle.trim()) {
      setErrors({ postTitle: 'Post / Examination Title is required to save a draft.' });
      return;
    }

    setErrors({});
    const input = buildInputPayload('Pending / Scrutiny');

    if (isCustomDept && department.trim().length > 0) {
      const match = department.match(/^(.*?)(?:\s*\((.*?)\))?$/);
      const name = match && match[1] ? match[1].trim() : department.trim();
      const shortName = match && match[2] ? match[2].trim() : name.slice(0, 8).toUpperCase();
      api.createOrganization({ name, shortName }).catch(() => {});
    }

    aiIntakeService.clearDraft();
    if (dbDraftJob && onUpdate) {
      onUpdate(dbDraftJob._id, input);
    } else if (isEditMode && initialJob && onUpdate) {
      onUpdate(initialJob.id, input);
    } else {
      onPublish(input);
    }
  };

  // Action: Discard Draft & Reset form
  const handleDiscardDraft = () => {
    if (window.confirm('Are you sure you want to discard this draft and reset all fields?')) {
      aiIntakeService.clearDraft();
      setDbDraftJob(null);
      setAdvtNo('');
      setPostTitle('');
      setDepartment('');
      setPayLevel('');
      setVacanciesStr('');
      setCatUR('');
      setCatOBC('');
      setCatSC('');
      setCatST('');
      setCatEWS('');
      setStartDate(new Date().toISOString().slice(0, 10));
      setDeadlineDate('');
      setExamDate('');
      setIsExamDateTBD(false);
      setStatus('Pending / Scrutiny');
      setFeeGeneral('100');
      setFeeObc('100');
      setFeeScSt('0');
      setFeeFemale('0');
      setPaymentMode('Online via Net Banking, Debit / Credit Card, or UPI');
      setQualificationSummary('Graduate in required discipline from recognized university / board');
      setAgeLimitSummary('18 to 32 Years (Relaxations: OBC 3 yrs, SC/ST 5 yrs, PwD 10 yrs)');
      setPosts([
        {
          id: 'post-1',
          postName: '',
          vacancies: '',
          qualification: '',
        },
      ]);
      setApplyOnlineUrl('https://upsconline.nic.in');
      setOfficialNoticePdfUrl('');
      setOfficialWebsiteUrl('https://upsc.gov.in');
      setAdmitCardUrl('');
      setAnswerKeyUrl('');
      setSyllabusUrl('');
      setDescription('');
      setAutoFilledFields(new Set());
      setDraftSavedAt(null);
      setRestoredFromDraft(false);
      setSelectedFile(null);
      setPastedText('');
      setAnalysisSuccess(null);
      setAnalysisError(null);
    }
  };

  const renderAiBadge = (fieldKey: string) => {
    if (!autoFilledFields.has(fieldKey)) return null;
    return (
      <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
        <Sparkles className="w-2.5 h-2.5 text-amber-500" />
        <span>AI Auto-Filled</span>
      </span>
    );
  };

  // Verification Checklist Items
  const checklist = [
    {
      label: 'Advertisement Number provided',
      passed: Boolean(advtNo && advtNo.trim().length >= 4),
    },
    {
      label: 'Commission / Corporation identified',
      passed: Boolean(department && department.trim().length > 0),
    },
    {
      label: 'Official Post & Exam Title specified',
      passed: Boolean(postTitle && postTitle.trim().length >= 5),
    },
    {
      label: 'Sanctioned vacancies roster allocated',
      passed: Boolean(numericVacancies > 0),
    },
    {
      label: 'Registration closing deadline established',
      passed: Boolean(deadlineDate && deadlineDate.trim().length > 0),
    },
    {
      label: 'Official verified links provided',
      passed: Boolean(applyOnlineUrl && officialWebsiteUrl),
    },
  ];
  const passedChecksCount = checklist.filter((c) => c.passed).length;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Default to active live status when user explicitly publishes
    const publishStatus: PipelineStatus =
      status === 'Pending / Scrutiny' ? 'Application Open / Active' : status;

    const input = buildInputPayload(publishStatus);

    const validation = validateNotificationInput(input);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});

    if (isCustomDept && department.trim().length > 0) {
      const match = department.match(/^(.*?)(?:\s*\((.*?)\))?$/);
      const name = match && match[1] ? match[1].trim() : department.trim();
      const shortName = match && match[2] ? match[2].trim() : name.slice(0, 8).toUpperCase();
      api.createOrganization({ name, shortName }).catch(() => {});
    }

    aiIntakeService.clearDraft();
    if (dbDraftJob && onUpdate) {
      onUpdate(dbDraftJob._id, input);
    } else if (isEditMode && initialJob && onUpdate) {
      onUpdate(initialJob.id, input);
    } else {
      onPublish(input);
    }
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* ─── Top Executive Navigation Bar ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E7EC] w-full min-w-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-white border border-[#E4E7EC] text-[#12305A] text-[13px] font-semibold hover:bg-[#F4F6FA] transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Pipelines</span>
          </button>
          <div>
            <h1 className="text-[18px] leading-[26px] font-bold text-[#12305A]">
              {isEditMode ? `Edit Gazette Requisition · ${initialJob?.id}` : 'Publish Official Recruitment Notification'}
            </h1>
            <p className="text-[12px] text-[#667085]">
              Standard Gazette Entry Desk · Synchronized with BharatRojgar Citizen Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-[4px] bg-[#EFF4FB] border border-[#C7D7EE] text-[12px] font-medium text-[#12305A] tabular-data">
            Gazette Ref:{' '}
            <strong className="font-bold">{isEditMode ? initialJob?.gazetteRef : previewGazetteRef}</strong>
          </div>
          <StatusBadge status={status} size="sm" />
        </div>
      </div>

      {/* ─── OPTION B: DIRECT MONGODB DRAFT AUTO-SAVED BANNER ─────────── */}
      {dbDraftJob && (
        <div className="p-3.5 rounded-[6px] bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-[12px] flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-[4px] bg-[#10B981] text-white">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-[13px] flex items-center gap-2">
                <span>Auto-Saved to MongoDB Database as Draft</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#D1FAE5] border border-[#6EE7B7] text-[#047857]">
                  {dbDraftJob.customId}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-bold">
                  Status: Pending / Scrutiny
                </span>
              </div>
              <p className="text-[11px] text-[#047857] mt-0.5">
                Draft record is safely stored in the backend MongoDB database. It is <strong>100% hidden from the public citizen portal</strong>. Review/edit parameters below, and click <strong>Publish Gazette Notification</strong> when ready to make it live for applicants.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-[#059669] font-medium">Gazette Ref: {dbDraftJob.gazetteRef}</span>
          </div>
        </div>
      )}

      {/* ─── DRAFT RESTORATION / AUTO-SAVED NOTIFICATION BANNER ─────────── */}
      {restoredFromDraft && (
        <div className="p-3.5 rounded-[6px] bg-[#EFF8FF] border border-[#B2DDFF] text-[#175CD3] text-[12px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 shrink-0 text-[#2E90FA]" />
            <div>
              <strong className="font-bold text-[13px]">Unpublished Draft Restored:</strong> Your previous work was automatically recovered ({draftSavedAt || 'Recently'}). Data is held in draft mode and NOT published to the public portal.
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setRestoredFromDraft(false)}
              className="px-2.5 py-1 rounded-[4px] bg-white border border-[#B2DDFF] text-[#175CD3] font-semibold hover:bg-[#D1E9FF] text-[11px]"
            >
              Keep Draft
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="px-2.5 py-1 rounded-[4px] bg-[#FEF3F2] border border-[#FECDCA] text-[#B42318] font-semibold hover:bg-[#FEE4E2] text-[11px]"
            >
              Discard & Reset
            </button>
          </div>
        </div>
      )}

      {/* ─── AI NOTIFICATION INTAKE & AUTO-POPULATE DESK ───────── */}
      <div className="bg-white rounded-[6px] border border-[#C7D7EE] shadow-xs overflow-hidden">
        {/* Banner header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#12305A] via-[#1C4478] to-[#12305A] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[4px] bg-amber-400 text-[#12305A] shadow-xs">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-bold tracking-tight">
                  AI Notification Intake & Auto-Fill Desk
                </h2>
                <span className="px-2 py-0.5 rounded-[12px] bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7] text-[10px] font-bold uppercase tracking-wider">
                  Backend Powered
                </span>
              </div>
              <p className="text-[12px] text-[#D6E3FF]">
                Upload official notification PDF/Word or paste circular text. Backend AI extracts 18+ recruitment fields and auto-saves to Draft.
              </p>
            </div>
          </div>

          {/* Right Backend Status & Controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-3 py-1.5 rounded-[4px] bg-[#0E2749] text-[#D6E3FF] border border-[#2C5282] text-[11px] font-semibold flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Backend AI Engine · Direct DB Draft</span>
            </div>

            <button
              type="button"
              onClick={() => setAiDeskOpen((prev) => !prev)}
              className="px-2.5 py-1.5 rounded-[4px] bg-white/10 hover:bg-white/20 text-white text-[12px] font-medium transition-colors"
            >
              {aiDeskOpen ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>

        {/* Expandable Intake Body */}
        {aiDeskOpen && (
          <div className="p-5 space-y-4 bg-[#F8FAFC]">
            {/* Mode Tabs */}
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
              <button
                type="button"
                onClick={() => setAiInputMode('upload')}
                className={`px-3.5 py-1.5 rounded-[4px] text-[13px] font-bold flex items-center gap-2 transition-colors ${
                  aiInputMode === 'upload'
                    ? 'bg-[#12305A] text-white shadow-xs'
                    : 'bg-white text-[#475569] hover:bg-[#E2E8F0] border border-[#CBD5E1]'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Notification File (PDF, DOCX, TXT)</span>
              </button>

              <button
                type="button"
                onClick={() => setAiInputMode('paste')}
                className={`px-3.5 py-1.5 rounded-[4px] text-[13px] font-bold flex items-center gap-2 transition-colors ${
                  aiInputMode === 'paste'
                    ? 'bg-[#12305A] text-white shadow-xs'
                    : 'bg-white text-[#475569] hover:bg-[#E2E8F0] border border-[#CBD5E1]'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Paste Copied Notification Text</span>
              </button>
            </div>

            {/* TAB 1: File Upload Dropzone */}
            {aiInputMode === 'upload' && (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.txt,.docx,.doc,application/pdf,text/plain"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                      setAnalysisError(null);
                      setAnalysisSuccess(null);
                    }
                  }}
                />

                {!selectedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        setSelectedFile(e.dataTransfer.files[0]);
                        setAnalysisError(null);
                        setAnalysisSuccess(null);
                      }
                    }}
                    className="border-2 border-dashed border-[#94A3B8] hover:border-[#12305A] rounded-[8px] bg-white p-7 text-center cursor-pointer transition-colors group"
                  >
                    <div className="w-12 h-12 mx-auto rounded-full bg-[#EFF4FB] group-hover:bg-[#DCE7F6] text-[#12305A] flex items-center justify-center mb-3 transition-colors">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-[14px] font-bold text-[#1E293B]">
                      Click to browse or drag and drop official notification document
                    </p>
                    <p className="text-[12px] text-[#64748B] mt-1">
                      Supports PDF Gazette Notifications, Word DOCX bulletins, or Plain TXT circulars (up to 50MB)
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <span className="px-2 py-0.5 rounded bg-[#F1F5F9] text-[#475569] text-[11px] font-medium border border-[#E2E8F0]">
                        .PDF
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#F1F5F9] text-[#475569] text-[11px] font-medium border border-[#E2E8F0]">
                        .DOCX
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#F1F5F9] text-[#475569] text-[11px] font-medium border border-[#E2E8F0]">
                        .TXT
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-[6px] bg-white border border-[#CBD5E1] flex items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-[6px] bg-[#EFF4FB] text-[#12305A]">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[14px] font-bold text-[#0F172A]">{selectedFile.name}</p>
                          <span className="px-2 py-0.5 rounded bg-[#ECFDF5] text-[#059669] text-[11px] font-semibold border border-[#A7F3D0]">
                            Ready for AI Analysis
                          </span>
                        </div>
                        <p className="text-[12px] text-[#64748B] mt-0.5">
                          Size: {Math.round(selectedFile.size / 1024)} KB · Type: {selectedFile.type || 'Document'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-[4px] bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] text-[12px] font-semibold"
                      >
                        Change File
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="p-1.5 rounded-[4px] text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#FEE2E2] transition-colors"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Text Copy Paste */}
            {aiInputMode === 'paste' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="pasted-text-input" className="text-[12px] font-semibold text-[#334155]">
                    Paste official circular, advertisement text, or notification announcement:
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPastedText(SAMPLE_NOTIFICATION_TEXT);
                        setAnalysisError(null);
                        setAnalysisSuccess(null);
                      }}
                      className="text-[11px] font-bold text-[#1C4478] hover:underline flex items-center gap-1 bg-[#EFF4FB] px-2 py-0.5 rounded border border-[#C7D7EE]"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Insert Sample UPSC Notice</span>
                    </button>
                    {pastedText && (
                      <button
                        type="button"
                        onClick={() => setPastedText('')}
                        className="text-[11px] font-semibold text-[#94A3B8] hover:text-[#EF4444]"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  id="pasted-text-input"
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  rows={6}
                  placeholder="Paste the official recruitment bulletin, gazette extract, vacancy table, or exam notice here..."
                  className="gov-input w-full p-3 text-[13px] leading-relaxed resize-y font-mono bg-white"
                />

                <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                  <span>AI extracts advt number, posts, vacancies, age limit, fees, dates, and FAQs directly from text.</span>
                  <span>{pastedText.length.toLocaleString('en-IN')} characters</span>
                </div>
              </div>
            )}

            {/* Analysis Action Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#E2E8F0]">
              <div className="text-[12px] text-[#475569] flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#1C4478]" />
                <span>Powered by <strong>Backend AI Engine</strong> · Auto-fills all form fields & saves into draft status</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-[12px] text-[#475569] cursor-pointer select-none bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded transition-colors" title="Check this to force a fresh LLM call and bypass Redis cache">
                  <input
                    type="checkbox"
                    checked={forceAiRefresh}
                    onChange={(e) => setForceAiRefresh(e.target.checked)}
                    className="rounded text-[#12305A] focus:ring-0 cursor-pointer h-3.5 w-3.5"
                  />
                  <span>Bypass Cache (Force fresh LLM extraction)</span>
                </label>

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || (aiInputMode === 'upload' && !selectedFile) || (aiInputMode === 'paste' && pastedText.trim().length < 20)}
                  className="px-6 py-2.5 rounded-[4px] bg-gradient-to-r from-[#12305A] to-[#1C4478] hover:from-[#1C4478] hover:to-[#2A5E9E] disabled:opacity-50 text-white text-[13px] font-bold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>{analysisProgress || 'Analyzing Notification...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Analyze Document & Auto-Populate</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {analysisError && (
              <div className="p-3.5 rounded-[6px] bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-[12px] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">AI Analysis Failed:</p>
                  <p>{analysisError}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {analysisSuccess && (
              <div className="p-3.5 rounded-[6px] bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-[12px] flex items-start gap-2.5 shadow-xs">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-[#10B981] mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-[13px]">Notification Successfully Analyzed & Auto-Filled!</p>
                  <p>{analysisSuccess}</p>
                  <p className="text-[11px] text-[#047857] pt-1">
                    🔒 <strong>Draft Protection:</strong> Requisition is held safely in draft mode (Pending / Scrutiny). Nothing is visible to public applicants until you review and click &ldquo;Publish Gazette Notification&rdquo;.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Two-Column Main Workspace: Form (7 Cols) + Sticky Verification Desk (5 Cols) ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full min-w-0">
        {/* Left Column: Structured Requisition Form */}
        <section
          aria-label="Recruitment Notification Entry Form"
          className="lg:col-span-7 bg-white elevation-1 rounded-[6px] border border-[#E4E7EC] overflow-hidden w-full min-w-0"
        >
          {/* Header Banner */}
          <div className="px-6 py-4 bg-[#12305A] text-white flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-[4px] bg-[#1C4478] text-[#F5B544] shrink-0">
                <FilePlus2 className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-[15px] font-bold tracking-tight">
                  {isEditMode
                    ? `Update Requisition Details · ${initialJob?.id}`
                    : 'Statutory Gazette Requisition Entry'}
                </h2>
                <p className="text-[12px] text-[#d6e3ff]">
                  Fill all statutory recruitment parameters to publish the official gazette bulletin
                </p>
              </div>
            </div>
            {isEditMode && (
              <span className="px-2.5 py-0.5 rounded-[3px] bg-[#F5B544] text-[#12305A] text-[11px] font-bold uppercase tracking-wider">
                Edit Mode
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate className="p-6 space-y-7">
            {/* Validation Errors Box */}
            {Object.keys(errors).length > 0 && (
              <div
                role="alert"
                className="p-4 rounded-[6px] bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-[12px] leading-[18px] flex items-start gap-3"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="font-bold text-[13px]">
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

            {/* ── SECTION 1: Core Gazette & Organization Requisition ───── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E4E7EC]">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-[4px] bg-[#12305A] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <h3 className="text-[14px] font-bold text-[#12305A]">
                    Requisition & Departmental Gazette Details
                  </h3>
                </div>
                <span className="text-[11px] text-[#667085]">Mandatory Fields *</span>
              </div>

              {/* Row 1: Advt No (Col 1) & Commission / Corporation (Col 2) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="advt-no-input"
                    className="block text-[12px] font-medium text-[#172033] mb-1.5"
                  >
                    Advertisement Number <span className="text-[#DC2626]">*</span>
                    {renderAiBadge('advtNo')}
                  </label>
                  <input
                    id="advt-no-input"
                    type="text"
                    value={advtNo}
                    onChange={(e) => setAdvtNo(e.target.value)}
                    placeholder="e.g. Advt. No. 14/CSP-UPSC"
                    className="gov-input w-full px-3 text-[14px] tabular-data"
                  />
                  <p className="text-[11px] text-[#667085] mt-1">
                    Official gazette reference or requisition advertisement no.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor={isCustomDept ? 'department-custom-input' : 'department-select'}
                      className="block text-[12px] font-medium text-[#172033]"
                    >
                      Commission / Board / Corporation <span className="text-[#DC2626]">*</span>
                      {renderAiBadge('department')}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomDept((prev) => {
                          const next = !prev;
                          if (next && !department) {
                            setDepartment('N/A');
                          } else if (!next && department === 'N/A') {
                            setDepartment('');
                          }
                          return next;
                        });
                      }}
                      className="text-[11px] font-semibold text-[#1C4478] hover:text-[#12305A] hover:underline"
                    >
                      {isCustomDept ? '← Select Standard' : '+ Custom / Corp / PSU'}
                    </button>
                  </div>
                  {isCustomDept ? (
                    <div>
                      <input
                        id="department-custom-input"
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Food Corporation of India (FCI) or N/A"
                        className="gov-input w-full px-3 text-[14px]"
                        autoFocus
                      />
                      <p className="text-[11px] text-[#667085] mt-1">
                        Type custom Commission, Board, PSU name, or N/A if not available.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <select
                        id="department-select"
                        value={department}
                        onChange={(e) => {
                          if (e.target.value === '__CUSTOM__') {
                            setIsCustomDept(true);
                            setDepartment('N/A');
                          } else {
                            setDepartment(e.target.value);
                          }
                        }}
                        className="gov-select w-full px-3 text-[14px]"
                      >
                        <option value="">-- Select Commission / Corporation / Board --</option>
                        <option value="N/A">Not Specified in Circular / N/A</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                        <option value="__CUSTOM__">✏️ + Enter Custom Corporation / Board / Commission...</option>
                      </select>
                      <p className="text-[11px] text-[#667085] mt-1">
                        Select from {departments.length} standard bodies or enter custom.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 2: Official Post & Exam Title (Full Width) */}
              <div>
                <label
                  htmlFor="post-title-input"
                  className="block text-[12px] font-medium text-[#172033] mb-1.5"
                >
                  Official Post & Examination Title <span className="text-[#DC2626]">*</span>
                  {renderAiBadge('postTitle')}
                </label>
                <input
                  id="post-title-input"
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. Combined Graduate Level Examination 2026 / Assistant Section Officer"
                  className="gov-input w-full px-3 text-[14px]"
                />
              </div>

              {/* Row 3: Sanctioned Vacancies (1/3) & 7th CPC Pay Matrix (2/3) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4">
                  <label
                    htmlFor="vacancies-input"
                    className="block text-[12px] font-medium text-[#172033] mb-1.5"
                  >
                    Sanctioned Vacancies <span className="text-[#DC2626]">*</span>
                    {renderAiBadge('vacancies')}
                  </label>
                  <input
                    id="vacancies-input"
                    type="number"
                    min={1}
                    max={100000}
                    value={vacanciesStr}
                    onChange={(e) => setVacanciesStr(e.target.value)}
                    placeholder="e.g. 250"
                    className="gov-input w-full px-3 text-[14px] tabular-data"
                  />
                  <p className="text-[11px] text-[#667085] mt-1">
                    Total advertised vacancies across all designated posts.
                  </p>
                </div>

                <div className="md:col-span-8">
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor={isCustomPay ? 'pay-level-custom-input' : 'pay-level-select'}
                      className="block text-[12px] font-medium text-[#172033]"
                    >
                      7th CPC Pay Matrix Level / Salary Scale
                      {renderAiBadge('payLevel')}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomPay((prev) => {
                          const next = !prev;
                          if (next && !payLevel) {
                            setPayLevel('N/A');
                          } else if (!next && payLevel === 'N/A') {
                            setPayLevel('');
                          }
                          return next;
                        });
                      }}
                      className="text-[11px] font-semibold text-[#1C4478] hover:text-[#12305A] hover:underline"
                    >
                      {isCustomPay ? '← Standard 7th CPC' : '+ Custom Scale'}
                    </button>
                  </div>
                  {isCustomPay ? (
                    <div>
                      <input
                        id="pay-level-custom-input"
                        type="text"
                        value={payLevel}
                        onChange={(e) => setPayLevel(e.target.value)}
                        placeholder="e.g. Fixed ₹25,000/- Per Month, Level-7, or N/A"
                        className="gov-input w-full px-3 text-[14px]"
                        autoFocus
                      />
                      <p className="text-[11px] text-[#667085] mt-1">
                        Enter any monthly salary, honorarium, Grade Pay, or N/A if not available.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <select
                        id="pay-level-select"
                        value={payLevel}
                        onChange={(e) => {
                          if (e.target.value === '__CUSTOM__') {
                            setIsCustomPay(true);
                            setPayLevel('N/A');
                          } else {
                            setPayLevel(e.target.value);
                          }
                        }}
                        className="gov-select w-full px-3 text-[14px]"
                      >
                        <option value="">-- Select Pay Matrix Level / Salary Scale --</option>
                        <option value="N/A">Not Specified in Circular / N/A</option>
                        <optgroup label="7th Central Pay Commission (CPC) Levels">
                          {PAY_LEVELS.slice(0, 14).map((lvl) => (
                            <option key={lvl} value={lvl}>
                              {lvl}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Banking & Financial Sector">
                          {PAY_LEVELS.slice(14, 18).map((lvl) => (
                            <option key={lvl} value={lvl}>
                              {lvl}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="PSU / Corporation IDA Pay Scales">
                          {PAY_LEVELS.slice(18, 22).map((lvl) => (
                            <option key={lvl} value={lvl}>
                              {lvl}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Contractual / Monthly Honorarium">
                          {PAY_LEVELS.slice(22).map((lvl) => (
                            <option key={lvl} value={lvl}>
                              {lvl}
                            </option>
                          ))}
                        </optgroup>
                        <option value="__CUSTOM__">✏️ + Enter Custom Pay Scale / Salary...</option>
                      </select>
                      <p className="text-[11px] text-[#667085] mt-1">
                        Select from 7th CPC Matrix (Level 1-14) or Banking/PSU IDA scales.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 4: Statutory Category Seat Matrix (UR, OBC, SC, ST, EWS) */}
              <div className="p-3.5 rounded-[6px] bg-[#F8FAFC] border border-[#E4E7EC] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-[12px] font-bold text-[#12305A] flex items-center gap-1.5">
                      Statutory Seat Matrix (Roster)
                      {renderAiBadge('categoryBreakdown')}
                    </label>
                    <span className="text-[11px] text-[#667085]">
                      (Optional · Populated strictly from notice if declared)
                    </span>
                  </div>
                  {hasCategoryBreakdown && (
                    <span className="text-[11px] font-bold text-[#18864B] bg-[#ECFDF3] border border-[#D1FADF] px-2 py-0.5 rounded-[4px] tabular-data">
                      Allocated: {totalCategorySum} {numericVacancies > 0 ? `/ ${numericVacancies}` : 'Posts'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {[
                    { label: 'UR', sub: 'Unreserved', val: catUR, set: setCatUR },
                    { label: 'OBC', sub: 'OBC', val: catOBC, set: setCatOBC },
                    { label: 'SC', sub: 'SC', val: catSC, set: setCatSC },
                    { label: 'ST', sub: 'ST', val: catST, set: setCatST },
                    { label: 'EWS', sub: 'EWS', val: catEWS, set: setCatEWS },
                  ].map(({ label, sub, val, set }) => (
                    <div key={label} className="bg-white border border-[#CBD5E1] rounded-[4px] p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-[#12305A]">{label}</span>
                        <span className="text-[9px] text-[#667085] hidden sm:inline">{sub}</span>
                      </div>
                      <input
                        type="number"
                        min={0}
                        value={val}
                        onChange={(e) => set(e.target.value)}
                        placeholder="0"
                        className="gov-input w-full px-2 py-1 text-[13px] text-center font-bold text-[#172033] tabular-data"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-[#667085]">
                  Values are extracted directly from official notice text/PDF if explicitly declared, or entered manually by the administrator. No mathematical percentage calculations are applied.
                </p>
              </div>
            </div>

            {/* ── SECTION 2: Recruitment Lifecycle Dates & Portal Status ── */}
            <div className="pt-5 border-t border-[#E4E7EC] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E4E7EC]">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-[4px] bg-[#12305A] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <h3 className="text-[14px] font-bold text-[#12305A]">
                    Recruitment Lifecycle Dates & Portal Status
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#667085]">Live Status:</span>
                  <StatusBadge status={status} size="sm" />
                </div>
              </div>

              {/* Status Selector with live indicator */}
              <div className="p-3.5 rounded-[6px] bg-[#F8FAFC] border border-[#E4E7EC] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="initial-status-select"
                    className="block text-[12px] font-bold text-[#12305A]"
                  >
                    Public Recruitment Channel Status <span className="text-[#DC2626]">*</span>
                  </label>
                  <span className="text-[11px] text-[#667085]">
                    Affects citizen portal routing
                  </span>
                </div>
                <select
                  id="initial-status-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PipelineStatus)}
                  className="gov-select w-full px-3 text-[14px] bg-white font-medium"
                >
                  {PIPELINE_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2 text-[11px] text-[#475467] pt-0.5">
                  <span className="font-semibold text-[#12305A]">Citizen View:</span>
                  <span>
                    {PIPELINE_STATUS_OPTIONS.find((o) => o.value === status)?.description ||
                      'Determines where notification appears on public portal'}
                  </span>
                </div>
              </div>

              {/* 3 Dates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="start-date-input"
                    className="block text-[12px] font-medium text-[#172033] mb-1.5"
                  >
                    Application Begin Date
                    {renderAiBadge('startDate')}
                  </label>
                  <input
                    id="start-date-input"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="gov-input w-full px-3 text-[14px] tabular-data"
                  />
                  <span className="block text-[11px] text-[#667085] mt-1">
                    Official Gazette release / opening date
                  </span>
                </div>

                <div>
                  <label
                    htmlFor="deadline-date-input"
                    className="block text-[12px] font-medium text-[#172033] mb-1.5"
                  >
                    Registration Closing Deadline <span className="text-[#DC2626]">*</span>
                    {renderAiBadge('deadlineDate')}
                  </label>
                  <input
                    id="deadline-date-input"
                    type="date"
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="gov-input w-full px-3 text-[14px] tabular-data"
                  />
                  <span className="block text-[11px] text-[#667085] mt-1">
                    Last date for registration & fee payment
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="exam-date-input"
                      className="block text-[12px] font-medium text-[#172033]"
                    >
                      Scheduled Exam Date
                      {renderAiBadge('examDate')}
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
                      <span>To be Announced</span>
                    </label>
                  </div>
                  {isExamDateTBD ? (
                    <div className="h-[38px] px-3 rounded-[4px] bg-[#EFF4FB] border border-[#C7D7EE] flex items-center text-[12px] font-semibold text-[#12305A]">
                      📢 Will be announced soon (As per schedule)
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
                      ? 'Displays "As per schedule / To be announced soon"'
                      : 'Target CBT or written examination date'}
                  </span>
                </div>
              </div>
            </div>

            {/* ── SECTION 3: Statutory Application Fee Structure ──────── */}
            <div className="pt-5 border-t border-[#E4E7EC] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E4E7EC]">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-[4px] bg-[#12305A] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <h3 className="text-[14px] font-bold text-[#12305A]">
                    Statutory Application Fee Structure
                  </h3>
                </div>
                <span className="text-[11px] text-[#667085]">Amounts in ₹ (INR) · 0 = Exempted</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-[6px] bg-[#F8FAFC] border border-[#E4E7EC]">
                  <label
                    htmlFor="fee-gen-input"
                    className="block text-[11px] font-bold text-[#172033] mb-1.5"
                  >
                    General / EWS
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-[13px] font-semibold text-[#667085] pointer-events-none">
                      ₹
                    </span>
                    <input
                      id="fee-gen-input"
                      type="number"
                      min={0}
                      value={feeGeneral}
                      onChange={(e) => setFeeGeneral(e.target.value)}
                      className="gov-input w-full pl-6 pr-2 text-[13px] tabular-data font-semibold"
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-[6px] bg-[#F8FAFC] border border-[#E4E7EC]">
                  <label
                    htmlFor="fee-obc-input"
                    className="block text-[11px] font-bold text-[#172033] mb-1.5"
                  >
                    OBC Candidates
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-[13px] font-semibold text-[#667085] pointer-events-none">
                      ₹
                    </span>
                    <input
                      id="fee-obc-input"
                      type="number"
                      min={0}
                      value={feeObc}
                      onChange={(e) => setFeeObc(e.target.value)}
                      className="gov-input w-full pl-6 pr-2 text-[13px] tabular-data font-semibold"
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-[6px] bg-[#F8FAFC] border border-[#E4E7EC]">
                  <label
                    htmlFor="fee-sc-input"
                    className="block text-[11px] font-bold text-[#172033] mb-1.5"
                  >
                    SC / ST / PwD
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-[13px] font-semibold text-[#667085] pointer-events-none">
                      ₹
                    </span>
                    <input
                      id="fee-sc-input"
                      type="number"
                      min={0}
                      value={feeScSt}
                      onChange={(e) => setFeeScSt(e.target.value)}
                      className="gov-input w-full pl-6 pr-2 text-[13px] tabular-data font-semibold text-[#18864B]"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-[6px] bg-[#F8FAFC] border border-[#E4E7EC]">
                  <label
                    htmlFor="fee-female-input"
                    className="block text-[11px] font-bold text-[#172033] mb-1.5"
                  >
                    Female Candidates
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-[13px] font-semibold text-[#667085] pointer-events-none">
                      ₹
                    </span>
                    <input
                      id="fee-female-input"
                      type="number"
                      min={0}
                      value={feeFemale}
                      onChange={(e) => setFeeFemale(e.target.value)}
                      className="gov-input w-full pl-6 pr-2 text-[13px] tabular-data font-semibold text-[#18864B]"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="payment-mode-input"
                  className="block text-[12px] font-medium text-[#172033] mb-1.5"
                >
                  Payment Mode & Gateway Details
                </label>
                <input
                  id="payment-mode-input"
                  type="text"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="gov-input w-full px-3 text-[13px]"
                  placeholder="Online via Net Banking, Debit / Credit Card, or UPI"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[11px] text-[#667085] self-center mr-1">Quick presets:</span>
                  {[
                    'Online via Net Banking, Debit / Credit Card, or UPI',
                    'Online or SBI e-Challan / Bank Branch',
                    'Exempted (₹0 Fee for All Categories)',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPaymentMode(preset)}
                      className="px-2 py-0.5 rounded-[3px] bg-[#F4F6FA] hover:bg-[#E4E7EC] border border-[#E4E7EC] text-[11px] text-[#12305A] transition-colors"
                    >
                      {preset.split('(')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── SECTION 4: Eligibility Criteria & Age Limit ─────────── */}
            <div className="pt-5 border-t border-[#E4E7EC] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E4E7EC]">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-[4px] bg-[#12305A] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    4
                  </span>
                  <h3 className="text-[14px] font-bold text-[#12305A]">
                    Eligibility Criteria & Age Limit Specifications
                  </h3>
                </div>
                <span className="text-[11px] text-[#667085]">Statutory Qualifications</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="qual-summary-input"
                      className="block text-[12px] font-medium text-[#172033]"
                    >
                      Educational Qualification Summary
                      {renderAiBadge('qualificationSummary')}
                    </label>
                  </div>
                  <textarea
                    id="qual-summary-input"
                    rows={3}
                    value={qualificationSummary}
                    onChange={(e) => setQualificationSummary(e.target.value)}
                    className="gov-input w-full px-3 py-2 text-[13px] leading-relaxed resize-y"
                    placeholder="e.g. Graduate in required discipline from recognized university / board"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Bachelor Degree in Any Stream from Recognized University',
                      '10+2 (Intermediate) with 50% Marks and Computer Certificate',
                      '10th (Matriculation) Pass from Recognized Board',
                      'B.Tech / B.E. Degree in relevant Engineering branch',
                    ].map((sample) => (
                      <button
                        key={sample}
                        type="button"
                        onClick={() => setQualificationSummary(sample)}
                        className="px-2 py-0.5 rounded-[3px] bg-[#F4F6FA] hover:bg-[#E4E7EC] border border-[#E4E7EC] text-[10px] text-[#12305A] transition-colors"
                      >
                        + {sample.slice(0, 26)}...
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="age-summary-input"
                      className="block text-[12px] font-medium text-[#172033]"
                    >
                      Age Criteria & Relaxation Specifications
                      {renderAiBadge('ageLimitSummary')}
                    </label>
                  </div>
                  <textarea
                    id="age-summary-input"
                    rows={3}
                    value={ageLimitSummary}
                    onChange={(e) => setAgeLimitSummary(e.target.value)}
                    className="gov-input w-full px-3 py-2 text-[13px] leading-relaxed resize-y"
                    placeholder="e.g. 18 to 32 Years (Relaxations: OBC 3 yrs, SC/ST 5 yrs, PwD 10 yrs)"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      '18 to 30 Years (OBC 3 yrs, SC/ST 5 yrs, PwD 10 yrs)',
                      '18 to 27 Years (Relaxations as per Central Govt Rules)',
                      '21 to 32 Years as on 01 August 2026 (Age relaxation applicable)',
                      '18 to 25 Years (Relaxation as per Police Recruitment Rules)',
                    ].map((sample) => (
                      <button
                        key={sample}
                        type="button"
                        onClick={() => setAgeLimitSummary(sample)}
                        className="px-2 py-0.5 rounded-[3px] bg-[#F4F6FA] hover:bg-[#E4E7EC] border border-[#E4E7EC] text-[10px] text-[#12305A] transition-colors"
                      >
                        + {sample.slice(0, 24)}...
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── SECTION 5: Post / Cadre Vacancy & Qualification Breakdown ─ */}
            <div className="pt-5 border-t border-[#E4E7EC] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E4E7EC]">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-[4px] bg-[#12305A] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    5
                  </span>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#12305A]">
                      Post / Cadre Vacancy & Qualification Breakdown
                    </h3>
                    <p className="text-[11px] text-[#667085]">
                      Configure distinct post designations, specific requirements, and post-wise seat matrix
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddPost}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#EFF4FB] hover:bg-[#DCE7F6] text-[#12305A] text-[12px] font-bold border border-[#C7D7EE] transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Add Cadre / Post</span>
                </button>
              </div>

              <div className="space-y-3">
                {posts.map((post, idx) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-[6px] border border-[#E4E7EC] bg-[#FAFAFC] space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-[3px] bg-[#12305A] text-white text-[10px] font-bold tracking-wider uppercase">
                          Cadre #{idx + 1}
                        </span>
                        <span className="text-[13px] font-bold text-[#172033]">
                          {post.postName.trim() || 'Untitled Cadre Post'}
                        </span>
                      </div>
                      {posts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePost(post.id)}
                          className="text-[#DC2626] hover:text-[#991B1B] text-[11px] font-semibold inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <div className="md:col-span-8">
                        <label className="block text-[11px] font-semibold text-[#172033] mb-1">
                          Post Designation / Title <span className="text-[#DC2626]">*</span>
                        </label>
                        <input
                          type="text"
                          value={post.postName}
                          onChange={(e) => handlePostChange(post.id, 'postName', e.target.value)}
                          placeholder="e.g. Assistant Section Officer (CSS) / Inspector of Income Tax"
                          className="gov-input w-full px-3 text-[13px]"
                        />
                      </div>
                      <div className="md:col-span-4">
                        <label className="block text-[11px] font-semibold text-[#172033] mb-1">
                          Cadre Vacancies <span className="text-[#DC2626]">*</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={post.vacancies}
                          onChange={(e) => handlePostChange(post.id, 'vacancies', e.target.value)}
                          placeholder="e.g. 120"
                          className="gov-input w-full px-3 text-[13px] tabular-data"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#172033] mb-1">
                        Specific Qualification & Criteria for this Cadre
                      </label>
                      <input
                        type="text"
                        value={post.qualification}
                        onChange={(e) => handlePostChange(post.id, 'qualification', e.target.value)}
                        placeholder="e.g. Bachelor Degree in any discipline with Mathematics/Statistics at 10+2 level"
                        className="gov-input w-full px-3 text-[13px]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── SECTION 6: Scheme of Examination & Selection Stages ─── */}
            <div className="pt-5 border-t border-[#E4E7EC] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E4E7EC]">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-[4px] bg-[#12305A] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    6
                  </span>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#12305A]">
                      Selection Process & Examination Scheme
                    </h3>
                    <p className="text-[11px] text-[#667085]">
                      Sequential recruitment stages (Screening CBT, Mains, Physical, Interview, Document Verification)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddStage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#EFF4FB] hover:bg-[#DCE7F6] text-[#12305A] text-[12px] font-bold border border-[#C7D7EE] transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Add Stage</span>
                </button>
              </div>

              <div className="space-y-2">
                {selectionStages.map((stage, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#12305A] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={stage}
                      onChange={(e) => handleStageChange(idx, e.target.value)}
                      className="gov-input w-full px-3 text-[13px]"
                      placeholder={`e.g. Stage ${idx + 1}: Computer Based Examination / Technical Evaluation`}
                    />
                    {selectionStages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStage(idx)}
                        className="text-[#DC2626] hover:text-[#991B1B] p-2 rounded hover:bg-rose-50 transition-colors shrink-0"
                        title="Remove Stage"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-[#667085] self-center mr-1">Quick add stage:</span>
                {[
                  'Tier-1 Computer Based Screening Test (Objective)',
                  'Tier-2 Main Written Examination / Descriptive',
                  'Physical Efficiency Test (PET) & Physical Standard Test (PST)',
                  'Skill / Typing / Trade Practical Test',
                  'Personality Test / Personal Interview Board',
                  'Document Verification & Final Medical Examination',
                ].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setSelectionStages((prev) => [...prev, sample])}
                    className="px-2 py-0.5 rounded-[3px] bg-[#F4F6FA] hover:bg-[#E4E7EC] border border-[#E4E7EC] text-[10px] text-[#12305A] transition-colors"
                  >
                    + {sample.split('(')[0].trim().slice(0, 22)}...
                  </button>
                ))}
              </div>
            </div>

            {/* ── SECTION 7: Official Commission Direct Links & Portal URLs ─ */}
            <div className="pt-5 border-t border-[#E4E7EC] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E4E7EC]">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-[4px] bg-[#12305A] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    7
                  </span>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#12305A]">
                      Official Commission Direct Links & Portal URLs
                    </h3>
                    <p className="text-[11px] text-[#667085]">
                      Citizens on BharatRojgar are directed strictly to these verified government URLs
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-[#18864B] font-semibold">Verified Safe Destinations</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-[6px] bg-[#F8FAFC] border border-[#E4E7EC] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#12305A] uppercase tracking-wider">
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Apply Online Portal</span>
                  </div>
                  <input
                    id="apply-online-url-input"
                    type="url"
                    value={applyOnlineUrl}
                    onChange={(e) => setApplyOnlineUrl(e.target.value)}
                    className="gov-input w-full px-2.5 text-[12px]"
                    placeholder="https://upsconline.nic.in"
                  />
                  <span className="block text-[10px] text-[#667085]">
                    Registration & login URL
                  </span>
                </div>

                <div className="p-3.5 rounded-[6px] bg-[#F8FAFC] border border-[#E4E7EC] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#12305A] uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Official Notice PDF</span>
                  </div>
                  <input
                    id="notice-pdf-url-input"
                    type="url"
                    value={officialNoticePdfUrl}
                    onChange={(e) => setOfficialNoticePdfUrl(e.target.value)}
                    className="gov-input w-full px-2.5 text-[12px]"
                    placeholder="https://upsc.gov.in/notice.pdf"
                  />
                  <span className="block text-[10px] text-[#667085]">
                    Gazette notice / PDF bulletin
                  </span>
                </div>

                <div className="p-3.5 rounded-[6px] bg-[#F8FAFC] border border-[#E4E7EC] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#12305A] uppercase tracking-wider">
                    <Landmark className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Commission Website</span>
                  </div>
                  <input
                    id="commission-website-url-input"
                    type="url"
                    value={officialWebsiteUrl}
                    onChange={(e) => setOfficialWebsiteUrl(e.target.value)}
                    className="gov-input w-full px-2.5 text-[12px]"
                    placeholder="https://upsc.gov.in"
                  />
                  <span className="block text-[10px] text-[#667085]">
                    Commission homepage
                  </span>
                </div>
              </div>

              {/* Row 2: Action Lifecycle Destinations (Admit Card, Answer Key, Syllabus) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 rounded-[6px] bg-[#F8FAFC] border border-[#E4E7EC] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#12305A] uppercase tracking-wider">
                    <Ticket className="w-3.5 h-3.5 text-[#0E7490]" aria-hidden="true" />
                    <span>Admit Card / Hall Ticket URL</span>
                  </div>
                  <input
                    id="admit-card-url-input"
                    type="url"
                    value={admitCardUrl}
                    onChange={(e) => setAdmitCardUrl(e.target.value)}
                    className="gov-input w-full px-2.5 text-[12px]"
                    placeholder="https://upsc.gov.in/e-admit-card"
                  />
                  <span className="block text-[10px] text-[#667085]">
                    Direct Hall Ticket download portal
                  </span>
                </div>

                <div className="p-3.5 rounded-[6px] bg-[#F8FAFC] border border-[#E4E7EC] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#12305A] uppercase tracking-wider">
                    <KeyRound className="w-3.5 h-3.5 text-[#D97706]" aria-hidden="true" />
                    <span>Answer Key & Objections URL</span>
                  </div>
                  <input
                    id="answer-key-url-input"
                    type="url"
                    value={answerKeyUrl}
                    onChange={(e) => setAnswerKeyUrl(e.target.value)}
                    className="gov-input w-full px-2.5 text-[12px]"
                    placeholder="https://upsc.gov.in/answer-keys"
                  />
                  <span className="block text-[10px] text-[#667085]">
                    Official answer key & objection link
                  </span>
                </div>

                <div className="p-3.5 rounded-[6px] bg-[#F8FAFC] border border-[#E4E7EC] space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#12305A] uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5 text-[#6366F1]" aria-hidden="true" />
                    <span>Syllabus & Pattern PDF URL</span>
                  </div>
                  <input
                    id="syllabus-url-input"
                    type="url"
                    value={syllabusUrl}
                    onChange={(e) => setSyllabusUrl(e.target.value)}
                    className="gov-input w-full px-2.5 text-[12px]"
                    placeholder="https://upsc.gov.in/syllabus.pdf"
                  />
                  <span className="block text-[10px] text-[#667085]">
                    Scheme of examination & syllabus
                  </span>
                </div>
              </div>
            </div>

            {/* ── SECTION 8: Official Job Description & Candidate Overview ─ */}
            <div className="pt-5 border-t border-[#E4E7EC] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E4E7EC]">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-[4px] bg-[#12305A] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    8
                  </span>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#12305A]">
                      Official Job Description & Candidate Overview
                    </h3>
                    <p className="text-[11px] text-[#667085]">
                      Provides comprehensive context for applicants on the public portal notification page
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleInsertDescriptionTemplate}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-[#F4F6FA] hover:bg-[#E4E7EC] border border-[#E4E7EC] text-[11px] font-semibold text-[#12305A] transition-colors shrink-0"
                >
                  <Sparkles className="w-3 h-3 text-[#D97706]" aria-hidden="true" />
                  <span>Insert Gazette Template</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <textarea
                  id="job-description-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="gov-input w-full p-3 text-[13px] leading-relaxed resize-y font-normal"
                  placeholder="Enter detailed official recruitment overview, cadre responsibilities, and instructions for applicants..."
                />
                <div className="flex justify-between items-center text-[11px] text-[#667085] pt-0.5">
                  <span>Rendered prominently in the BharatRojgar notification detail page</span>
                  <span className="font-semibold tabular-data text-[#12305A]">
                    {description.length} characters
                  </span>
                </div>
              </div>
            </div>

            {/* ── SECTION 9: Candidate Frequently Asked Questions (FAQs) ─ */}
            <div className="pt-5 border-t border-[#E4E7EC] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E4E7EC]">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-[4px] bg-[#12305A] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    9
                  </span>
                  <div>
                    <h3 className="text-[14px] font-bold text-[#12305A]">
                      Frequently Asked Questions (Candidate FAQs)
                    </h3>
                    <p className="text-[11px] text-[#667085]">
                      Rendered as interactive accordion on BharatRojgar for applicant clarification
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#EFF4FB] hover:bg-[#DCE7F6] text-[#12305A] text-[12px] font-bold border border-[#C7D7EE] transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Add FAQ</span>
                </button>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div
                    key={faq.id}
                    className="p-3.5 rounded-[6px] border border-[#E4E7EC] bg-[#FAFAFC] space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-6 h-6 rounded-full bg-[#12305A] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                          Q{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => handleFaqChange(faq.id, 'question', e.target.value)}
                          className="gov-input w-full px-3 text-[13px] font-semibold"
                          placeholder={`Question #${idx + 1} (e.g. Can final year students apply provisionally?)`}
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
                    <div className="flex items-start gap-2 pl-8">
                      <span className="w-6 h-6 rounded-full bg-[#18864B] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        A
                      </span>
                      <textarea
                        value={faq.answer}
                        onChange={(e) => handleFaqChange(faq.id, 'answer', e.target.value)}
                        rows={2}
                        className="gov-input w-full p-2.5 text-[12px] leading-relaxed resize-y"
                        placeholder="Official departmental answer for candidates..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Bottom Form Action Bar ───────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-[#E4E7EC]">
              <div className="text-[12px] text-[#667085] tabular-data flex flex-wrap items-center gap-2">
                <span>Ref: <strong className="text-[#12305A]">{isEditMode ? initialJob?.gazetteRef : previewGazetteRef}</strong></span>
                <span>·</span>
                <span>Posts: <strong className="text-[#12305A]">{numericVacancies.toLocaleString('en-IN')}</strong></span>
                <span>·</span>
                <span>Status: <strong className={status === 'Pending / Scrutiny' ? 'text-[#D97706]' : 'text-[#18864B]'}>{status}</strong></span>
                {draftSavedAt && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#027A48] bg-[#ECFDF3] px-2 py-0.5 rounded border border-[#ABEFC6]">
                    <CheckCheck className="w-3 h-3 text-[#12B76A]" />
                    <span>Auto-Saved {draftSavedAt}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleDiscardDraft}
                  className="px-3 py-2 rounded-[4px] bg-white border border-[#D0D5DD] text-[#475569] text-[13px] font-semibold hover:bg-[#F8FAFC] transition-colors flex items-center gap-1.5"
                  title="Discard unsaved changes and reset form"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>Discard & Reset</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAsDraft}
                  className="px-4 py-2.5 rounded-[4px] bg-[#F4F6FA] hover:bg-[#E4E7EC] active:bg-[#DCE3EE] text-[#12305A] border border-[#CBD5E1] text-[13px] font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                  title="Save requisition in Internal Draft mode (will not be published to live citizen portal)"
                >
                  <Save className="w-4 h-4 text-[#1C4478]" />
                  <span>Save as Draft (Internal)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="px-6 py-2.5 rounded-[4px] bg-[#12305A] hover:bg-[#1C4478] active:bg-[#0D2240] text-white text-[13px] font-bold transition-colors shadow-xs flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isEditMode ? 'Save & Update Notification' : 'Publish Gazette Notification'}</span>
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* ── Right Column: Sticky Verification Desk & e-Gazette Live Card ─ */}
        <aside
          aria-label="Live Gazette Notification Preview & Verification Desk"
          className="lg:col-span-5 lg:sticky lg:top-6 space-y-5 max-h-[calc(100vh-3rem)] overflow-y-auto pr-1"
        >
          {/* Card A: Live e-Gazette Notice Preview */}
          <div className="bg-white elevation-1 rounded-[6px] border border-[#E4E7EC] overflow-hidden">
            {/* Preview Card Header */}
            <div className="px-5 py-3.5 border-b border-[#E4E7EC] bg-[#12305A] text-white flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-[#F5B544]" aria-hidden="true" />
                <span className="text-[12px] font-bold uppercase tracking-wider text-white">
                  Live e-Gazette Bulletin Preview
                </span>
              </div>
              <StatusBadge status={status} size="sm" />
            </div>

            <div className="p-5 space-y-4">
              {/* Gazette Requisition Header */}
              <div className="pb-3 border-b border-[#E4E7EC] space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#667085] tabular-data">
                  <span className="font-bold text-[#12305A]">{advtNo.trim() || 'ADVT. NO. PENDING ENTRY'}</span>
                  <span className="bg-[#EFF4FB] px-2 py-0.5 rounded text-[#12305A]">{isEditMode ? initialJob?.gazetteRef : previewGazetteRef}</span>
                </div>
                <h3 className="text-[16px] leading-[22px] font-bold text-[#172033]">
                  {postTitle.trim() || 'Official Post & Examination Title Preview'}
                </h3>
                <p className="text-[13px] font-semibold text-[#1C4478]">
                  {department || 'Commission / Corporation Pending Selection'}
                </p>
                <div className="text-[12px] text-[#667085] tabular-data flex items-center gap-1.5 pt-0.5">
                  <span className="font-semibold text-[#12305A]">Pay Scale:</span>
                  <span>{payLevel || 'As per 7th CPC Matrix'}</span>
                </div>
              </div>

              {/* Statutory Reservation Seat Matrix (Roster) */}
              <div className="p-3.5 rounded-[6px] bg-[#F8FAFC] border border-[#E4E7EC] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#667085]">
                    Statutory Seat Matrix (Roster)
                  </span>
                  <span className="text-[12px] font-bold text-[#12305A] tabular-data">
                    Total: {numericVacancies.toLocaleString('en-IN')} Posts
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {[
                    ['UR', breakdown.UR],
                    ['OBC', breakdown.OBC],
                    ['SC', breakdown.SC],
                    ['ST', breakdown.ST],
                    ['EWS', breakdown.EWS],
                  ].map(([label, count]) => (
                    <div
                      key={label}
                      className="bg-white border border-[#E4E7EC] rounded-[4px] py-1.5 px-1 shadow-2xs"
                    >
                      <div className="text-[10px] text-[#667085] font-semibold whitespace-nowrap">
                        {label}
                      </div>
                      <div className="text-[14px] font-bold text-[#172033] tabular-data mt-0.5">
                        {hasCategoryBreakdown ? count : '—'}
                      </div>
                    </div>
                  ))}
                </div>

                {!hasCategoryBreakdown ? (
                  <p className="text-[10px] text-[#667085] italic text-center pt-0.5">
                    Category roster not specified in notification (Unallocated)
                  </p>
                ) : totalCategorySum !== numericVacancies && numericVacancies > 0 ? (
                  <p className="text-[10px] text-[#B54708] font-medium text-center pt-0.5">
                    Category sum ({totalCategorySum}) differs from total vacancies ({numericVacancies})
                  </p>
                ) : null}
              </div>

              {/* Application Fees Summary Card */}
              <div className="p-3.5 rounded-[6px] bg-[#F8FAFC] border border-[#E4E7EC] space-y-1.5 text-[12px]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#12305A] flex items-center justify-between">
                  <span>Application Fees</span>
                  <span className="text-[10px] text-[#667085] font-normal">Official Rates</span>
                </div>
                <div className="flex justify-between text-[#172033] pt-1">
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

              {/* Eligibility & Cadre Summary */}
              <div className="p-3.5 rounded-[6px] bg-[#F8FAFC] border border-[#E4E7EC] space-y-1.5 text-[12px]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#12305A]">
                  Eligibility & Age Norms
                </div>
                <p className="text-[12px] text-[#172033] line-clamp-2 leading-relaxed">
                  {qualificationSummary || 'General qualification criteria pending entry'}
                </p>
                <div className="text-[11px] text-[#667085] pt-1 border-t border-[#E4E7EC]">
                  <strong className="text-[#12305A]">Age Limit: </strong>
                  {ageLimitSummary || 'Per notification norms'}
                </div>
                {posts.filter((p) => p.postName.trim()).length > 0 && (
                  <div className="pt-1 text-[11px] text-[#12305A] font-semibold">
                    {posts.filter((p) => p.postName.trim()).length} specific cadre breakdown(s) defined
                  </div>
                )}
              </div>

              {/* Selection Stages Preview */}
              <div className="p-3.5 rounded-[6px] bg-[#F8FAFC] border border-[#E4E7EC] space-y-2 text-[12px]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#12305A] flex items-center justify-between">
                  <span>Selection Scheme</span>
                  <span className="text-[10px] text-[#667085] font-normal">
                    {selectionStages.filter((s) => s.trim().length > 0).length} Stages
                  </span>
                </div>
                <ul className="space-y-1.5 text-[12px] text-[#172033]">
                  {selectionStages
                    .filter((s) => s.trim().length > 0)
                    .slice(0, 3)
                    .map((st, i) => (
                      <li key={i} className="line-clamp-1 flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#12305A] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span>{st}</span>
                      </li>
                    ))}
                  {selectionStages.filter((s) => s.trim().length > 0).length > 3 && (
                    <li className="text-[11px] text-[#667085] italic pl-6">
                      + {selectionStages.filter((s) => s.trim().length > 0).length - 3} more stages
                    </li>
                  )}
                </ul>
              </div>

              {/* Direct Official Action Links Preview */}
              <div className="p-3.5 rounded-[6px] bg-[#F8FAFC] border border-[#E4E7EC] space-y-2 text-[12px]">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#12305A]">
                  Candidate Action Destinations
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <a
                    href={applyOnlineUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#12305A] text-white py-1.5 px-2 rounded-[4px] text-center font-semibold truncate hover:bg-[#1C4478] transition-colors"
                  >
                    Apply Online ↗
                  </a>
                  <a
                    href={officialNoticePdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white border border-[#E4E7EC] text-[#12305A] py-1.5 px-2 rounded-[4px] text-center font-semibold truncate hover:bg-[#F4F6FA] transition-colors"
                  >
                    Notice PDF ↗
                  </a>
                </div>
              </div>

              {/* Key Timeline Dates */}
              <div className="space-y-2 text-[12px] tabular-data pt-2">
                <div className="flex items-center justify-between py-1.5 border-b border-[#E4E7EC]">
                  <span className="text-[#667085] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#12305A]" aria-hidden="true" />
                    <span>Application Begin Date</span>
                  </span>
                  <span className="font-semibold text-[#172033]">
                    {startDate || 'Gazette Release Date'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#E4E7EC]">
                  <span className="text-[#667085] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#DC2626]" aria-hidden="true" />
                    <span>Application Deadline</span>
                  </span>
                  <span className="font-semibold text-[#172033]">
                    {deadlineDate || 'Not Configured'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#E4E7EC]">
                  <span className="text-[#667085] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#18864B]" aria-hidden="true" />
                    <span>Scheduled Exam Date</span>
                  </span>
                  {isExamDateTBD || !examDate ? (
                    <span className="font-semibold text-[#12305A] bg-[#EFF4FB] px-2 py-0.5 rounded text-[11px]">
                      Will be announced soon
                    </span>
                  ) : (
                    <span className="font-semibold text-[#172033]">
                      {examDate}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between py-1 text-[11px]">
                  <span className="text-[#667085] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#12305A]" aria-hidden="true" />
                    <span>Horizontal Reservation</span>
                  </span>
                  <span className="font-semibold text-[#12305A]">4% Statutory PwBD Quota</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card B: Pre-Publication Verification Checklist & Fast Actions */}
          <div className="bg-white elevation-1 rounded-[6px] border border-[#E4E7EC] overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4E7EC]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#18864B]" aria-hidden="true" />
                <h4 className="text-[13px] font-bold text-[#12305A] uppercase tracking-wider">
                  Verification Checklist
                </h4>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#EFF4FB] text-[#12305A] tabular-data">
                {passedChecksCount} of {checklist.length} Verified
              </span>
            </div>

            {/* Checklist items */}
            <div className="space-y-2 text-[12px]">
              {checklist.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-[#F4F6FA]">
                  <span className="text-[#475467]">{item.label}</span>
                  {item.passed ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#18864B]">
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Ready</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#D97706]">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Pending</span>
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Instant Action Button from Sticky Sidebar */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="w-full py-2.5 px-4 rounded-[4px] bg-[#12305A] hover:bg-[#1C4478] active:bg-[#0D2240] text-white text-[13px] font-bold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{isEditMode ? 'Save & Update Notification' : 'Publish Gazette Notification'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAsDraft}
                className="w-full py-2 px-4 rounded-[4px] bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#12305A] text-[12px] font-bold transition-colors flex items-center justify-center gap-2 border border-[#CBD5E1] cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-[#1C4478]" aria-hidden="true" />
                <span>Save as Draft (Internal Scrutiny)</span>
              </button>

              <a
                href="http://localhost:5173"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-3 rounded-[4px] bg-[#F4F6FA] hover:bg-[#E4E7EC] text-[#12305A] text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5 border border-[#E4E7EC]"
              >
                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Preview BharatRojgar Citizen Portal ↗</span>
              </a>

              {draftSavedAt && (
                <div className="text-center pt-1">
                  <span className="text-[11px] text-[#027A48] font-medium flex items-center justify-center gap-1">
                    <CheckCheck className="w-3 h-3 text-[#12B76A]" />
                    <span>Auto-saved locally at {draftSavedAt}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
