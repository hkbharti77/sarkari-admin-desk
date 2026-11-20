import {
  AuditLogEntry,
  CandidateDossier,
  CategoryBreakdown,
  NewNotificationInput,
  PipelineStatus,
  RecruitmentNotification,
} from '../types/recruitment';
import { AdminUserProfile, LoginCredentials } from '../types/auth';

export const API_BASE_URL =
  (import.meta as unknown as { env?: { VITE_API_BASE_URL?: string } }).env
    ?.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

const TOKEN_KEY = 'govjob_admin_token';
const USER_KEY = 'govjob_admin_user';

export const DEFAULT_OFFICER: AdminUserProfile = {
  id: 'ADM-01',
  name: 'Super Administrator',
  email: 'admin@govjob.in',
  role: 'SUPER_ADMIN',
  isActive: true,
  designation: 'Lead Administrator · Content & Publishing Desk',
};

type AuthErrorListener = () => void;

class ApiService {
  private token: string | null = null;
  private currentUser: AdminUserProfile | null = null;
  private authErrorListeners: AuthErrorListener[] = [];

  constructor() {
    try {
      this.token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
      const storedUser = typeof localStorage !== 'undefined' ? localStorage.getItem(USER_KEY) : null;
      if (storedUser) {
        try {
          this.currentUser = JSON.parse(storedUser);
        } catch {
          this.currentUser = null;
        }
      }
    } catch {
      this.token = null;
      this.currentUser = null;
    }
  }

  // ─── AUTHENTICATION LISTENERS & ACCESSORS ──────────────────────────────

  onAuthError(listener: AuthErrorListener): () => void {
    this.authErrorListeners.push(listener);
    return () => {
      this.authErrorListeners = this.authErrorListeners.filter((l) => l !== listener);
    };
  }

  private notifyAuthError() {
    this.clearSession();
    this.authErrorListeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('[ApiService] Auth error listener error:', err);
      }
    });
  }

  getToken(): string | null {
    return this.token || localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string | null): void {
    this.token = token;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  getCurrentUser(): AdminUserProfile | null {
    if (this.currentUser) return this.currentUser;
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
        return this.currentUser;
      } catch {
        return null;
      }
    }
    return null;
  }

  setCurrentUser(user: AdminUserProfile | null): void {
    this.currentUser = user;
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  clearSession(): void {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // ─── LOGIN / LOGOUT / PROFILE ──────────────────────────────────────────

  /**
   * Admin Login method
   */
  async login(credentials: LoginCredentials): Promise<{
    token: string;
    user: AdminUserProfile;
    isOfflineFallback?: boolean;
  }> {
    const { email, password, rememberMe = true } = credentials;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        const message =
          errorJson.message ||
          (res.status === 401
            ? 'Invalid admin email or password. Please verify credentials.'
            : res.status === 403
            ? 'Account deactivated. Please contact lead administrator.'
            : `Authentication error (HTTP ${res.status})`);
        throw new Error(message);
      }

      const json = await res.json();
      const payload = json.data || json;
      const accessToken = payload.accessToken;
      const rawUser = payload.user || {};

      const user: AdminUserProfile = {
        id: rawUser.id || rawUser._id || 'ADM-01',
        name: rawUser.name || 'Site Administrator',
        email: rawUser.email || email.toLowerCase(),
        role: rawUser.role || 'SUPER_ADMIN',
        isActive: rawUser.isActive ?? true,
        lastLoginAt: rawUser.lastLoginAt || new Date().toISOString(),
        designation: DEFAULT_OFFICER.designation,
      };

      this.token = accessToken;
      this.currentUser = user;

      if (rememberMe) {
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }

      return { token: accessToken, user };
    } catch (err: any) {
      // If network failure or backend not yet started, allow demo credentials
      if (
        err.message?.includes('Failed to fetch') ||
        err.message?.includes('NetworkError') ||
        err.name === 'TypeError'
      ) {
        if (
          email.trim().toLowerCase() === 'admin@govjob.in' &&
          password === 'Admin@1234'
        ) {
          const fallbackToken = 'offline_admin_token_' + Date.now();
          this.token = fallbackToken;
          this.currentUser = DEFAULT_OFFICER;
          localStorage.setItem(TOKEN_KEY, fallbackToken);
          localStorage.setItem(USER_KEY, JSON.stringify(DEFAULT_OFFICER));
          return { token: fallbackToken, user: DEFAULT_OFFICER, isOfflineFallback: true };
        }

        throw new Error(
          'Cannot connect to backend server at ' +
            API_BASE_URL +
            '. Please verify the backend is running.'
        );
      }
      throw err;
    }
  }

  /**
   * Log out currently authenticated administrator
   */
  async logout(): Promise<void> {
    const token = this.getToken();
    if (token && !token.startsWith('offline_admin_token_')) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.warn('[ApiService] Server logout notice failed:', err);
      }
    }
    this.clearSession();
  }

  /**
   * Retrieve current administrator profile
   */
  async getMe(): Promise<AdminUserProfile> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No active admin session');
    }

    if (token.startsWith('offline_admin_token_')) {
      return this.currentUser || DEFAULT_OFFICER;
    }

    const res = await this.request<any>('/auth/me');
    const user: AdminUserProfile = {
      id: res._id || res.id,
      name: res.name,
      email: res.email,
      role: res.role,
      isActive: res.isActive,
      lastLoginAt: res.lastLoginAt,
      designation: DEFAULT_OFFICER.designation,
    };
    this.setCurrentUser(user);
    return user;
  }

  /**
   * Trigger backend seed for default super admin
   */
  async seedSuperAdmin(): Promise<{ message: string; email?: string; defaultPassword?: string }> {
    const res = await fetch(`${API_BASE_URL}/admin/auth/seed-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to seed super admin');
    }
    const json = await res.json();
    return json.data || json;
  }

  // ─── HTTP REQUEST WRAPPER ─────────────────────────────────────────────

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token && !token.startsWith('offline_admin_token_')) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_BASE_URL}${endpoint}`;
    let res: Response;
    try {
      res = await fetch(url, { ...options, headers });
    } catch (netErr: any) {
      throw new Error(
        `Backend service unreachable (${netErr.message || 'Network error'})`
      );
    }

    if (res.status === 401) {
      this.notifyAuthError();
      throw new Error('Admin session expired. Please sign in again.');
    }

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(
        errorJson.message || `API request failed with HTTP ${res.status}`
      );
    }

    const json = await res.json();
    return (json.data !== undefined ? json.data : json) as T;
  }

  // ─── NOTIFICATIONS / JOBS ──────────────────────────────────────────────

  async getJobs(params?: {
    status?: string;
    department?: string;
    keyword?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<RecruitmentNotification[]> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.department && params.department !== 'ALL')
      query.set('department', params.department);
    if (params?.keyword) query.set('keyword', params.keyword);
    if (params?.page) query.set('page', String(params.page));
    query.set('limit', String(params?.limit || 5000));
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.sortOrder) query.set('sortOrder', params.sortOrder);

    const res = await this.request<{ data: any[] }>(`/admin/jobs?${query.toString()}`);
    const items = Array.isArray(res) ? res : res.data || [];

    return items.map((item: any) => ({
      id: item.customId || item.id,
      advtNo: item.advtNo,
      postTitle: item.postTitle,
      department: item.department,
      ministryCode: item.ministryCode,
      payLevel: item.payLevel,
      vacancies: item.vacancies,
      categoryBreakdown: item.categoryBreakdown,
      applicationsReceived: item.applicationsReceived || 0,
      scrutinyPending: item.scrutinyPending || 0,
      startDate: item.startDate || '',
      deadlineDate: item.deadlineDate,
      examDate: item.examDate || '',
      status: item.status,
      cutoffMarks: item.cutoffMarks || { UR: 0, OBC: 0, SC: 0, ST: 0, EWS: 0 },
      gazetteRef: item.gazetteRef,
      admitCardsReleased: item.admitCardsReleased || 0,
      applicationFees: item.applicationFees,
      qualificationSummary: item.qualificationSummary,
      ageLimitSummary: item.ageLimitSummary,
      postBreakdown: item.postBreakdown,
      applyOnlineUrl: item.applyOnlineUrl,
      officialNoticePdfUrl: item.officialNoticePdfUrl,
      officialWebsiteUrl: item.officialWebsiteUrl,
      admitCardUrl: item.admitCardUrl,
      answerKeyUrl: item.answerKeyUrl,
      syllabusUrl: item.syllabusUrl,
      selectionStages: item.selectionStages,
      description: item.description,
      faqs: item.faqs,
      _id: item._id,
    }));
  }

  async createJob(
    input: NewNotificationInput,
    customId: string,
    gazetteRef: string
  ): Promise<RecruitmentNotification> {
    const derivedMinistry =
      input.department.includes('UPSC')
        ? 'Central Recruiting Commission'
        : input.department.includes('SSC')
        ? 'Staff Selection Board'
        : input.department.includes('RRB')
        ? 'Railway Recruitment Board'
        : input.department.includes('IBPS')
        ? 'Banking Personnel Board'
        : input.department.includes('DRDO')
        ? 'Defence Research Org'
        : input.department;

    const payload = {
      customId,
      advtNo: input.advtNo,
      postTitle: input.postTitle,
      department: input.department,
      ministryCode: (input as any).ministryCode || derivedMinistry,
      payLevel: input.payLevel,
      vacancies: input.vacancies,
      categoryBreakdown: input.categoryBreakdown,
      startDate: input.startDate || undefined,
      deadlineDate: input.deadlineDate,
      examDate:
        input.examDate && input.examDate.trim().length > 0
          ? input.examDate.trim()
          : undefined,
      status: input.status,
      gazetteRef,
      applicationFees: input.applicationFees,
      qualificationSummary: input.qualificationSummary,
      ageLimitSummary: input.ageLimitSummary,
      postBreakdown: input.postBreakdown,
      applyOnlineUrl: input.applyOnlineUrl?.trim() || undefined,
      officialNoticePdfUrl: input.officialNoticePdfUrl?.trim() || undefined,
      officialWebsiteUrl: input.officialWebsiteUrl?.trim() || undefined,
      admitCardUrl: input.admitCardUrl?.trim() || undefined,
      answerKeyUrl: input.answerKeyUrl?.trim() || undefined,
      syllabusUrl: input.syllabusUrl?.trim() || undefined,
      selectionStages: input.selectionStages,
      description: input.description?.trim() || undefined,
      faqs: input.faqs,
    };

    const res = await this.request<any>('/admin/jobs', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return {
      id: res.customId || customId,
      advtNo: res.advtNo,
      postTitle: res.postTitle,
      department: res.department,
      ministryCode: res.ministryCode,
      payLevel: res.payLevel,
      vacancies: res.vacancies,
      categoryBreakdown: res.categoryBreakdown,
      applicationsReceived: res.applicationsReceived || 0,
      scrutinyPending: res.scrutinyPending || 0,
      startDate: res.startDate || input.startDate || '',
      deadlineDate: res.deadlineDate,
      examDate: res.examDate || '',
      status: res.status,
      cutoffMarks: res.cutoffMarks || { UR: 0, OBC: 0, SC: 0, ST: 0, EWS: 0 },
      gazetteRef: res.gazetteRef,
      admitCardsReleased: res.admitCardsReleased || 0,
      applicationFees: res.applicationFees,
      qualificationSummary: res.qualificationSummary,
      ageLimitSummary: res.ageLimitSummary,
      postBreakdown: res.postBreakdown,
      applyOnlineUrl: res.applyOnlineUrl || input.applyOnlineUrl,
      officialNoticePdfUrl: res.officialNoticePdfUrl || input.officialNoticePdfUrl,
      officialWebsiteUrl: res.officialWebsiteUrl || input.officialWebsiteUrl,
      admitCardUrl: res.admitCardUrl || input.admitCardUrl,
      answerKeyUrl: res.answerKeyUrl || input.answerKeyUrl,
      syllabusUrl: res.syllabusUrl || input.syllabusUrl,
      selectionStages: res.selectionStages || input.selectionStages,
      description: res.description || input.description,
      faqs: res.faqs || input.faqs,
    };
  }

  async updateJob(
    id: string,
    updates: Partial<RecruitmentNotification> & { mongoId?: string }
  ): Promise<any> {
    let targetId = updates.mongoId;
    if (!targetId) {
      const all = await this.getJobs();
      const match = all.find((j: any) => j.id === id || (j as any)?._id === id);
      targetId = (match as any)?._id || id;
    }

    const { mongoId, _id, id: rawId, ...cleanUpdates } = updates as any;

    return this.request<any>(`/admin/jobs/${targetId}`, {
      method: 'PATCH',
      body: JSON.stringify(cleanUpdates),
    });
  }

  async deleteJob(id: string): Promise<any> {
    let targetId = id;
    try {
      const all = await this.getJobs();
      const match = all.find((j: any) => j.id === id);
      if (match && (match as any)._id) {
        targetId = (match as any)._id;
      }
    } catch {
      // fallback to id
    }

    return this.request<any>(`/admin/jobs/${targetId}`, {
      method: 'DELETE',
    });
  }

  /**
   * AI Extraction: parses PDF base64 or copied text using backend Gemini integration
   */
  async extractJobWithAI(payload: {
    text?: string;
    pdfBase64?: string;
    mimeType?: string;
    apiKey?: string;
    autoSaveDraft?: boolean;
    forceRefresh?: boolean;
  }): Promise<any> {
    return this.request<any>('/admin/jobs/ai-extract', {
      method: 'POST',
      body: JSON.stringify({
        autoSaveDraft: payload.autoSaveDraft ?? true,
        ...payload,
      }),
    });
  }

  // ─── CANDIDATES & SCRUTINY ─────────────────────────────────────────────

  async getCandidates(params?: {
    advtId?: string;
    status?: string;
    search?: string;
  }): Promise<CandidateDossier[]> {
    const query = new URLSearchParams();
    if (params?.advtId && params.advtId !== 'ALL') query.set('advtId', params.advtId);
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    query.set('limit', '100');

    const res = await this.request<{ data: any[] }>(`/admin/scrutiny-queue?${query.toString()}`);
    const items = Array.isArray(res) ? res : res.data || [];

    return items.map((cand: any) => ({
      rollNumber: cand.rollNumber,
      registrationId: cand.registrationId,
      fullName: cand.fullName,
      dateOfBirth: cand.dateOfBirth,
      ageYears: cand.ageYears,
      category: cand.category,
      appliedAdvtId: cand.appliedAdvtId,
      appliedPost: cand.appliedPost,
      department: cand.department,
      examCenterCode: cand.examCenterCode,
      writtenScore: cand.writtenScore,
      status: cand.status,
      submittedAt: cand.submittedAt,
      documents: cand.documents,
      scrutinyRemarks: cand.scrutinyRemarks || '',
      verifiedBy: cand.verifiedBy || '',
    }));
  }

  async updateCandidate(
    rollNumber: string,
    updates: Partial<CandidateDossier>
  ): Promise<any> {
    return this.request<any>(`/admin/candidates/${rollNumber}/scrutiny`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async bulkVerifyCandidates(rollNumbers: string[]): Promise<any> {
    return this.request<any>('/admin/candidates/bulk-verify', {
      method: 'POST',
      body: JSON.stringify({ rollNumbers }),
    });
  }

  // ─── RESULTS & CUTOFFS ──────────────────────────────────────────────────

  async previewCutoffs(
    notificationId: string,
    cutoffs: CategoryBreakdown
  ): Promise<any> {
    const query = new URLSearchParams({
      UR: String(cutoffs.UR),
      OBC: String(cutoffs.OBC),
      SC: String(cutoffs.SC),
      ST: String(cutoffs.ST),
      EWS: String(cutoffs.EWS),
    });
    return this.request<any>(
      `/admin/results/preview/${notificationId}?${query.toString()}`
    );
  }

  async publishResults(
    notificationId: string,
    cutoffMarks: CategoryBreakdown,
    gazetteRef: string
  ): Promise<any> {
    return this.request<any>('/admin/results/publish', {
      method: 'POST',
      body: JSON.stringify({
        notificationId,
        cutoffMarks,
        gazetteRef,
      }),
    });
  }

  // ─── AUDIT LOGS ────────────────────────────────────────────────────────

  async getAuditLogs(params?: { limit?: number }): Promise<AuditLogEntry[]> {
    const query = new URLSearchParams();
    query.set('limit', String(params?.limit || 50));

    const res = await this.request<{ data: any[] }>(`/admin/audit-logs?${query.toString()}`);
    const items = Array.isArray(res) ? res : res.data || [];

    return items.map((log: any) => ({
      id: log._id || `AUD-${log.referenceId || 'EVT'}`,
      timestamp:
        log.timestamp
          ? new Date(log.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST'
          : '',
      actor: log.actor || 'Site Administrator',
      role: log.role || 'SUPER_ADMIN',
      action: log.action,
      referenceId: log.referenceId || '',
      statusType: (log.statusType || 'Admit Card / Active') as PipelineStatus,
    }));
  }

  async recordAuditLog(
    action: string,
    referenceId?: string,
    statusType?: string,
    metadata?: Record<string, unknown>
  ): Promise<any> {
    try {
      return await this.request<any>('/admin/audit-logs', {
        method: 'POST',
        body: JSON.stringify({ action, referenceId, statusType, metadata }),
      });
    } catch (err) {
      console.warn('[ApiService] Could not record audit log to backend:', err);
    }
  }

  // ─── TAXONOMIES / ORGANIZATIONS ───────────────────────────────────────

  async getOrganizations(): Promise<Array<{ code: string; name: string; slug: string }>> {
    const res = await this.request<any>('/public/organizations');
    const items = Array.isArray(res) ? res : (res as any)?.data || [];
    return items.map((item: any) => ({
      code: item.shortName || item.code || item.slug?.toUpperCase() || '',
      name: item.name,
      slug: item.slug,
    }));
  }

  async createOrganization(org: {
    name: string;
    shortName: string;
    slug?: string;
    organizationType?: string;
    jurisdiction?: string;
    officialWebsite?: string;
  }): Promise<any> {
    const slug = org.slug || org.shortName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return this.request<any>('/admin/organizations', {
      method: 'POST',
      body: JSON.stringify({
        name: org.name,
        shortName: org.shortName,
        slug,
        organizationType: org.organizationType || 'OTHER',
        jurisdiction: org.jurisdiction || 'Government / PSU / Corporation',
        officialWebsite: org.officialWebsite || 'https://india.gov.in',
        isActive: true,
      }),
    });
  }

  // ─── CSV EXPORT URL ────────────────────────────────────────────────────

  getCsvExportUrl(type: 'requisitions' | 'candidates'): string {
    return `${API_BASE_URL}/admin/export/csv?type=${type}`;
  }
}

export { ApiService };
export const api = new ApiService();
export default api;
