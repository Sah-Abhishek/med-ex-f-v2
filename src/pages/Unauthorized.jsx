import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center fade-in">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <p className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-widest mb-2">
          Error 403
        </p>
        <h1 className="text-xl font-bold text-[var(--color-text)] tracking-tight mb-2">
          Access Forbidden
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-8 leading-relaxed">
          You don't have permission to access this resource. Contact your administrator for access.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => navigate(-1)} variant="outline" size="md">
            Go Back
          </Button>
          <Button onClick={() => navigate('/dashboard')} size="md">
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
