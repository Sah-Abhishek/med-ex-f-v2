import { Link, useLocation } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';
import { PERMISSIONS } from '../../utils/rolePermissions';
import { ROUTES } from '../../utils/constants';
import { useChartsStore } from '../../store/chartsStore';

const DashboardIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const TeamIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
);

const CodeIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const AuditIcon = () => (
  <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
  </svg>
);

const ChevronIcon = ({ isCollapsed }) => (
  <svg
    className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const Sidebar = () => {
  const location = useLocation();
  const { hasPermission } = useRole();
  const isCollapsed = useChartsStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useChartsStore((s) => s.toggleSidebar);

  const menuItems = [
    { name: 'Dashboard', path: ROUTES.DASHBOARD, icon: DashboardIcon, show: true },
    { name: 'User Management', path: ROUTES.TEAM_LEAD, icon: UsersIcon, show: hasPermission(PERMISSIONS.MANAGE_USERS) },
    { name: 'Processing Analytics', path: ROUTES.TEAM_LEAD_ANALYTICS, icon: AnalyticsIcon, show: hasPermission(PERMISSIONS.MANAGE_USERS) },
    // { name: 'Team Management', path: ROUTES.TEAM_LEAD, icon: TeamIcon, show: hasPermission(PERMISSIONS.MANAGE_TEAMS) },
    // { name: 'Code Repositories', path: ROUTES.CODER, icon: CodeIcon, show: hasPermission(PERMISSIONS.ACCESS_CODE_REPOS) },
    // { name: 'Audit Logs', path: ROUTES.AUDITOR, icon: AuditIcon, show: hasPermission(PERMISSIONS.VIEW_AUDIT_LOGS) },
  ].filter((item) => item.show);

  return (
    <aside
      className={`bg-[var(--color-sidebar)] flex flex-col shrink-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-white/[0.06] relative">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-sky-400 flex items-center justify-center shadow-[0_2px_8px_rgba(14,165,233,0.35)] shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100 delay-150'}`}>
            <span className="text-[15px] font-bold text-white tracking-tight">MedEx</span>
            <span className="block text-[10px] text-slate-500 font-medium tracking-wide uppercase">Platform</span>
          </div>
        </div>

        {/* Toggle Button */}
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={`absolute ${isCollapsed ? 'left-1/2 -translate-x-1/2' : 'right-2'} top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-slate-700/80 hover:bg-slate-600 text-slate-300 hover:text-[var(--color-accent)] flex items-center justify-center transition-all duration-200 shadow-lg border border-white/10`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronIcon isCollapsed={isCollapsed} />
        </button> </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 group">
        <div className={`mb-2 px-3 overflow-hidden whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'h-0 opacity-0' : 'h-auto opacity-100 delay-150'}`}>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Navigation
          </span>
        </div>
        <ul className="space-y-0.5">
          {menuItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + '/');
            const Icon = item.icon;

            return (
              <li key={item.path} className="relative group/item">
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] transition-all duration-200 ${isActive
                    ? 'bg-[var(--color-sidebar-active)] text-[var(--color-accent)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[var(--color-sidebar-hover)]'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <span className={`flex-shrink-0 ${isActive ? 'text-[var(--color-accent)]' : 'text-slate-500 group-hover/item:text-slate-300'}`}>
                    <Icon />
                  </span>
                  <span className={`text-[13px] font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100 delay-150'}`}>{item.name}</span>
                  {!isCollapsed && isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                  )}
                </Link>
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-800 border border-white/10 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.4)] opacity-0 pointer-events-none group-hover/item:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                    <span className="text-xs font-semibold text-white">{item.name}</span>
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-slate-800" />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/[0.06]">
        <div className={`flex items-center gap-2 px-2 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-2 h-2 rounded-full bg-[var(--color-success)] shrink-0" />
          <span className={`text-[11px] text-slate-500 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100 delay-150'}`}>System Online</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
