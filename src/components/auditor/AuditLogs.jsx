import Card from '../common/Card';

const AuditLogs = () => {
  const logs = [
    { id: 1, action: 'User Login', user: 'admin', timestamp: '2024-02-13 10:30:00', status: 'Success' },
    { id: 2, action: 'User Created', user: 'admin', timestamp: '2024-02-13 09:15:00', status: 'Success' },
    { id: 3, action: 'Failed Login Attempt', user: 'unknown', timestamp: '2024-02-13 08:45:00', status: 'Failed' },
    { id: 4, action: 'User Updated', user: 'admin', timestamp: '2024-02-13 07:30:00', status: 'Success' }
  ];

  return (
    <Card title="Audit Logs" subtitle="View system audit trail and security logs">
      <div className="overflow-x-auto -mx-6">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="px-6 pb-3 text-left text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Timestamp</th>
              <th className="px-6 pb-3 text-left text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Action</th>
              <th className="px-6 pb-3 text-left text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">User</th>
              <th className="px-6 pb-3 text-left text-[11px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="table-row-hover border-b border-[var(--color-border-light)] last:border-0">
                <td className="px-6 py-3.5">
                  <span className="text-xs font-mono text-[var(--color-text-tertiary)]">{log.timestamp}</span>
                </td>
                <td className="px-6 py-3.5">
                  <span className="text-sm text-[var(--color-text)]">{log.action}</span>
                </td>
                <td className="px-6 py-3.5">
                  <span className="text-sm text-[var(--color-text-secondary)]">{log.user}</span>
                </td>
                <td className="px-6 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                      log.status === 'Success'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-red-50 text-red-700 border-red-100'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        log.status === 'Success' ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                    />
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default AuditLogs;
