export type PipelineStatus =
  | 'Application Open / Active'
  | 'Admit Card / Active'
  | 'Answer Key Out'
  | 'Result Announced'
  | 'Pending / Scrutiny'
  | 'Rejected / Cancelled';

export type ReservationCategory = 'UR' | 'OBC' | 'SC' | 'ST' | 'EWS';

export interface CategoryBreakdown {
  UR: number;
  OBC: number;
  SC: number;
  ST: number;
  EWS: number;
}

export interface ApplicationFeesInput {
  general: number;
  obc: number;
  scSt: number;
  female: number;
  paymentMode: string;
}

export interface PostBreakdownInput {
  postName: string;
  vacancies: number;
  qualification: string;
}

export interface FaqItemInput {
  question: string;
  answer: string;
}

export interface RecruitmentNotification {
  id: string;
  advtNo: string;
  postTitle: string;
  department: string;
  ministryCode: string;
  payLevel: string;
  vacancies: number;
  categoryBreakdown: CategoryBreakdown;
  applicationsReceived: number;
  scrutinyPending: number;
  startDate?: string;
  deadlineDate: string;
  examDate?: string;
  status: PipelineStatus;
  cutoffMarks: CategoryBreakdown;
  gazetteRef: string;
  admitCardsReleased: number;
  applicationFees?: ApplicationFeesInput;
  qualificationSummary?: string;
  ageLimitSummary?: string;
  postBreakdown?: PostBreakdownInput[];
  applyOnlineUrl?: string;
  officialNoticePdfUrl?: string;
  officialWebsiteUrl?: string;
  admitCardUrl?: string;
  answerKeyUrl?: string;
  syllabusUrl?: string;
  selectionStages?: string[];
  description?: string;
  faqs?: FaqItemInput[];
}

export interface CandidateDocuments {
  photoSignature: boolean;
  nationalId: boolean;
  degreeCertificate: boolean;
  categoryCertificate: boolean;
  feeReceipt: boolean;
}

export interface CandidateDossier {
  rollNumber: string;
  registrationId: string;
  fullName: string;
  dateOfBirth: string;
  ageYears: number;
  category: ReservationCategory;
  appliedAdvtId: string;
  appliedPost: string;
  department: string;
  examCenterCode: string;
  writtenScore: number | null;
  status: PipelineStatus;
  submittedAt: string;
  documents: CandidateDocuments;
  scrutinyRemarks: string;
  verifiedBy: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  referenceId: string;
  statusType: PipelineStatus;
}

export interface KpiSummary {
  totalVacancies: number;
  activeRequisitionsCount: number;
  totalApplicationsReceived: number;
  verificationPendingCount: number;
  resultsLiveCount: number;
  admitCardsIssuedTotal: number;
}

export interface NewNotificationInput {
  advtNo: string;
  postTitle: string;
  department: string;
  ministryCode?: string;
  payLevel: string;
  vacancies: number;
  categoryBreakdown?: CategoryBreakdown;
  startDate?: string;
  deadlineDate: string;
  examDate?: string;
  status: PipelineStatus;
  applicationFees?: ApplicationFeesInput;
  qualificationSummary?: string;
  ageLimitSummary?: string;
  postBreakdown?: PostBreakdownInput[];
  applyOnlineUrl?: string;
  officialNoticePdfUrl?: string;
  officialWebsiteUrl?: string;
  admitCardUrl?: string;
  answerKeyUrl?: string;
  syllabusUrl?: string;
  selectionStages?: string[];
  description?: string;
  faqs?: FaqItemInput[];
}
