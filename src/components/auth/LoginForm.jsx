import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Please enter both email and password');
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      const roleId = result.user?.roleId;
      if (roleId === 2) {
        navigate('/teamlead');
      } else if (roleId === 3) {
        navigate('/coder');
      } else {
        navigate('/unauthorized');
      }
    } else {
      setLocalError(result.error || 'Login failed');
    }
  };

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight mb-1.5">
          Welcome Back
        </h1>
        <p className="text-sm text-slate-400">
          Sign in to access your medical examination dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {localError && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-[var(--radius-md)] bg-red-500/10 border border-red-500/20">
            <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-red-300 font-medium">{localError}</span>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            email
          </label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-[var(--radius-md)] text-white text-sm placeholder-slate-500 focus:border-[var(--color-accent)]/50 focus:ring-1 focus:ring-[var(--color-accent)]/30 focus:bg-white/[0.07] transition-all duration-200"
            placeholder="Enter your Email"
            disabled={loading}
            autoComplete="Email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.08] rounded-[var(--radius-md)] text-white text-sm placeholder-slate-500 focus:border-[var(--color-accent)]/50 focus:ring-1 focus:ring-[var(--color-accent)]/30 focus:bg-white/[0.07] transition-all duration-200"
            placeholder="Enter your password"
            disabled={loading}
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-[var(--color-accent)] to-sky-500 text-white text-sm font-semibold rounded-[var(--radius-md)] hover:from-[var(--color-accent-hover)] hover:to-sky-600 shadow-[0_2px_12px_rgba(14,165,233,0.35)] hover:shadow-[0_4px_20px_rgba(14,165,233,0.4)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner size="sm" />
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>

        {/* Demo Credentials */}
        {/* <div className="mt-8 pt-6 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Demo Credentials</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { role: 'Admin', user: 'admin', pass: 'admin123' },
              { role: 'Lead', user: 'tl.medex@helionext.com', pass: 'lazy@123' },
              { role: 'Coder', user: 'coder1.medex@helionext.com', pass: 'lazy@123' },
              { role: 'Auditor', user: 'auditor1.medex@helionext.com', pass: 'lazy@123' },
            ].map((cred) => (
              <button
                key={cred.role}
                type="button"
                onClick={() => { setEmail(cred.user); setPassword(cred.pass); }}
                className="flex flex-col items-start px-3 py-2.5 rounded-[var(--radius-sm)] bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-200 cursor-pointer group"
              >
                <span className="text-[11px] font-semibold text-slate-300 group-hover:text-white transition-colors">{cred.role}</span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5">{cred.user} / {cred.pass}</span>
              </button>
            ))}
          </div>
        </div> */}
      </form>
    </div>
  );
};

export default LoginForm;
