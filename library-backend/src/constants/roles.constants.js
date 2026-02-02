/**
 * USER, LIBRARIAN, ADMIN roles
 */

export const ROLES = {
  USER: 'user',
  LIBRARIAN: 'librarian',
  ADMIN: 'admin',
};

export const ROLE_PERMISSIONS = {
  [ROLES.USER]: ['read:books', 'read:ebooks', 'create:rental', 'read:own-rentals', 'read:own-payments'],
  [ROLES.LIBRARIAN]: [
    'read:books',
    'read:ebooks',
    'read:rentals',
    'create:issue',
    'create:return',
    'scan:qr',
    'read:inventory',
    'update:inventory',
  ],
  [ROLES.ADMIN]: [
    'read:all',
    'create:all',
    'update:all',
    'delete:all',
    'manage:users',
    'manage:librarians',
    'manage:pricing',
    'read:analytics',
    'read:audit-logs',
  ],
};

export default {
  ROLES,
  ROLE_PERMISSIONS,
};
