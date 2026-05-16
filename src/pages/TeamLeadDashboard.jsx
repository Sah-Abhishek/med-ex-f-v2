import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../layouts/DashboardLayout';
import UserManagement from '../components/admin/UserManagement';
import ReasonOptionsSettings from '../components/teamlead/ReasonOptionsSettings';
import { MEDX_API_URL } from '../utils/constants';

const formatMs = (ms) => {
  if (!ms && ms !== 0) return '--';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
};

const StatCard = ({ label, value, sub, color = 'sky' }) => {
  const colors = {
    sky: 'from-sky-500 to-sky-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600',
    red: 'from-red-500 to-red-600',
    violet: 'from-violet-500 to-violet-600',
    slate: 'from-slate-500 to-slate-600',
    cyan: 'from-cyan-500 to-cyan-600',
    indigo: 'from-indigo-500 to-indigo-600',
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

const AlertBadge = ({ alert }) => {
  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    info: 'bg-sky-50 border-sky-200 text-sky-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    error: 'bg-red-50 border-red-200 text-red-700',
  };
  const icons = {
    success: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
  };
  return (
    <div className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border ${styles[alert.type]}`}>
      {icons[alert.type]}
      <div>
        <span className="text-sm font-semibold">{alert.title}</span>
        <span className="text-sm ml-1.5 opacity-80">{alert.message}</span>
      </div>
    </div>
  );
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

const PROCESSING_PAGE_SIZE = 15;

const TeamLeadDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [processingData, setProcessingData] = useState(null);
  const [teamLeadData, setTeamLeadData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingLoading, setProcessingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('30');
  const [specialty, setSpecialty] = useState('all');
  const [specialties, setSpecialties] = useState([]);
  const [client, setClient] = useState('all');
  const [clients, setClients] = useState([]);
  const [processingPage, setProcessingPage] = useState(1);

  // Period / specialty / client change → fetch dashboard + team-lead aggregates
  // (neither is paginated). The paginated processing call has its own effect.
  useEffect(() => {
    fetchAggregates();
  }, [period, specialty, client]);

  // Processing table is backend-paginated: refetch only the page we need
  // whenever period, specialty, client, or page changes.
  useEffect(() => {
    fetchProcessingPage(processingPage);
  }, [period, specialty, client, processingPage]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const changePeriod = (newPeriod) => {
    // Jump back to page 1 so the effect above fetches the first page of the new window
    // in a single request, instead of briefly querying an out-of-range page.
    setProcessingPage(1);
    setPeriod(newPeriod);
  };

  const changeSpecialty = (newSpecialty) => {
    setProcessingPage(1);
    setSpecialty(newSpecialty);
  };

  const changeClient = (newClient) => {
    setProcessingPage(1);
    setClient(newClient);
  };

  const fetchFilterOptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [sp, cl] = await Promise.all([
        axios.get(`${MEDX_API_URL}/charts/filters/specialties`, { headers }),
        axios.get(`${MEDX_API_URL}/charts/filters/clients`, { headers }),
      ]);
      if (sp.data?.success) setSpecialties(sp.data.specialties || []);
      if (cl.data?.success) setClients(cl.data.clients || []);
    } catch {
      // Non-fatal — dropdowns fall back to "All".
    }
  };

  const specialtyParam = specialty && specialty !== 'all' ? specialty : null;
  const clientParam = client && client !== 'all' ? client : null;

  const fetchAggregates = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Match the team-lead endpoint's date window to the selected period so
      // the per-category card stays in sync with the rest of the overview tab.
      const startDate = new Date(Date.now() - parseInt(period, 10) * 86400 * 1000).toISOString();

      const dashParams = new URLSearchParams({ period });
      const tlParams = new URLSearchParams({ startDate });
      if (specialtyParam) {
        dashParams.set('specialty', specialtyParam);
        tlParams.set('specialty', specialtyParam);
      }
      if (clientParam) {
        dashParams.set('client', clientParam);
        tlParams.set('client', clientParam);
      }

      const [dashRes, tlRes] = await Promise.all([
        axios.get(`${MEDX_API_URL}/charts/analytics/dashboard?${dashParams.toString()}`, { headers }),
        axios.get(`${MEDX_API_URL}/charts/analytics/team-lead?${tlParams.toString()}`, { headers }),
      ]);

      if (dashRes.data?.success) setDashboardData(dashRes.data.analytics);
      if (tlRes.data?.success) setTeamLeadData(tlRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProcessingPage = async (page) => {
    setProcessingLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const params = new URLSearchParams({
        period,
        page: String(page),
        pageSize: String(PROCESSING_PAGE_SIZE),
      });
      if (specialtyParam) params.set('specialty', specialtyParam);
      if (clientParam) params.set('client', clientParam);
      const url = `${MEDX_API_URL}/charts/analytics/processing?${params.toString()}`;
      const res = await axios.get(url, { headers });
      if (res.data?.success) setProcessingData(res.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingLoading(false);
    }
  };

  // Keep a single "Refresh" button working by re-running both fetches.
  const fetchData = () => {
    fetchAggregates();
    fetchProcessingPage(processingPage);
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'processing', label: 'Processing' },
    { id: 'users', label: 'User Management' },
    { id: 'settings', label: 'Settings' },
  ];

  const summary = dashboardData?.summary;
  const performance = dashboardData?.performance;
  const proc = processingData;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text)] tracking-tight">Team Lead Dashboard</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">Team analytics, processing insights, and user management</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={client}
              onChange={(e) => changeClient(e.target.value)}
              className="text-sm border border-[var(--color-border)] rounded-lg px-3 py-2 bg-white text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="all">All Clients</option>
              {clients.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={specialty}
              onChange={(e) => changeSpecialty(e.target.value)}
              className="text-sm border border-[var(--color-border)] rounded-lg px-3 py-2 bg-white text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="all">All Specialties</option>
              {specialties.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
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
              onClick={fetchData}
              className="text-sm px-3 py-2 rounded-lg border border-[var(--color-border)] bg-white hover:bg-slate-50 text-[var(--color-text-secondary)] transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 text-sm font-medium px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-[var(--color-text)] shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={fetchData} className="mt-3 text-sm text-red-600 underline">Retry</button>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {dashboardData?.alerts && dashboardData.alerts.length > 0 && (
                  <div className="space-y-2">
                    {dashboardData.alerts.map((alert, i) => (
                      <AlertBadge key={i} alert={alert} />
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  <StatCard label="Charts Processed" value={summary?.chartsProcessed || 0} sub={`${period} day period`} color="sky" />
                  <StatCard label="Total Submitted" value={summary?.totalSubmitted || 0} color="emerald" />
                  <StatCard label="AI Accuracy" value={`${summary?.aiAccuracy || 0}%`} sub="Code-level" color="violet" />
                  <StatCard label="Correction Rate" value={`${summary?.correctionRate || 0}%`} color="amber" />
                </div>

                <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">AI Code Breakdown</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {[
                      { label: 'Total AI Codes', value: summary?.totalAICodes || 0, color: 'text-[var(--color-text)]' },
                      { label: 'Unchanged', value: summary?.unchangedCodes || 0, color: 'text-emerald-600' },
                      { label: 'Modified', value: summary?.modifiedCodes || 0, color: 'text-amber-600' },
                      { label: 'Rejected', value: summary?.rejectedCodes || 0, color: 'text-red-600' },
                      { label: 'Added by User', value: summary?.addedCodes || 0, color: 'text-sky-600' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wider">{label}</p>
                        <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {summary?.totalAICodes > 0 && (
                    <div className="mt-5">
                      <p className="text-xs text-[var(--color-text-tertiary)] mb-2">Code Disposition</p>
                      <div className="flex h-4 rounded-full overflow-hidden bg-slate-100">
                        <div className="bg-emerald-500 transition-all" style={{ width: `${(summary.unchangedCodes / summary.totalAICodes) * 100}%` }} title={`Unchanged: ${summary.unchangedCodes}`} />
                        <div className="bg-amber-500 transition-all" style={{ width: `${(summary.modifiedCodes / summary.totalAICodes) * 100}%` }} title={`Modified: ${summary.modifiedCodes}`} />
                        <div className="bg-red-500 transition-all" style={{ width: `${(summary.rejectedCodes / summary.totalAICodes) * 100}%` }} title={`Rejected: ${summary.rejectedCodes}`} />
                      </div>
                      <div className="flex gap-4 mt-2 text-[11px] text-[var(--color-text-secondary)]">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Unchanged</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Modified</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Rejected</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Corrections by Category — powered by /api/charts/analytics/team-lead */}
                <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--color-text)]">Corrections by Category</h3>
                      <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                        {teamLeadData?.summary?.totalActions || 0} total actions across {teamLeadData?.summary?.totalCharts || 0} submitted charts
                      </p>
                    </div>
                    {teamLeadData?.summary && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold whitespace-nowrap">
                          {(100 - teamLeadData.summary.correctionRate).toFixed(1)}% accuracy
                        </span>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold whitespace-nowrap">
                          {teamLeadData.summary.correctionRate}% corrected
                        </span>
                      </div>
                    )}
                  </div>

                  {teamLeadData?.byCategory && teamLeadData.summary?.totalActions > 0 ? (
                    <div className="space-y-4">
                      {[
                        { key: 'primary',   label: 'Primary Diagnosis',    color: 'bg-blue-500',   bar: 'bg-blue-100'   },
                        { key: 'secondary', label: 'Secondary Diagnoses',  color: 'bg-indigo-500', bar: 'bg-indigo-100' },
                        { key: 'cpt',       label: 'CPT / Procedures',     color: 'bg-violet-500', bar: 'bg-violet-100' },
                      ].map(({ key, label, color, bar }) => {
                        const c = teamLeadData.byCategory[key] || { total: 0, accepted: 0, edited: 0, deleted: 0, added: 0, correctionCount: 0, correctionRate: 0 };
                        const rateWidth = Math.min(100, c.correctionRate);
                        const accuracy = c.total > 0 ? +(100 - c.correctionRate).toFixed(1) : 0;
                        return (
                          <div key={key}>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-[var(--color-text)]">{label}</span>
                                {c.total > 0 && (
                                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">
                                    {accuracy}% accuracy
                                  </span>
                                )}
                              </div>
                              <span className="text-[var(--color-text-secondary)]">
                                <span className="font-semibold text-[var(--color-text)]">{c.correctionCount}</span> / {c.total} corrected
                                <span className="ml-2 text-[var(--color-text-tertiary)]">({c.correctionRate}%)</span>
                              </span>
                            </div>
                            <div className={`h-2 rounded-full ${bar} overflow-hidden`}>
                              <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${rateWidth}%` }} />
                            </div>
                            <div className="flex gap-3 mt-1.5 text-[11px] text-[var(--color-text-tertiary)]">
                              <span>Accepted: <span className="text-emerald-600 font-semibold">{c.accepted}</span></span>
                              <span>Edited: <span className="text-amber-600 font-semibold">{c.edited}</span></span>
                              <span>Deleted: <span className="text-red-600 font-semibold">{c.deleted}</span></span>
                              <span>Added: <span className="text-sky-600 font-semibold">{c.added}</span></span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--color-text-tertiary)]">No correction data for this period yet</p>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Performance Metrics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Avg Processing', value: `${performance?.avgProcessingTime || 0} min` },
                        { label: 'Avg Review', value: `${performance?.avgReviewTime || 0} min` },
                        { label: 'Total Cycle', value: `${performance?.totalCycleTime || 0} min` },
                        { label: 'Charts/Day', value: performance?.chartsPerDay || 0 },
                        { label: 'Queue Backlog', value: performance?.queueBacklog || 0 },
                        { label: 'SLA Compliance', value: `${performance?.slaCompliance || 0}%` },
                      ].map(({ label, value }) => (
                        <div key={label} className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wider">{label}</p>
                          <p className="text-lg font-bold text-[var(--color-text)] mt-1">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Top Correction Reasons</h3>
                    {dashboardData?.correctionReasons?.length > 0 ? (
                      <div className="space-y-3">
                        {dashboardData.correctionReasons.map((r, i) => (
                          <div key={i}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-[var(--color-text-secondary)] truncate mr-2">{r.reason}</span>
                              <span className="font-semibold text-[var(--color-text)] whitespace-nowrap">{r.count} ({r.percentage}%)</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${r.percentage}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--color-text-tertiary)]">No correction data yet</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Volume by Facility</h3>
                    {dashboardData?.volumeByFacility?.length > 0 ? (
                      <div className="space-y-3">
                        {dashboardData.volumeByFacility.map((f, i) => {
                          const maxCount = dashboardData.volumeByFacility[0]?.count || 1;
                          return (
                            <div key={i}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-[var(--color-text-secondary)] truncate mr-2">{f.facility}</span>
                                <span className="font-semibold text-[var(--color-text)]">{f.count}</span>
                              </div>
                              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${(f.count / maxCount) * 100}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--color-text-tertiary)]">No facility data yet</p>
                    )}
                  </div>

                  <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Accuracy by Specialty</h3>
                    {dashboardData?.specialtyAccuracy?.length > 0 ? (
                      <div className="space-y-3">
                        {dashboardData.specialtyAccuracy.map((s, i) => (
                          <div key={i}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-[var(--color-text-secondary)] truncate mr-2">{s.specialty || s.week}</span>
                              <span className="font-semibold text-[var(--color-text)]">{s.accuracy}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${s.accuracy}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--color-text-tertiary)]">No specialty data yet</p>
                    )}
                  </div>
                </div>

                {dashboardData?.trends?.acceptanceRate?.length > 0 && (
                  <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Weekly Trends</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[var(--color-border)]">
                            <th className="text-left text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider px-4 py-2">Week</th>
                            <th className="text-right text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider px-4 py-2">Charts</th>
                            <th className="text-right text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider px-4 py-2">Codes</th>
                            <th className="text-right text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider px-4 py-2">Unchanged</th>
                            <th className="text-right text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider px-4 py-2">Accuracy</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.trends.acceptanceRate.map((t, i) => (
                            <tr key={i} className="border-b border-[var(--color-border)] hover:bg-slate-50/50">
                              <td className="px-4 py-2.5 font-medium text-[var(--color-text)]">{t.week}</td>
                              <td className="px-4 py-2.5 text-right text-[var(--color-text-secondary)]">{t.total}</td>
                              <td className="px-4 py-2.5 text-right text-[var(--color-text-secondary)]">{t.totalCodes}</td>
                              <td className="px-4 py-2.5 text-right text-emerald-600 font-medium">{t.unchangedCodes}</td>
                              <td className="px-4 py-2.5 text-right font-semibold text-[var(--color-text)]">{t.accuracy}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Processing Tab */}
            {activeTab === 'processing' && proc && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  <StatCard label="Total Charts" value={proc.overview?.total_charts || 0} color="sky" />
                  <StatCard label="Completed" value={proc.overview?.completed || 0} color="emerald" />
                  <StatCard label="Processing" value={proc.overview?.processing || 0} color="violet" />
                  <StatCard label="Queued" value={proc.overview?.queued || 0} color="amber" />
                  <StatCard label="Failed" value={proc.overview?.failed || 0} color="red" />
                  <StatCard label="Retry Pending" value={proc.overview?.retry_pending || 0} color="slate" />
                </div>

                {proc.averages && (
                  <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Average Processing Times</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                      <div>
                        <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">OCR / Text Extraction</p>
                        <p className="text-xl font-bold text-sky-600">{formatMs(proc.averages.avgOcrMs)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">AI Analysis</p>
                        <p className="text-xl font-bold text-violet-600">{formatMs(proc.averages.avgAiMs)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">Total Processing</p>
                        <p className="text-xl font-bold text-emerald-600">{formatMs(proc.averages.avgTotalMs)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">Charts Analyzed</p>
                        <p className="text-xl font-bold text-[var(--color-text)]">{proc.averages.chartsAnalyzed}</p>
                      </div>
                    </div>

                    {proc.averages.avgTotalMs > 0 && (
                      <div className="mt-5">
                        <p className="text-xs text-[var(--color-text-tertiary)] mb-2">Time Breakdown</p>
                        <div className="flex h-4 rounded-full overflow-hidden bg-slate-100">
                          <div className="bg-sky-500 transition-all" style={{ width: `${(proc.averages.avgOcrMs / proc.averages.avgTotalMs) * 100}%` }} title={`OCR: ${formatMs(proc.averages.avgOcrMs)}`} />
                          <div className="bg-violet-500 transition-all" style={{ width: `${(proc.averages.avgAiMs / proc.averages.avgTotalMs) * 100}%` }} title={`AI: ${formatMs(proc.averages.avgAiMs)}`} />
                          <div className="bg-slate-300 transition-all" style={{ width: `${((proc.averages.avgTotalMs - proc.averages.avgOcrMs - proc.averages.avgAiMs) / proc.averages.avgTotalMs) * 100}%` }} title="Overhead" />
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">SLA Distribution</h3>
                    {(() => {
                      const sla = proc.slaDistribution;
                      const totalSla = (sla?.excellent || 0) + (sla?.good || 0) + (sla?.acceptable || 0) + (sla?.delayed || 0);
                      if (totalSla === 0) return <p className="text-sm text-[var(--color-text-tertiary)]">No SLA data available yet</p>;
                      return (
                        <div className="space-y-3">
                          {[
                            { label: 'Excellent', key: 'excellent', desc: '< 30s', color: 'bg-emerald-500' },
                            { label: 'Good', key: 'good', desc: '< 1m', color: 'bg-sky-500' },
                            { label: 'Acceptable', key: 'acceptable', desc: '< 2m', color: 'bg-amber-500' },
                            { label: 'Delayed', key: 'delayed', desc: '> 2m', color: 'bg-red-500' },
                          ].map(({ label, key, desc, color }) => {
                            const val = sla?.[key] || 0;
                            const pct = (val / totalSla) * 100;
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
                      );
                    })()}
                  </div>

                  <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Queue Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Total Jobs', value: proc.queueStats?.total_jobs || 0 },
                        { label: 'Completed', value: proc.queueStats?.completed || 0 },
                        { label: 'Pending', value: proc.queueStats?.pending || 0 },
                        { label: 'Processing', value: proc.queueStats?.processing || 0 },
                        { label: 'Failed', value: proc.queueStats?.failed || 0 },
                        { label: 'Avg Attempts', value: proc.queueStats?.avg_attempts ? parseFloat(proc.queueStats.avg_attempts).toFixed(1) : '1.0' },
                      ].map(({ label, value }) => (
                        <div key={label} className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-[11px] text-[var(--color-text-tertiary)] uppercase tracking-wider">{label}</p>
                          <p className="text-lg font-bold text-[var(--color-text)] mt-1">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {proc.dailyVolume && proc.dailyVolume.length > 0 && (
                  <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Daily Volume</h3>
                    <div className="overflow-x-auto">
                      <div className="flex gap-1 items-end h-32 min-w-[400px]">
                        {[...proc.dailyVolume].reverse().map((day) => {
                          const maxVal = Math.max(...proc.dailyVolume.map(d => parseInt(d.total)), 1);
                          const height = (parseInt(day.total) / maxVal) * 100;
                          const failedHeight = (parseInt(day.failed) / maxVal) * 100;
                          return (
                            <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                              <div className="w-full flex flex-col justify-end" style={{ height: '100px' }}>
                                {parseInt(day.failed) > 0 && (
                                  <div className="w-full bg-red-400 rounded-t-sm" style={{ height: `${failedHeight}%`, minHeight: '2px' }} />
                                )}
                                <div className="w-full bg-sky-500 rounded-t-sm group-hover:bg-sky-600 transition" style={{ height: `${height - failedHeight}%`, minHeight: parseInt(day.total) > 0 ? '2px' : '0' }} />
                              </div>
                              <span className="text-[9px] text-[var(--color-text-tertiary)] -rotate-45 origin-top-left whitespace-nowrap">
                                {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
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

                {(() => {
                  const pageRows = proc.chartTimings || [];
                  const pagination = proc.chartTimingsPagination || { page: 1, pageSize: PROCESSING_PAGE_SIZE, total: 0, totalPages: 1 };
                  const firstRow = pagination.total > 0 ? (pagination.page - 1) * pagination.pageSize + 1 : 0;
                  const lastRow = Math.min(pagination.page * pagination.pageSize, pagination.total);

                  return (
                    <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-[var(--color-border)]">
                        <h3 className="text-sm font-semibold text-[var(--color-text)]">Per-Chart Processing Details</h3>
                        <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                          {pagination.total} chart{pagination.total === 1 ? '' : 's'} with timing data
                          {pagination.total > 0 && <> — showing {firstRow}–{lastRow}</>}
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
                            {pageRows.length > 0 ? (
                              pageRows.map((chart) => (
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
                                  No processing data available yet.
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
                              onClick={() => setProcessingPage((p) => Math.max(1, p - 1))}
                              disabled={pagination.page <= 1 || processingLoading}
                              className="text-xs font-medium px-3 py-1.5 rounded-md border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                              Previous
                            </button>
                            <button
                              type="button"
                              onClick={() => setProcessingPage((p) => Math.min(pagination.totalPages, p + 1))}
                              disabled={pagination.page >= pagination.totalPages || processingLoading}
                              className="text-xs font-medium px-3 py-1.5 rounded-md border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {activeTab === 'users' && <UserManagement />}

            {activeTab === 'settings' && <ReasonOptionsSettings />}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeamLeadDashboard;
