import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ROLES } from './utils/constants';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TeamLeadDashboard from './pages/TeamLeadDashboard';
import ProcessingAnalytics from './pages/ProcessingAnalytics';
import CoderDashboard from './pages/CoderDashboard';
import ProcessChart from './pages/ProcessChart';
import AuditorDashboard from './pages/AuditorDashboard';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Team Lead routes */}
        <Route
          path="/teamlead"
          element={
            <ProtectedRoute allowedRoles={[ROLES.TEAM_LEAD]}>
              <TeamLeadDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teamlead/analytics"
          element={
            <ProtectedRoute allowedRoles={[ROLES.TEAM_LEAD]}>
              <ProcessingAnalytics />
            </ProtectedRoute>
          }
        />

        {/* Coder routes */}
        <Route
          path="/coder"
          element={
            <ProtectedRoute allowedRoles={[ROLES.CODER]}>
              <CoderDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/process-chart/:id"
          element={
            <ProtectedRoute allowedRoles={[ROLES.CODER, ROLES.AUDITOR]}>
              <ProcessChart />
            </ProtectedRoute>
          }
        />

        {/* Auditor routes */}
        <Route
          path="/auditor"
          element={
            <ProtectedRoute allowedRoles={[ROLES.AUDITOR]}>
              <AuditorDashboard />
            </ProtectedRoute>
          }
        />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
