import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center fade-in">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
          <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
          </svg>
        </div>
        <p className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-widest mb-2">
          Error 404
        </p>
        <h1 className="text-xl font-bold text-[var(--color-text)] tracking-tight mb-2">
          Page Not Found
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => navigate(-1)} variant="outline" size="md">
            Go Back
          </Button>
          <Button onClick={() => navigate('/')} size="md">
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
