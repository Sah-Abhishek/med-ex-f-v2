// API Configuration
export const API_URL = import.meta.env.VITE_NEXTCODE_API_URL || import.meta.env.VITE_MEDX_API_URL || 'https://uat-app.valerionhealth.com/integrations/ai';
export const MEDX_API_URL = import.meta.env.VITE_MEDX_API_URL || import.meta.env.VITE_MEDX_API_URL1 || 'https://ai.safentro.com/api';
export const MEDX_WS_URL = import.meta.env.VITE_MEDX_WS_URL || import.meta.env.VITE_MEDX_WS_URL1 || 'wss://ai.safentro.com/api/ws';

// User Roles
export const ROLES = {
  TEAM_LEAD: 'teamlead',
  CODER: 'coder',
  AUDITOR: 'auditor'
};

// Role Display Names
export const ROLE_NAMES = {
  [ROLES.TEAM_LEAD]: 'Team Lead',
  [ROLES.CODER]: 'Coder',
  [ROLES.AUDITOR]: 'Auditor'
};

// Route Paths
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  TEAM_LEAD: '/teamlead',
  CODER: '/coder',
  AUDITOR: '/auditor',
  TEAM_LEAD_ANALYTICS: '/teamlead/analytics',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/404'
};
