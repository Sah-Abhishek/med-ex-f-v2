const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0c1222] flex relative overflow-hidden">
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-sky-500/[0.07] blur-[120px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/[0.05] blur-[120px]" />

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col justify-between p-12 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-20">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-sky-400 flex items-center justify-center shadow-[0_4px_16px_rgba(14,165,233,0.35)]">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">MedEx</span>
          </div>

          <h2 className="text-[40px] font-extrabold text-white leading-[1.1] tracking-tight mb-4">
            Medical
            <br />
            Examination
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-sky-400">
              Platform
            </span>
          </h2>
          <p className="text-slate-400 text-[15px] leading-relaxed max-w-sm">
            Secure role-based access control system for medical examination management and compliance.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
            <span className="text-xs text-slate-500 font-medium">System Online</span>
          </div>
          <div className="w-px h-3 bg-slate-700" />
          <span className="text-xs text-slate-500 font-medium">256-bit Encrypted</span>
          <div className="w-px h-3 bg-slate-700" />
          <span className="text-xs text-slate-500 font-medium">HIPAA Compliant</span>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 relative z-10">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-sky-400 flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">MedEx</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
