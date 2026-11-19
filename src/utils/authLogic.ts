import { AdminRole, ROLE_METADATA } from '../types/auth';

/**
 * Validates officer email address format
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

/**
 * Validates password format for officer login
 */
export function validatePassword(password: string): {
  valid: boolean;
  message?: string;
} {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  return { valid: true };
}

/**
 * Get readable officer role label
 */
export function formatOfficerRole(role?: AdminRole | string): string {
  if (!role) return 'Authorized Officer';
  if (role in ROLE_METADATA) {
    return ROLE_METADATA[role as AdminRole].label;
  }
  return role.replace(/_/g, ' ');
}

/**
 * Extracts 2-letter uppercase initials from officer name
 */
export function getOfficerInitials(name?: string): string {
  if (!name || typeof name !== 'string') return 'GO';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Role-based permission hierarchy check
 * SUPER_ADMIN has full permissions.
 */
export function hasRolePermission(
  currentRole: AdminRole | string | undefined,
  requiredRole: AdminRole | string
): boolean {
  if (!currentRole) return false;
  if (currentRole === 'SUPER_ADMIN') return true;
  return currentRole === requiredRole;
}
