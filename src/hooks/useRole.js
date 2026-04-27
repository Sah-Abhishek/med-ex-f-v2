import { useAuth } from './useAuth';
import { hasPermission, hasAllPermissions, hasAnyPermission, getPermissions } from '../utils/rolePermissions';

/**
 * Custom hook for role-based access control
 */
export const useRole = () => {
  const { user } = useAuth();

  const hasRole = (role) => {
    if (!user || !user.role) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  const checkPermission = (permission) => {
    if (!user || !user.role) return false;
    return hasPermission(user.role, permission);
  };

  const checkAllPermissions = (permissions) => {
    if (!user || !user.role) return false;
    return hasAllPermissions(user.role, permissions);
  };

  const checkAnyPermission = (permissions) => {
    if (!user || !user.role) return false;
    return hasAnyPermission(user.role, permissions);
  };

  const userPermissions = user && user.role ? getPermissions(user.role) : [];

  return {
    role: user?.role,
    hasRole,
    hasPermission: checkPermission,
    hasAllPermissions: checkAllPermissions,
    hasAnyPermission: checkAnyPermission,
    permissions: userPermissions
  };
};
