import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateKpiSummary,
  computeCategoryBreakdown,
  evaluateCandidateReadiness,
  filterCandidates,
  filterNotifications,
  validateNotificationInput,
} from './recruitmentLogic';
import { CandidateDossier, RecruitmentNotification } from '../types/recruitment';

function makeNotification(
  overrides: Partial<RecruitmentNotification> = {}
): RecruitmentNotification {
  return {
    id: 'REQ-01',
    advtNo: 'ADVT-01',
    postTitle: 'Post Title',
    department: 'Commission Name',
    ministryCode: 'Ministry',
    payLevel: 'Level-10',
    vacancies: 100,
    categoryBreakdown: { UR: 41, OBC: 27, SC: 15, ST: 7, EWS: 10 },
    applicationsReceived: 1000,
    scrutinyPending: 10,
    deadlineDate: '2026-12-01',
    examDate: '2026-12-20',
    status: 'Admit Card / Active',
    cutoffMarks: { UR: 90, OBC: 85, SC: 75, ST: 70, EWS: 80 },
    gazetteRef: 'GSR-01',
    admitCardsReleased: 990,
    ...overrides,
  };
}

function makeCandidate(
  overrides: Partial<CandidateDossier> = {}
): CandidateDossier {
  return {
    rollNumber: 'ROLL-1001',
    registrationId: 'REG-1001',
    fullName: 'Applicant Name',
    dateOfBirth: '2000-01-01',
    ageYears: 26,
    category: 'UR',
    appliedAdvtId: 'REQ-01',
    appliedPost: 'Post Title',
    department: 'Commission Name',
    examCenterCode: 'CENTER-01',
    writtenScore: 100,
    status: 'Pending / Scrutiny',
    submittedAt: '2026-11-01 10:00 IST',
    documents: {
      photoSignature: true,
      nationalId: true,
      degreeCertificate: true,
      categoryCertificate: true,
      feeReceipt: false,
    },
    scrutinyRemarks: 'Pending scrutiny note',
    verifiedBy: '',
    ...overrides,
  };
}

test('computeCategoryBreakdown allocates statutory quotas summing exactly to totalVacancies', () => {
  const breakdown = computeCategoryBreakdown(1000);
  assert.equal(
    breakdown.UR + breakdown.OBC + breakdown.SC + breakdown.ST + breakdown.EWS,
    1000
  );
  assert.equal(breakdown.OBC, 270);
  assert.equal(breakdown.SC, 150);
  assert.equal(breakdown.ST, 75);
  assert.equal(breakdown.EWS, 100);
  assert.equal(breakdown.UR, 405);
});

test('calculateKpiSummary computes accurate totals across notifications and dossiers', () => {
  const notifs = [
    makeNotification({
      vacancies: 1000,
      applicationsReceived: 500000,
      scrutinyPending: 1000,
      admitCardsReleased: 490000,
      status: 'Admit Card / Active',
    }),
    makeNotification({
      id: 'REQ-02',
      vacancies: 400,
      applicationsReceived: 100000,
      scrutinyPending: 300,
      admitCardsReleased: 99000,
      status: 'Result Announced',
    }),
  ];
  const cands = [makeCandidate({ status: 'Pending / Scrutiny' })];
  const kpi = calculateKpiSummary(notifs, cands);
  assert.equal(kpi.totalVacancies, 1400);
  assert.equal(kpi.activeRequisitionsCount, 2);
  assert.equal(kpi.totalApplicationsReceived, 600000);
  assert.equal(kpi.verificationPendingCount, 1301);
  assert.equal(kpi.resultsLiveCount, 1);
});

test('filterNotifications filters by status and search query accurately', () => {
  const notifs = [
    makeNotification({
      id: 'REQ-01',
      status: 'Admit Card / Active',
      advtNo: 'ADVT-ALPHA',
    }),
    makeNotification({
      id: 'REQ-02',
      status: 'Result Announced',
      advtNo: 'ADVT-BETA',
    }),
  ];
  const byStatus = filterNotifications(notifs, {
    statusFilter: 'Result Announced',
  });
  assert.equal(byStatus.length, 1);
  assert.equal(byStatus[0].id, 'REQ-02');

  const byQuery = filterNotifications(notifs, { searchQuery: 'ALPHA' });
  assert.equal(byQuery.length, 1);
  assert.equal(byQuery[0].id, 'REQ-01');
});

test('validateNotificationInput catches empty fields and date ordering errors', () => {
  const invalid = validateNotificationInput({
    advtNo: '12',
    postTitle: 'Abc',
    department: '',
    payLevel: '',
    vacancies: 0,
    deadlineDate: '2026-12-20',
    examDate: '2026-12-10',
    status: 'Pending / Scrutiny',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.advtNo);
  assert.ok(invalid.errors.postTitle);
  assert.ok(invalid.errors.department);
  assert.ok(invalid.errors.vacancies);
  assert.ok(invalid.errors.examDate);

  const valid = validateNotificationInput({
    advtNo: 'ADVT-2026-01',
    postTitle: 'Senior Section Engineer',
    department: 'Railway Recruitment Board',
    payLevel: 'Level-7',
    vacancies: 350,
    deadlineDate: '2026-12-01',
    examDate: '2026-12-28',
    status: 'Admit Card / Active',
  });
  assert.equal(valid.valid, true);
});

test('evaluateCandidateReadiness identifies missing documents accurately', () => {
  const readiness = evaluateCandidateReadiness(makeCandidate());
  assert.equal(readiness.allDocsVerified, false);
  assert.equal(readiness.verifiedCount, 4);
  assert.equal(readiness.missingDocs.length, 1);
  assert.ok(readiness.missingDocs[0].includes('Fee Receipt'));
});

test('filterCandidates matches rollNumber and status', () => {
  const cands = [
    makeCandidate({ rollNumber: 'ROLL-1001', status: 'Pending / Scrutiny' }),
  ];
  const res = filterCandidates(cands, {
    searchQuery: 'ROLL-1001',
    statusFilter: 'Pending / Scrutiny',
  });
  assert.equal(res.length, 1);
});
