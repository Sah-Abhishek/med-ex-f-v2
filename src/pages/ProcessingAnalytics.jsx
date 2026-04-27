import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../layouts/DashboardLayout';
import { MEDX_API_URL } from '../utils/constants';

const formatMs = (ms) => {
  if (!ms && ms !== 0) return '--';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
};

const SlaLabel = ({ status }) => {
  const styles = {
    excellent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    good: 'bg-sky-50 text-sky-700 border-sky-200',
    acceptable: 'bg-amber-50 text-amber-700 border-amber-200',
    delayed: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${styles[status] || styles.delayed}`}>
      {status?.toUpperCase() || 'N/A'}
    </span>
  );
};

const StatCard = ({ label, value, sub, color = 'sky' }) => {
  const colors = {
    sky: 'from-sky-500 to-sky-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    red: 'from-red-500 to-red-600',
    violet: 'from-violet-500 to-violet-600',
    slate: 'from-slate-500 to-slate-600',
  };
  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-5">
      <p className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">{label}</p>
      <p className="text-2xl font-bold text-[var(--color-text)] tracking-tight">{value}</p>
      {sub && <p className="text-xs text-[var(--color-text-secondary)] mt-1">{sub}</p>}
      <div className={`h-1 w-12 mt-3 rounded-full bg-gradient-to-r ${colors[color]}`} />
    </div>
  );
};

const CHART_TIMINGS_PAGE_SIZE = 20;

const ProcessingAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('30');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchAnalytics();
  }, [period, page]);

  // When the user changes the period filter, jump back to page 1 so we don't
  // stay on a page that may no longer exist in the new window.
  const changePeriod = (newPeriod) => {
    setPage(1);
    setPeriod(newPeriod);
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const url = `${MEDX_API_URL}/charts/analytics/processing?period=${period}&page=${page}&pageSize=${CHART_TIMINGS_PAGE_SIZE}`;
      const res = await axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.data?.success) {
        setData(res.data.data);
      } else {
        setError('Failed to load analytics');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium">{error}</p>
          <button onClick={fetchAnalytics} className="mt-3 text-sm text-red-600 underline">Retry</button>
        </div>
      </DashboardLayout>
    );
  }

  const { overview, averages, slaDistribution, chartTimings, chartTimingsPagination, queueStats, dailyVolume } = data || {};
  const pagination = chartTimingsPagination || { page: 1, pageSize: CHART_TIMINGS_PAGE_SIZE, total: 0, totalPages: 1 };
  const firstRowOnPage = pagination.total > 0 ? (pagination.page - 1) * pagination.pageSize + 1 : 0;
  const lastRowOnPage = Math.min(pagination.page * pagination.pageSize, pagination.total);
  const totalSla = (slaDistribution?.excellent || 0) + (slaDistribution?.good || 0) + (slaDistribution?.acceptable || 0) + (slaDistribution?.delayed || 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text)] tracking-tight">Processing Analytics</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Document processing performance and timing</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={period}
              onChange={(e) => changePeriod(e.target.value)}
              className="text-sm border border-[var(--color-border)] rounded-lg px-3 py-2 bg-white text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="7">Last 7 days</option>
              <option value="14">Last 14 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            <button
              onClick={fetchAnalytics}
              className="text-sm px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white hover:bg-slate-50 text-[var(--color-text-secondary)] transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Total Charts" value={overview?.total_charts || 0} color="sky" />
          <StatCard label="Completed" value={overview?.completed || 0} color="emerald" />
          <StatCard label="Processing" value={overview?.processing || 0} color="violet" />
          <StatCard label="Queued" value={overview?.queued || 0} color="amber" />
          <StatCard label="Failed" value={overview?.failed || 0} color="red" />
          <StatCard label="Retry Pending" value={overview?.retry_pending || 0} color="slate" />
        </div>

        {/* Average Processing Times */}
        {averages && (
          <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-6">
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Average Processing Times</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">OCR / Text Extraction</p>
                <p className="text-xl font-bold text-sky-600">{formatMs(averages.avgOcrMs)}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">AI Analysis</p>
                <p className="text-xl font-bold text-violet-600">{formatMs(averages.avgAiMs)}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">Total Processing</p>
                <p className="text-xl font-bold text-emerald-600">{formatMs(averages.avgTotalMs)}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">Charts Analyzed</p>
                <p className="text-xl font-bold text-[var(--color-text)]">{averages.chartsAnalyzed}</p>
              </div>
            </div>

            {/* Visual bar breakdown */}
            {averages.avgTotalMs > 0 && (
              <div className="mt-5">
                <p className="text-xs text-[var(--color-text-tertiary)] mb-2">Time Breakdown</p>
                <div className="flex h-4 rounded-full overflow-hidden bg-slate-100">
                  <div
                    className="bg-sky-500 transition-all"
                    style={{ width: `${(averages.avgOcrMs / averages.avgTotalMs) * 100}%` }}
                    title={`OCR: ${formatMs(averages.avgOcrMs)}`}
                  />
                  <div
                    className="bg-violet-500 transition-all"
                    style={{ width: `${(averages.avgAiMs / averages.avgTotalMs) * 100}%` }}
                    title={`AI: ${formatMs(averages.avgAiMs)}`}
                  />
                  <div
                    className="bg-slate-300 transition-all"
                    style={{ width: `${((averages.avgTotalMs - averages.avgOcrMs - averages.avgAiMs) / averages.avgTotalMs) * 100}%` }}
                    title="Overhead"
                  />
                </div>
                <div className="flex gap-4 mt-2 text-[11px] text-[var(--color-text-secondary)]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-500" /> OCR</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500" /> AI</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300" /> Overhead</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SLA Distribution + Queue Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* SLA Distribution */}
          <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-6">
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">SLA Distribution</h3>
            {totalSla > 0 ? (
              <div className="space-y-3">
                {[
                  { label: 'Excellent', key: 'excellent', desc: '< 30s', color: 'bg-emerald-500' },
                  { label: 'Good', key: 'good', desc: '< 1m', color: 'bg-sky-500' },
                  { label: 'Acceptable', key: 'acceptable', desc: '< 2m', color: 'bg-amber-500' },
                  { label: 'Delayed', key: 'delayed', desc: '> 2m', color: 'bg-red-500' },
                ].map(({ label, key, desc, color }) => {
                  const val = slaDistribution?.[key] || 0;
                  const pct = totalSla > 0 ? (val / totalSla) * 100 : 0;
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--color-text-secondary)]">{label} <span className="text-[var(--color-text-tertiary)]">({desc})</span></span>
                        <span className="font-semibold text-[var(--color-text)]">{val} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-text-tertiary)]">No SLA data available yet</p>
            )}
          </div>

          {/* Queue Stats */}
          <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-6">
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Queue Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Jobs', value: queueStats?.total_jobs || 0 },
                { label: 'Completed', value: queueStats?.completed || 0 },
                { label: 'Pending', value: queueStats?.pending || 0 },
                { label: 'Processing', value: queueStats?.processing || 0 },
                { label: 'Failed', value: queueStats?.failed || 0 },
                { label: 'Avg Attempts', value: queueStats?.avg_attempts ? parseFloat(queueStats.avg_attempts).toFixed(1) : '1.0' },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wider">{label}</p>
                  <p className="text-lg font-bold text-[var(--color-text)] mt-1">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Volume */}
        {dailyVolume && dailyVolume.length > 0 && (
          <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-6">
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Daily Volume</h3>
            <div className="overflow-x-auto">
              <div className="flex gap-1 items-end h-32 min-w-[400px]">
                {[...dailyVolume].reverse().map((day) => {
                  const maxVal = Math.max(...dailyVolume.map(d => parseInt(d.total)), 1);
                  const height = (parseInt(day.total) / maxVal) * 100;
                  const failedHeight = (parseInt(day.failed) / maxVal) * 100;
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="w-full flex flex-col justify-end" style={{ height: '100px' }}>
                        {parseInt(day.failed) > 0 && (
                          <div className="w-full bg-red-400 rounded-t-sm" style={{ height: `${failedHeight}%`, minHeight: '2px' }} />
                        )}
                        <div
                          className="w-full bg-sky-500 rounded-t-sm group-hover:bg-sky-600 transition"
                          style={{ height: `${height - failedHeight}%`, minHeight: parseInt(day.total) > 0 ? '2px' : '0' }}
                        />
                      </div>
                      <span className="text-[9px] text-[var(--color-text-tertiary)] -rotate-45 origin-top-left whitespace-nowrap">
                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      {/* Tooltip */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-10">
                        {day.total} total, {day.completed} done, {day.failed} failed
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Per-Chart Processing Table */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[var(--color-border)]">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Per-Chart Processing Details</h3>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
              {pagination.total} chart{pagination.total === 1 ? '' : 's'} with timing data
              {pagination.total > 0 && <> — showing {firstRowOnPage}–{lastRowOnPage}</>}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-[var(--color-border)]">
                  <th className="text-left text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider px-4 py-3">Chart</th>
                  <th className="text-left text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider px-4 py-3">Facility</th>
                  <th className="text-center text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider px-4 py-3">Docs</th>
                  <th className="text-right text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider px-4 py-3">OCR</th>
                  <th className="text-right text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider px-4 py-3">AI</th>
                  <th className="text-right text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider px-4 py-3">Total</th>
                  <th className="text-center text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider px-4 py-3">SLA</th>
                  <th className="text-right text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {chartTimings && chartTimings.length > 0 ? (
                  chartTimings.map((chart) => (
                    <tr key={chart.id} className="border-b border-[var(--color-border)] hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3 font-medium text-[var(--color-text)]">{chart.chartNumber || chart.sessionId || `#${chart.id}`}</td>
                      <td className="px-4 py-3 text-[var(--color-text-secondary)]">{chart.facility || '--'}</td>
                      <td className="px-4 py-3 text-center text-[var(--color-text-secondary)]">{chart.documentCount || '--'}</td>
                      <td className="px-4 py-3 text-right font-mono text-sky-600">{formatMs(chart.ocrMs)}</td>
                      <td className="px-4 py-3 text-right font-mono text-violet-600">{formatMs(chart.aiMs)}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-[var(--color-text)]">{formatMs(chart.totalMs)}</td>
                      <td className="px-4 py-3 text-center"><SlaLabel status={chart.slaStatus} /></td>
                      <td className="px-4 py-3 text-right text-xs text-[var(--color-text-tertiary)]">
                        {chart.createdAt ? new Date(chart.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '--'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-[var(--color-text-tertiary)]">
                      No processing data available yet. Charts will appear here once they complete processing.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--color-border)] bg-slate-50/50">
              <p className="text-xs text-[var(--color-text-tertiary)]">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1 || loading}
                  className="text-xs font-medium px-3 py-1.5 rounded-md border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page >= pagination.totalPages || loading}
                  className="text-xs font-medium px-3 py-1.5 rounded-md border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProcessingAnalytics;
