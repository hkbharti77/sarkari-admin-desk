import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateEmail,
  validatePassword,
  formatOfficerRole,
  getOfficerInitials,
  hasRolePermission,
} from './authLogic';

test('validateEmail validates officer email addresses correctly', () => {
  assert.equal(validateEmail('admin@govjob.in'), true);
  assert.equal(validateEmail('officer.upsc@nic.in'), true);
  assert.equal(validateEmail('invalid-email'), false);
  assert.equal(validateEmail(''), false);
  assert.equal(validateEmail('@domain.com'), false);
});

test('validatePassword validates length requirements', () => {
  assert.equal(validatePassword('Admin@1234').valid, true);
  assert.equal(validatePassword('12345').valid, false);
  assert.equal(validatePassword('').valid, false);
});

test('formatOfficerRole maps roles to human-friendly labels', () => {
  assert.equal(formatOfficerRole('SUPER_ADMIN'), 'Super Administrator');
  assert.equal(formatOfficerRole('SCRUTINY_OFFICER'), 'Scrutiny Officer');
  assert.equal(formatOfficerRole('REVIEWER'), 'Results Reviewer');
  assert.equal(formatOfficerRole(undefined), 'Authorized Officer');
});

test('getOfficerInitials returns 2 uppercase letters', () => {
  assert.equal(getOfficerInitials('Super Administrator'), 'SA');
  assert.equal(getOfficerInitials('Officer'), 'OF');
  assert.equal(getOfficerInitials(''), 'GO');
  assert.equal(getOfficerInitials('Rajesh Kumar Sharma'), 'RS');
});

test('hasRolePermission enforces SUPER_ADMIN authority', () => {
  assert.equal(hasRolePermission('SUPER_ADMIN', 'SCRUTINY_OFFICER'), true);
  assert.equal(hasRolePermission('SUPER_ADMIN', 'REVIEWER'), true);
  assert.equal(hasRolePermission('SCRUTINY_OFFICER', 'SCRUTINY_OFFICER'), true);
  assert.equal(hasRolePermission('SCRUTINY_OFFICER', 'SUPER_ADMIN'), false);
  assert.equal(hasRolePermission(undefined, 'SCRUTINY_OFFICER'), false);
});
