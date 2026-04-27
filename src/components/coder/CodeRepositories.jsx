import Card from '../common/Card';
import Button from '../common/Button';

const CodeRepositories = () => {
  const repositories = [
    { id: 1, name: 'medical-exam-frontend', language: 'JavaScript', lastCommit: '2 hours ago' },
    { id: 2, name: 'medical-exam-backend', language: 'Node.js', lastCommit: '5 hours ago' },
    { id: 3, name: 'medical-exam-api', language: 'Python', lastCommit: '1 day ago' }
  ];

  const langColors = {
    JavaScript: 'bg-amber-400',
    'Node.js': 'bg-emerald-500',
    Python: 'bg-sky-500',
  };

  return (
    <Card title="Code Repositories" subtitle="Access your development repositories">
      <div className="space-y-2">
        {repositories.map((repo) => (
          <div
            key={repo.id}
            className="flex items-center justify-between p-4 rounded-[var(--radius-md)] border border-[var(--color-border-light)] hover:border-[var(--color-border)] hover:bg-[var(--color-surface-alt)] transition-all duration-200 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-[var(--radius-md)] bg-slate-50 border border-slate-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[var(--color-text)]">{repo.name}</h4>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
                    <span className={`w-2 h-2 rounded-full ${langColors[repo.language] || 'bg-slate-400'}`} />
                    {repo.language}
                  </span>
                  <span className="text-[var(--color-text-tertiary)]">&middot;</span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">{repo.lastCommit}</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Open
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default CodeRepositories;
