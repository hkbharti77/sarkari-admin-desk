export type AdminRole =
  | 'SUPER_ADMIN'
  | 'PUBLISHER'
  | 'REVIEWER'
  | 'SCRUTINY_OFFICER'
  | 'EDITOR';

export interface AdminUserProfile {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive?: boolean;
  lastLoginAt?: string | Date | null;
  designation?: string;
}

export interface AuthSession {
  token: string;
  user: AdminUserProfile;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RoleInfo {
  label: string;
  shortCode: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  description: string;
}

export const ROLE_METADATA: Record<AdminRole, RoleInfo> = {
  SUPER_ADMIN: {
    label: 'Super Administrator',
    shortCode: 'SUP',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    badgeBorder: 'border-purple-300',
    description: 'Lead Admin · Full Publishing, Results & Site Management Authority',
  },
  PUBLISHER: {
    label: 'Job Publisher',
    shortCode: 'PUB',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-300',
    description: 'Content Publisher · Job Requisition & Bulletin Creator',
  },
  REVIEWER: {
    label: 'Results Reviewer',
    shortCode: 'REV',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-300',
    description: 'Cutoff Evaluator & Merit List Verifier',
  },
  SCRUTINY_OFFICER: {
    label: 'Scrutiny Officer',
    shortCode: 'SCR',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-300',
    description: 'Candidate Dossier & Verification Reviewer',
  },
  EDITOR: {
    label: 'Content Editor',
    shortCode: 'EDT',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    badgeBorder: 'border-slate-300',
    description: 'Recruitment Editor & Content Operator',
  },
};
