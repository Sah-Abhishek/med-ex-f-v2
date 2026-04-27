import { ROLES } from './constants';

// Permission definitions
export const PERMISSIONS = {
  MANAGE_USERS: 'manage_users',
  MANAGE_TEAMS: 'manage_teams',
  ACCESS_CODE_REPOS: 'access_code_repos',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  VIEW_REPORTS: 'view_reports',
  MODIFY_SYSTEM_SETTINGS: 'modify_system_settings'
};

// Role-based permission matrix
export const ROLE_PERMISSIONS = {
  [ROLES.TEAM_LEAD]: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_TEAMS,
    PERMISSIONS.ACCESS_CODE_REPOS,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MODIFY_SYSTEM_SETTINGS
  ],
  [ROLES.CODER]: [
    PERMISSIONS.ACCESS_CODE_REPOS
  ],
  [ROLES.AUDITOR]: [
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.VIEW_REPORTS
  ]
};

/**
 * Check if a role has a specific permission
 */
export const hasPermission = (role, permission) => {
  if (!role || !permission) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
};

/**
 * Check if a user has multiple permissions
 */
export const hasAllPermissions = (role, permissions) => {
  if (!role || !permissions || !Array.isArray(permissions)) return false;
  return permissions.every(permission => hasPermission(role, permission));
};

/**
 * Check if a user has at least one of the permissions
 */
export const hasAnyPermission = (role, permissions) => {
  if (!role || !permissions || !Array.isArray(permissions)) return false;
  return permissions.some(permission => hasPermission(role, permission));
};

/**
 * Get all permissions for a role
 */
export const getPermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};
