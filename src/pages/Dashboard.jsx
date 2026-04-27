import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/constants';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to role-specific dashboard
  switch (user.role) {
    case ROLES.TEAM_LEAD:
      return <Navigate to="/teamlead" replace />;
    case ROLES.CODER:
      return <Navigate to="/coder" replace />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
};

export default Dashboard;
