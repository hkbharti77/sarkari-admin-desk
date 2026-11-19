import {
  CandidateDossier,
  CategoryBreakdown,
  KpiSummary,
  NewNotificationInput,
  PipelineStatus,
  RecruitmentNotification,
} from '../types/recruitment';

/**
 * Computes statutory reservation category breakdown (UR 40.5%, OBC 27%, SC 15%, ST 7.5%, EWS 10%)
 * while guaranteeing the exact integer sum equals totalVacancies.
 */
export function computeCategoryBreakdown(totalVacancies: number): CategoryBreakdown {
  if (totalVacancies <= 0 || !Number.isFinite(totalVacancies)) {
    return { UR: 0, OBC: 0, SC: 0, ST: 0, EWS: 0 };
  }
  const cleanTotal = Math.floor(totalVacancies);
  const OBC = Math.round(cleanTotal * 0.27);
  const SC = Math.round(cleanTotal * 0.15);
  const ST = Math.round(cleanTotal * 0.075);
  const EWS = Math.round(cleanTotal * 0.10);
  const allocated = OBC + SC + ST + EWS;
  const UR = Math.max(0, cleanTotal - allocated);

  return { UR, OBC, SC, ST, EWS };
}

/**
 * Dynamically calculates KPI summary metrics from notifications and candidate dossiers.
 */
export function calculateKpiSummary(
  notifications: RecruitmentNotification[],
  candidates: CandidateDossier[]
): KpiSummary {
  const validNotifications = notifications.filter(
    (n) => n.status !== 'Rejected / Cancelled'
  );

  const totalVacancies = validNotifications.reduce((sum, n) => sum + n.vacancies, 0);
  const activeRequisitionsCount = validNotifications.length;
  const totalApplicationsReceived = notifications.reduce(
    (sum, n) => sum + n.applicationsReceived,
    0
  );

  const candidateScrutinyCount = candidates.filter(
    (c) => c.status === 'Pending / Scrutiny'
  ).length;

  const batchScrutinyPending = notifications.reduce(
    (sum, n) => sum + n.scrutinyPending,
    0
  );

  const resultsLiveCount = notifications.filter(
    (n) => n.status === 'Result Announced'
  ).length;

  const admitCardsIssuedTotal = notifications.reduce(
    (sum, n) => sum + n.admitCardsReleased,
    0
  );

  return {
    totalVacancies,
    activeRequisitionsCount,
    totalApplicationsReceived,
    verificationPendingCount: batchScrutinyPending + candidateScrutinyCount,
    resultsLiveCount,
    admitCardsIssuedTotal,
  };
}

/**
 * Filters recruitment notifications by search query, status, and department.
 */
export function filterNotifications(
  notifications: RecruitmentNotification[],
  options: {
    searchQuery?: string;
    statusFilter?: PipelineStatus | 'ALL';
    departmentFilter?: string;
  }
): RecruitmentNotification[] {
  const query = (options.searchQuery ?? '').trim().toLowerCase();
  const statusFilter = options.statusFilter ?? 'ALL';
  const deptFilter = options.departmentFilter ?? 'ALL';

  return notifications.filter((item) => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) {
      return false;
    }
    if (deptFilter !== 'ALL' && item.department !== deptFilter) {
      return false;
    }
    if (!query) {
      return true;
    }
    return (
      item.id.toLowerCase().includes(query) ||
      item.advtNo.toLowerCase().includes(query) ||
      item.postTitle.toLowerCase().includes(query) ||
      item.department.toLowerCase().includes(query) ||
      item.gazetteRef.toLowerCase().includes(query)
    );
  });
}

/**
 * Filters candidate dossiers by search query, status, and category.
 */
export function filterCandidates(
  candidates: CandidateDossier[],
  options: {
    searchQuery?: string;
    statusFilter?: PipelineStatus | 'ALL';
    categoryFilter?: string;
  }
): CandidateDossier[] {
  const query = (options.searchQuery ?? '').trim().toLowerCase();
  const statusFilter = options.statusFilter ?? 'ALL';
  const catFilter = options.categoryFilter ?? 'ALL';

  return candidates.filter((cand) => {
    if (statusFilter !== 'ALL' && cand.status !== statusFilter) {
      return false;
    }
    if (catFilter !== 'ALL' && cand.category !== catFilter) {
      return false;
    }
    if (!query) {
      return true;
    }
    return (
      cand.rollNumber.toLowerCase().includes(query) ||
      cand.registrationId.toLowerCase().includes(query) ||
      cand.fullName.toLowerCase().includes(query) ||
      cand.appliedPost.toLowerCase().includes(query) ||
      cand.examCenterCode.toLowerCase().includes(query)
    );
  });
}

/**
 * Validates new notification form inputs before publishing.
 */
export function validateNotificationInput(
  input: NewNotificationInput
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!input.advtNo || input.advtNo.trim().length < 4) {
    errors.advtNo = 'Advertisement Number is required (minimum 4 characters, e.g., Advt. 11/CSP-UPSC).';
  }
  if (!input.postTitle || input.postTitle.trim().length < 5) {
    errors.postTitle = 'Official Post Title is required (minimum 5 characters).';
  }
  if (!input.department || input.department.trim().length === 0) {
    errors.department = 'Commission or Ministry selection is required.';
  }
  if (!input.payLevel || input.payLevel.trim().length === 0) {
    errors.payLevel = 'Pay Level selection is required.';
  }
  if (!Number.isFinite(input.vacancies) || input.vacancies < 1 || input.vacancies > 100000) {
    errors.vacancies = 'Total sanctioned vacancies must be between 1 and 100,000.';
  }
  if (!input.deadlineDate) {
    errors.deadlineDate = 'Registration closing deadline date is required.';
  }
  if (input.startDate && input.deadlineDate && input.startDate > input.deadlineDate) {
    errors.deadlineDate = 'Registration closing deadline cannot precede application begin date.';
  }
  if (
    input.deadlineDate &&
    input.examDate &&
    input.examDate.trim().length > 0 &&
    input.examDate < input.deadlineDate
  ) {
    errors.examDate = 'Examination date cannot precede the registration closing deadline.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Evaluates whether a candidate's document checklist and score meet qualification criteria.
 */
export function evaluateCandidateReadiness(candidate: CandidateDossier): {
  allDocsVerified: boolean;
  verifiedCount: number;
  totalDocs: number;
  missingDocs: string[];
} {
  const docLabels: Record<keyof CandidateDossier['documents'], string> = {
    photoSignature: 'Biometric Photo & Signature',
    nationalId: 'Aadhaar / National Photo ID',
    degreeCertificate: 'Qualifying Degree & Marksheet',
    categoryCertificate: 'Category / Domicile Certificate',
    feeReceipt: 'Treasury Challan / Fee Receipt',
  };

  const missingDocs: string[] = [];
  let verifiedCount = 0;
  const keys = Object.keys(docLabels) as Array<keyof CandidateDossier['documents']>;

  for (const key of keys) {
    if (candidate.documents[key]) {
      verifiedCount += 1;
    } else {
      missingDocs.push(docLabels[key]);
    }
  }

  return {
    allDocsVerified: missingDocs.length === 0,
    verifiedCount,
    totalDocs: keys.length,
    missingDocs,
  };
}
