import { NewNotificationInput, PipelineStatus, PostBreakdownInput, FaqItemInput } from '../types/recruitment';
import { api } from './api';

export const PUBLISH_DRAFT_STORAGE = 'govjob_publish_draft_v1';

export interface ExtractedJobData {
  advtNo?: string;
  postTitle?: string;
  department?: string;
  payLevel?: string;
  vacancies?: number;
  categoryBreakdown?: {
    UR?: number;
    OBC?: number;
    SC?: number;
    ST?: number;
    EWS?: number;
  };
  startDate?: string;
  deadlineDate?: string;
  examDate?: string;
  status?: PipelineStatus;
  applicationFees?: {
    general?: number;
    obc?: number;
    scSt?: number;
    female?: number;
    paymentMode?: string;
  };
  qualificationSummary?: string;
  ageLimitSummary?: string;
  postBreakdown?: PostBreakdownInput[];
  selectionStages?: string[];
  applyOnlineUrl?: string;
  officialNoticePdfUrl?: string;
  officialWebsiteUrl?: string;
  admitCardUrl?: string;
  answerKeyUrl?: string;
  syllabusUrl?: string;
  description?: string;
  faqs?: FaqItemInput[];
  draftJob?: {
    _id?: string;
    id?: string;
    customId?: string;
    gazetteRef?: string;
    status?: string;
  };
}

export interface PublishDraftRecord {
  data: Partial<NewNotificationInput>;
  savedAt: string;
  source?: 'manual' | 'backend_ai';
  extractedFileName?: string;
  dbDraftId?: string;
  dbGazetteRef?: string;
}

/**
 * AiIntakeService:
 * All Gemini LLM processing is handled strictly on the backend (govjob-backend).
 * This service forwards document streams or raw text to the backend API endpoint
 * and manages draft state and database synchronization.
 */
class AiIntakeService {
  // ─── DRAFT MANAGEMENT (BROWSER CRASH / REFRESH PROTECTION) ─────────────

  /**
   * Auto-saves the in-progress notification draft to browser local storage.
   * Ensures work is retained safely in internal draft mode until published.
   */
  saveDraft(
    data: Partial<NewNotificationInput>,
    source: 'manual' | 'backend_ai' = 'manual',
    extractedFileName?: string,
    dbDraftId?: string,
    dbGazetteRef?: string
  ): void {
    try {
      const record: PublishDraftRecord = {
        data,
        savedAt: new Date().toISOString(),
        source,
        extractedFileName,
        dbDraftId,
        dbGazetteRef,
      };
      localStorage.setItem(PUBLISH_DRAFT_STORAGE, JSON.stringify(record));
    } catch (err) {
      console.warn('[AiIntakeService] Failed to auto-save publish draft:', err);
    }
  }

  /**
   * Retrieves the auto-saved draft if present.
   */
  loadDraft(): PublishDraftRecord | null {
    try {
      const raw = localStorage.getItem(PUBLISH_DRAFT_STORAGE);
      if (!raw) return null;
      return JSON.parse(raw) as PublishDraftRecord;
    } catch {
      return null;
    }
  }

  /**
   * Clears the saved publish draft.
   */
  clearDraft(): void {
    try {
      localStorage.removeItem(PUBLISH_DRAFT_STORAGE);
    } catch {
      // ignore
    }
  }

  // ─── BACKEND AI EXTRACTION & DIRECT DB DRAFT AUTOSAVE ──────────────────

  /**
   * Send notification text to backend LLM service for analysis and direct MongoDB draft creation.
   * Handled strictly by govjob-backend; no direct Gemini API calls on the frontend.
   */
  async extractFromText(
    text: string,
    options?: {
      onProgress?: (step: string) => void;
      autoSaveDraft?: boolean;
      forceRefresh?: boolean;
    }
  ): Promise<ExtractedJobData> {
    if (!text || !text.trim()) {
      throw new Error('Please paste notification text or circular details to analyze.');
    }

    options?.onProgress?.('Sending text to backend AI extraction service...');
    const result = await api.extractJobWithAI({
      text: text.trim(),
      autoSaveDraft: options?.autoSaveDraft ?? true,
      forceRefresh: options?.forceRefresh,
    });
    options?.onProgress?.('Backend AI analysis complete. Structuring fields...');
    const sanitized = this.sanitizeResponse(result);

    // Fallback: If categoryBreakdown was empty or all 0s, extract deterministically from raw pasted text
    const cb = sanitized.categoryBreakdown;
    const hasCategoryData =
      cb &&
      ((cb.UR || 0) > 0 ||
        (cb.OBC || 0) > 0 ||
        (cb.SC || 0) > 0 ||
        (cb.ST || 0) > 0 ||
        (cb.EWS || 0) > 0);

    if (!hasCategoryData && text) {
      const parseCatRegex = (names: string[]): number => {
        for (const name of names) {
          const patterns = [
            new RegExp('\\b' + name + '\\b\\s*\\n+\\s*(\\d+)', 'i'),
            new RegExp('\\b' + name + '\\b[\\s\\t|:\\-]+(\\d+)', 'i'),
            new RegExp('(\\d+)[\\s\\t|:\\-]+\\b' + name + '\\b', 'i'),
          ];
          for (const p of patterns) {
            const m = text.match(p);
            if (m) {
              const val = parseInt(m[1], 10);
              if (val > 0) return val;
            }
          }
        }
        return 0;
      };

      const ur = parseCatRegex(['General', 'GEN', 'UR', 'Unreserved', 'OC']);
      const obc = parseCatRegex(['OBC', 'OBC-NCL', 'Other Backward', 'SEBC', 'BC']);
      const sc = parseCatRegex(['SC', 'Scheduled Caste']);
      const st = parseCatRegex(['ST', 'Scheduled Tribe']);
      const ews = parseCatRegex(['EWS', 'GEN-EWS', 'Economically Weaker']);

      if (ur > 0 || obc > 0 || sc > 0 || st > 0 || ews > 0) {
        sanitized.categoryBreakdown = {
          UR: ur,
          OBC: obc,
          SC: sc,
          ST: st,
          EWS: ews,
        };
      }
    }

    return sanitized;
  }

  /**
   * Send uploaded file (PDF, TXT, DOCX) to backend LLM service for analysis and direct MongoDB draft creation.
   * Handled strictly by govjob-backend; no direct Gemini API calls on the frontend.
   */
  async extractFromFile(
    file: File,
    options?: {
      onProgress?: (step: string) => void;
      autoSaveDraft?: boolean;
      forceRefresh?: boolean;
    }
  ): Promise<ExtractedJobData> {
    const fileName = file.name.toLowerCase();
    options?.onProgress?.(`Reading ${file.name} (${Math.round(file.size / 1024)} KB)...`);

    // If it's a plain text file, send as text payload
    if (fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.csv') || file.type.startsWith('text/')) {
      const text = await file.text();
      return this.extractFromText(text, options);
    }

    // For PDF and documents, encode to base64 and send to backend
    options?.onProgress?.('Encoding document for backend AI processing...');
    const base64Data = await this.fileToBase64(file);
    const mimeType = file.type || (fileName.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');

    options?.onProgress?.('Transmitting document to backend AI extraction service...');
    const result = await api.extractJobWithAI({
      pdfBase64: base64Data,
      mimeType,
      autoSaveDraft: options?.autoSaveDraft ?? true,
      forceRefresh: options?.forceRefresh,
    });
    options?.onProgress?.('Backend AI analysis complete. Structuring form fields...');
    return this.sanitizeResponse(result);
  }

  // ─── UTILITIES & SANITIZATION ──────────────────────────────────────────

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  private sanitizeResponse(data: any): ExtractedJobData {
    return {
      advtNo: String(data.advtNo || '').trim(),
      postTitle: String(data.postTitle || '').trim(),
      department: String(data.department || '').trim(),
      payLevel: String(data.payLevel || '').trim(),
      vacancies: typeof data.vacancies === 'number' ? data.vacancies : parseInt(data.vacancies, 10) || 0,
      categoryBreakdown: data.categoryBreakdown
        ? {
            UR: Number(data.categoryBreakdown.UR) || 0,
            OBC: Number(data.categoryBreakdown.OBC) || 0,
            SC: Number(data.categoryBreakdown.SC) || 0,
            ST: Number(data.categoryBreakdown.ST) || 0,
            EWS: Number(data.categoryBreakdown.EWS) || 0,
          }
        : undefined,
      startDate: String(data.startDate || '').trim(),
      deadlineDate: String(data.deadlineDate || '').trim(),
      examDate: String(data.examDate || '').trim(),
      status: 'Pending / Scrutiny',
      applicationFees: {
        general: parseInt(data.applicationFees?.general, 10) || 100,
        obc: parseInt(data.applicationFees?.obc, 10) || 100,
        scSt: parseInt(data.applicationFees?.scSt, 10) || 0,
        female: parseInt(data.applicationFees?.female, 10) || 0,
        paymentMode:
          typeof data.applicationFees?.paymentMode === 'string'
            ? data.applicationFees.paymentMode.trim()
            : 'Online via Net Banking, Debit / Credit Card, or UPI',
      },
      qualificationSummary: String(data.qualificationSummary || '').trim(),
      ageLimitSummary: String(data.ageLimitSummary || '').trim(),
      postBreakdown: Array.isArray(data.postBreakdown)
        ? data.postBreakdown.map((p: any) => ({
            postName: String(p.postName || '').trim(),
            vacancies: parseInt(p.vacancies, 10) || 0,
            qualification: String(p.qualification || '').trim(),
          }))
        : [],
      selectionStages: Array.isArray(data.selectionStages)
        ? data.selectionStages.map((s: any) => String(s).trim())
        : [],
      applyOnlineUrl: String(data.applyOnlineUrl || '').trim(),
      officialNoticePdfUrl: String(data.officialNoticePdfUrl || '').trim(),
      officialWebsiteUrl: String(data.officialWebsiteUrl || '').trim(),
      admitCardUrl: String(data.admitCardUrl || '').trim(),
      answerKeyUrl: String(data.answerKeyUrl || '').trim(),
      syllabusUrl: String(data.syllabusUrl || '').trim(),
      description: String(data.description || '').trim(),
      faqs: Array.isArray(data.faqs)
        ? data.faqs.map((f: any) => ({
            question: String(f.question || '').trim(),
            answer: String(f.answer || '').trim(),
          }))
        : [],
      draftJob: data.draftJob
        ? {
            _id: data.draftJob._id || data.draftJob.id,
            id: data.draftJob.customId || data.draftJob.id,
            customId: data.draftJob.customId,
            gazetteRef: data.draftJob.gazetteRef,
            status: data.draftJob.status || 'Pending / Scrutiny',
          }
        : undefined,
    };
  }
}

export { AiIntakeService };
export const aiIntakeService = new AiIntakeService();
export default aiIntakeService;
