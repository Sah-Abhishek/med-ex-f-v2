import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { ROLE_NAMES } from '../../utils/constants';

const Header = () => {
  const { user, logout } = useAuth();
  const profile = useAuthStore((s) => s.profile);
  const [showProfile, setShowProfile] = useState(false);
  const [imgError, setImgError] = useState(false);
  const profileRef = useRef(null);
  const timeoutRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setShowProfile(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setShowProfile(false), 200);
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = profile
    ? `${profile.first_name} ${profile.last_name}`
    : user?.email;

  return (
    <header className="h-16 bg-white border-b border-[var(--color-border)] flex items-center justify-between px-8 shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-[15px] font-semibold text-[var(--color-text)] tracking-tight">
          Medical Examination System
        </h1>
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
          RBAC
        </span>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          {/* Profile trigger - entire area is hoverable */}
          <div
            ref={profileRef}
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors duration-200 cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-[var(--color-text)] leading-tight">
                  {displayName}
                </p>
                <p className="text-[11px] text-[var(--color-text-tertiary)] leading-tight">
                  {profile?.Role || ROLE_NAMES[user.role]}
                </p>
              </div>

              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-sky-600 flex items-center justify-center text-white text-[11px] font-bold tracking-tight overflow-hidden ring-2 ring-[var(--color-accent)]/20">
                {profile?.image_url && !imgError ? (
                  <img src={profile.image_url} alt="" className="w-full h-full object-cover" onError={() => setImgError(true)} />
                ) : (
                  getInitials(displayName)
                )}
              </div>

              {/* Chevron indicator */}
              <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>

            {/* Profile hover card */}
            {showProfile && profile && (
              <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[var(--color-border)] z-50 overflow-hidden">
                {/* Card header */}
                <div className="bg-gradient-to-r from-[var(--color-accent)] to-sky-600 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden">
                      {profile.image_url && !imgError ? (
                        <img src={profile.image_url} alt="" className="w-full h-full object-cover" onError={() => setImgError(true)} />
                      ) : (
                        getInitials(displayName)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {profile.first_name} {profile.last_name}
                      </p>
                      <p className="text-[11px] text-white/70 truncate">
                        {profile.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="px-5 py-3 space-y-2.5">
                  <ProfileRow label="Role" value={profile.Role} />
                  {profile.Designation && (
                    <ProfileRow label="Designation" value={profile.Designation.name} />
                  )}
                  <ProfileRow label="Employee ID" value={profile.employee_id} />

                  {profile.Specialties?.length > 0 && (
                    <ProfileRow
                      label="Specialties"
                      value={profile.Specialties.map((s) => s.name).join(', ')}
                    />
                  )}
                  {profile.Locations?.length > 0 && (
                    <ProfileRow
                      label="Location"
                      value={profile.Locations.map((l) => l.name).join(', ')}
                    />
                  )}
                  {profile.Clients?.length > 0 && (
                    <ProfileRow
                      label="Client"
                      value={profile.Clients.map((c) => c.name).join(', ')}
                    />
                  )}
                </div>

                {/* Attendance footer */}
                {(profile.present != null || profile.absent != null) && (
                  <div className="px-5 py-3 border-t border-[var(--color-border)] flex gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        Present: <span className="font-semibold text-[var(--color-text)]">{profile.present}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        Absent: <span className="font-semibold text-[var(--color-text)]">{profile.absent}</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-red-50 rounded-[var(--radius-sm)] transition-all duration-200 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};

const ProfileRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3">
    <span className="text-[11px] text-[var(--color-text-tertiary)] shrink-0">{label}</span>
    <span className="text-[12px] font-medium text-[var(--color-text)] text-right">{value}</span>
  </div>
);

export default Header;
