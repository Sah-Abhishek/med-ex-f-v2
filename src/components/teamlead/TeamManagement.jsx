import Card from '../common/Card';

const TeamManagement = () => {
  const teams = [
    { id: 1, name: 'Development Team A', members: 5, status: 'Active' },
    { id: 2, name: 'Development Team B', members: 4, status: 'Active' },
    { id: 3, name: 'QA Team', members: 3, status: 'Active' }
  ];

  return (
    <Card title="Team Management" subtitle="Manage your teams and assignments">
      <div className="space-y-2">
        {teams.map((team) => (
          <div
            key={team.id}
            className="flex items-center justify-between p-4 rounded-[var(--radius-md)] border border-[var(--color-border-light)] hover:border-[var(--color-border)] hover:bg-[var(--color-surface-alt)] transition-all duration-200 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-[var(--radius-md)] bg-violet-50 border border-violet-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[var(--color-text)]">{team.name}</h4>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                  {team.members} members
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {team.status}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TeamManagement;
