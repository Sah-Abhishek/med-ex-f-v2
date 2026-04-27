import { useState, useEffect, useRef, useCallback, useMemo, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ListChecks, ClipboardCheck, MessageSquareWarning, CheckCircle2, AlertCircle, SlidersHorizontal, Filter, ArrowRightLeft } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';

/* ── Styled Dropdown ──────────────────────────────────────────────── */
const Dropdown = ({ label, displayText, open, setOpen, children, dropdownRef }) => (
  <div ref={dropdownRef} style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 6 }}>
    <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b", whiteSpace: "nowrap" }}>{label}</span>
    <button
      onClick={() => setOpen(o => !o)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 12px", minWidth: 120,
        background: "#fff", border: "1px solid #e2e8f0", borderRadius: 6,
        fontSize: 13, color: "#334155", cursor: "pointer",
        boxShadow: open ? "0 0 0 2px rgba(59,130,246,0.15)" : "none",
        transition: "box-shadow 0.15s",
      }}
    >
      <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {displayText}
      </span>
      <ChevronDown size={14} style={{ color: "#94a3b8", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
    </button>
    {open && (
      <div style={{
        position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 50,
        minWidth: 220, maxHeight: 320, overflowY: "auto",
        background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      }}>
        {children}
      </div>
    )}
  </div>
);

const DropdownItem = ({ selected, onClick, children, indent = false, isHeader = false }) => {
  if (isHeader) {
    return (
      <div style={{
        padding: "8px 14px 4px", fontSize: 11, fontWeight: 700,
        color: "#3b82f6", textTransform: "uppercase", letterSpacing: 0.5,
        borderTop: "1px solid #f1f5f9", marginTop: 2,
      }}>
        {children}
      </div>
    );
  }
  return (
    <div
      onClick={onClick}
      style={{
        padding: "7px 14px", paddingLeft: indent ? 28 : 14,
        fontSize: 13, color: selected ? "#3b82f6" : "#334155",
        fontWeight: selected ? 600 : 400,
        background: selected ? "#eff6ff" : "transparent",
        cursor: "pointer", transition: "background 0.1s",
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = "#f8fafc"; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = "transparent"; }}
    >
      {children}
    </div>
  );
};

/* ── Section Header (dotted) ─────────────────────────────────────── */
const SectionHeader = ({ children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#94a3b8", flexShrink: 0 }} />
    <span style={{ fontSize: 13, fontWeight: 700, color: "#475569", letterSpacing: 0.3 }}>{children}</span>
    <span style={{ flex: 1, height: 1, borderBottom: "2px dotted #cbd5e1" }} />
  </div>
);

/* ── Current Chart Card ──────────────────────────────────────────── */
const CurrentChartCard = ({ chartStats, onClick }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!chartStats?.timer) { setElapsed(0); return; }
    const serverStart = new Date(chartStats.timer).getTime();
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - serverStart) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [chartStats?.timer]);

  const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const secs = String(elapsed % 60).padStart(2, "0");

  if (!chartStats?.chartId) {
    return (
      <div style={{
        background: "linear-gradient(135deg, #e0e7ff, #f0f4ff)",
        borderRadius: 14, padding: "28px 24px", textAlign: "center",
        color: "#94a3b8", fontSize: 13, fontWeight: 500, minHeight: 130,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        No chart currently in progress
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      style={{
        background: "linear-gradient(135deg, #38bdf8, #06b6d4, #0891b2)",
        borderRadius: 14, padding: "28px 24px", cursor: "pointer",
        textAlign: "center", color: "#fff", minHeight: 130,
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 6,
        transition: "transform 0.15s, box-shadow 0.15s",
        boxShadow: "0 4px 16px rgba(6, 182, 212, 0.3)",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(6, 182, 212, 0.4)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(6, 182, 212, 0.3)"; }}
    >
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 0.5 }}>{chartStats.chart_no}</div>
      <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.85 }}>{chartStats.milestone}</div>
      <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: 3, marginTop: 4 }}>{mins} : {secs}</div>
      <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.7, marginTop: 4 }}>Tap to view</div>
    </div>
  );
};

/* ── Milestone Card ──────────────────────────────────────────────── */
const MilestoneCard = ({ icon: Icon, value, label, subtitle, bg, accent, iconBg }) => (
  <div style={{
    background: bg, borderRadius: 12, padding: "18px 20px",
    minHeight: 130, display: "flex", flexDirection: "column",
    justifyContent: "space-between", position: "relative",
    border: "1px solid rgba(0,0,0,0.04)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: 8,
      background: iconBg || "rgba(0,0,0,0.06)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Icon size={18} style={{ color: accent }} />
    </div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: accent, marginTop: 4 }}>{label}</div>
    </div>
    <div style={{ position: "absolute", bottom: 12, right: 16, fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{subtitle}</div>
  </div>
);

/* ── Status Card ─────────────────────────────────────────────────── */
const StatusCard = ({ value, label, accent, icon: Icon }) => (
  <div style={{
    background: "#fff", borderRadius: 12, padding: "18px 20px",
    minHeight: 130, display: "flex", alignItems: "center",
    justifyContent: "space-between", position: "relative",
    border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
      <span style={{ fontSize: 32, fontWeight: 700, color: accent, lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 15, fontWeight: 700, color: accent }}>{label}</span>
    </div>
    <div style={{
      width: 72, height: 72, borderRadius: 16,
      background: accent === "#10b981" ? "#ecfdf5" : "#fef2f2",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <Icon size={32} style={{ color: accent, opacity: 0.7 }} />
    </div>
    <div style={{ position: "absolute", bottom: 12, right: 16, fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>Today's Count</div>
  </div>
);

/* ── Avatar + User Cell ──────────────────────────────────────────── */
const Avatar = ({ src, name, size = 28 }) => {
  const [err, setErr] = useState(false);
  if (!src || err) {
    const initials = (name || "").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: "linear-gradient(135deg, #f5a623, #f7c948)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
      }}>{initials}</div>
    );
  }
  return (
    <img src={src} alt={name || ""} onError={() => setErr(true)}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
  );
};

const UserCell = ({ imageUrl, firstName, lastName }) => {
  if (!firstName) return <span style={{ color: "#ccc" }}>—</span>;
  const name = `${firstName} ${lastName || ""}`.trim();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Avatar src={imageUrl} name={name} />
      <span style={{ fontSize: 12.5, fontWeight: 500, color: "#3a3f48", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 100 }}>
        {name}
      </span>
    </div>
  );
};

/* ── Badge Components ────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const isComplete = status === "Complete";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: isComplete ? "#e8f8ef" : "#fff8e1",
      color: isComplete ? "#1b9e4b" : "#e6a817",
      border: `1px solid ${isComplete ? "#b7ebc9" : "#ffe082"}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: isComplete ? "#1b9e4b" : "#e6a817" }} />
      {status}
    </span>
  );
};

const MilestoneBadge = ({ milestone }) => {
  const isDone = milestone?.includes("Done");
  return (
    <span style={{
      display: "inline-block", padding: "3px 12px", borderRadius: 20,
      fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
      background: isDone ? "#e8f8ef" : "#e3f2fd",
      color: isDone ? "#1b9e4b" : "#1565c0",
      border: `1px solid ${isDone ? "#b7ebc9" : "#90caf9"}`,
    }}>{milestone}</span>
  );
};

/* ── Table Config ────────────────────────────────────────────────── */
const COLUMNS = [
  { key: "SNo", label: "S. NO.", width: 60, alwaysVisible: true },
  { key: "Worklist", label: "WORKLIST #", width: 100 },
  { key: "Client", label: "CLIENT", width: 80 },
  { key: "Location", label: "LOCATION", width: 160 },
  { key: "Specialty", label: "SPECIALTY", width: 120 },
  { key: "chart_no", label: "CHART #", width: 100 },
  { key: "DateOfService", label: "DATE OF SERVICE", width: 115 },
  { key: "ReceivedDate", label: "RECEIVED DATE", width: 115 },
  { key: "OriginalCoder", label: "ORIGINAL CODER", width: 150 },
  { key: "FollowUpCoder", label: "FOLLOW UP CODER", width: 150 },
  { key: "OriginalAuditor", label: "ORIGINAL AUDITOR", width: 150 },
  { key: "AllocatedUser", label: "ALLOCATED USER", width: 150 },
  { key: "Status", label: "CHART STATUS", width: 110 },
  { key: "Milestone", label: "MILESTONE", width: 140 },
  { key: "qc_status", label: "QC STATUS", width: 90 },
  { key: "Process", label: "PROCESS", width: 90 },
];

const SORT_MAP = {
  SNo: "SNo",
  Worklist: "Worklist",
  Client: "Client",
  Location: "Location",
  Specialty: "Specialty",
  chart_no: "chart_no",
  DateOfService: "DateOfService",
  ReceivedDate: "ReceivedDate",
  Status: "Status",
  Milestone: "MilestoneId",
  Process: "Process",
  qc_status: "qc_status",
};

const PRIORITY_TABS = ["Critical", "High", "Medium", "Low", "Done"];

/* ── localStorage helpers ─────────────────────────────────────────── */
const LS_PREFIX = 'auditorDash_';
const lsGet = (key, fallback) => {
  try { const v = localStorage.getItem(LS_PREFIX + key); return v !== null ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};
const lsSet = (key, value) => { try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(value)); } catch {} };

/* ── Main Component ──────────────────────────────────────────────── */
const AuditorDashboard = () => {
  const navigate = useNavigate();

  // Master data + filters
  const [masterData, setMasterData] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [selectedClient, setSelectedClient] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState(0);
  const [clientOpen, setClientOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const clientRef = useRef(null);
  const locationRef = useRef(null);

  // Charts table state — persisted to localStorage
  const [charts, setCharts] = useState([]);
  const [counts, setCounts] = useState({ Critical: 0, High: 0, Medium: 0, Low: 0, done: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => lsGet('activeTab', 'Critical'));
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => lsGet('pageSize', 10));
  const [sortCol, setSortCol] = useState("MilestoneId");
  const [sortDir, setSortDir] = useState("ASC");

  // Column visibility — persisted to localStorage
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const stored = lsGet('visibleColumns', null);
    return stored ? new Set(stored) : new Set(COLUMNS.map(c => c.key));
  });
  const [columnsDropdownOpen, setColumnsDropdownOpen] = useState(false);
  const columnsDropdownRef = useRef(null);

  // Persist to localStorage on change
  useEffect(() => { lsSet('activeTab', activeTab); }, [activeTab]);
  useEffect(() => { lsSet('pageSize', pageSize); }, [pageSize]);
  useEffect(() => { lsSet('visibleColumns', [...visibleColumns]); }, [visibleColumns]);

  // ── Fetch master data on mount ────────────────────────────────────
  useEffect(() => {
    api.get('/hn-master-data')
      .then(res => { if (res.data?.success) setMasterData(res.data.data); })
      .catch(err => console.error('Failed to fetch master data:', err.message));
  }, []);

  // ── Fetch user stats when filters change ──────────────────────────
  useEffect(() => {
    api.get('/charts/user-stats', {
      params: { client: selectedClient, location: selectedLocation },
    })
      .then(res => { if (res.data?.success) setUserStats(res.data.data); })
      .catch(err => console.error('Failed to fetch user stats:', err.message));
  }, [selectedClient, selectedLocation]);

  // ── Fetch charts ──────────────────────────────────────────────────
  const fetchCharts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.post('/charts/', {}, {
        params: {
          priority: activeTab,
          page: currentPage,
          size: pageSize,
          column: sortCol,
          direction: sortDir,
          client: selectedClient,
          location: selectedLocation,
        },
      });
      if (res.data?.success) {
        setCharts(res.data.data.charts || []);
        setCounts(res.data.data.counts || { Critical: 0, High: 0, Medium: 0, Low: 0, done: 0 });
      }
    } catch (e) {
      console.error('Failed to fetch charts:', e.message);
      setCharts([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, pageSize, sortCol, sortDir, selectedClient, selectedLocation]);

  useEffect(() => { fetchCharts(); }, [fetchCharts]);

  // ── Close dropdowns on outside click ──────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (clientRef.current && !clientRef.current.contains(e.target)) setClientOpen(false);
      if (locationRef.current && !locationRef.current.contains(e.target)) setLocationOpen(false);
      if (columnsDropdownRef.current && !columnsDropdownRef.current.contains(e.target)) setColumnsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Column visibility helpers ────────────────────────────────────
  const toggleColumnVisibility = (key) => {
    setVisibleColumns(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };
  const selectAllColumns = () => setVisibleColumns(new Set(COLUMNS.map(c => c.key)));
  const deselectAllColumns = () => setVisibleColumns(new Set(COLUMNS.filter(c => c.alwaysVisible).map(c => c.key)));

  const displayedColumns = useMemo(
    () => COLUMNS.filter(col => col.alwaysVisible || visibleColumns.has(col.key)),
    [visibleColumns]
  );
  const toggleableColumns = COLUMNS.filter(c => !c.alwaysVisible);
  const allToggleableVisible = toggleableColumns.every(c => visibleColumns.has(c.key));
  const noneToggleableVisible = toggleableColumns.every(c => !visibleColumns.has(c.key));
  const visibleCount = toggleableColumns.filter(c => visibleColumns.has(c.key)).length;

  // ── Derived data ──────────────────────────────────────────────────
  const clients = masterData?.clients || [];
  const allLocations = masterData?.locations || [];
  const filteredLocations = selectedClient === 0 ? allLocations : allLocations.filter(loc => loc.ClientId === selectedClient);
  const milestones = userStats?.milestones || {};

  const clientDisplayText = selectedClient === 0 ? "All" : clients.find(c => c.id === selectedClient)?.name || "All";
  const locationDisplayText = selectedLocation === 0 ? "All" : allLocations.find(l => l.id === selectedLocation)?.name || "All";

  const totalPages = Math.max(1, Math.ceil((counts[activeTab] || counts.done || 0) / pageSize));

  // ── Handlers ──────────────────────────────────────────────────────
  const handleClientSelect = useCallback((id) => {
    setSelectedClient(id);
    setSelectedLocation(0);
    setClientOpen(false);
    setCurrentPage(1);
  }, []);

  const handleLocationSelect = useCallback((id) => {
    setSelectedLocation(id);
    setLocationOpen(false);
    setCurrentPage(1);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSort = (colKey) => {
    const apiCol = SORT_MAP[colKey];
    if (!apiCol) return;
    if (sortCol === apiCol) {
      setSortDir(d => d === "ASC" ? "DESC" : "ASC");
    } else {
      setSortCol(apiCol);
      setSortDir("ASC");
    }
    setCurrentPage(1);
  };

  // Find which visible column key maps to the current sortCol
  const activeSortKey = Object.entries(SORT_MAP).find(([, v]) => v === sortCol)?.[0] || null;

  const tabs = PRIORITY_TABS.map(key => ({
    key,
    count: key === "Done" ? (counts.done ?? 0) : (counts[key] ?? 0),
  }));

  // ── Render cell ───────────────────────────────────────────────────
  const renderCell = (chart, col) => {
    switch (col.key) {
      case "SNo":
        return <span onClick={(e) => { e.stopPropagation(); navigate(`/process-chart/${chart.Id}`); }} style={{ color: "#f5a623", fontWeight: 700, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2 }}>{chart.SNo}</span>;
      case "chart_no":
        return chart.chart_no
          ? <span onClick={(e) => { e.stopPropagation(); navigate(`/process-chart/${chart.Id}`); }} style={{ color: "#f5a623", fontWeight: 600, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2 }}>{chart.chart_no}</span>
          : <span style={{ color: "#ccc" }}>—</span>;
      case "Status":
        return chart.Status ? <StatusBadge status={chart.Status} /> : <span style={{ color: "#ccc" }}>—</span>;
      case "Milestone":
        return chart.Milestone ? <MilestoneBadge milestone={chart.Milestone} /> : <span style={{ color: "#ccc" }}>—</span>;
      case "OriginalCoder":
        return <UserCell imageUrl={chart.coder_image_url} firstName={chart.CoderFirstName} lastName={chart.CoderLastName} />;
      case "FollowUpCoder":
        return <UserCell imageUrl={chart.follow_up_coder_image_url} firstName={chart.FollowUpCoderFirstName} lastName={chart.FollowUpCoderLastName} />;
      case "OriginalAuditor":
        return <UserCell imageUrl={chart.auditor_image_url} firstName={chart.AuditorFirstName} lastName={chart.AuditorLastName} />;
      case "AllocatedUser":
        return <UserCell imageUrl={chart.UserImageUrl} firstName={chart.UserFirstName} lastName={chart.UserLastName} />;
      case "qc_status":
        return chart.qc_status || <span style={{ color: "#ccc" }}>—</span>;
      default:
        return chart[col.key] ?? <span style={{ color: "#ccc" }}>—</span>;
    }
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <DashboardLayout fullWidth>
      <div className="space-y-6">
        {/* Header row with title + filters */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text)] tracking-tight">Auditor Dashboard</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">View audit logs and generate reports</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <Dropdown label="Client" displayText={clientDisplayText} open={clientOpen} setOpen={setClientOpen} dropdownRef={clientRef}>
              <DropdownItem selected={selectedClient === 0} onClick={() => handleClientSelect(0)}>All</DropdownItem>
              {clients.map(c => (
                <DropdownItem key={c.id} selected={selectedClient === c.id} onClick={() => handleClientSelect(c.id)}>{c.name}</DropdownItem>
              ))}
            </Dropdown>
            <Dropdown label="Location" displayText={locationDisplayText} open={locationOpen} setOpen={setLocationOpen} dropdownRef={locationRef}>
              <DropdownItem selected={selectedLocation === 0} onClick={() => handleLocationSelect(0)}>All</DropdownItem>
              {filteredLocations.map(loc => (
                <div key={loc.id}>
                  <DropdownItem isHeader>{loc.name}</DropdownItem>
                  <DropdownItem indent selected={selectedLocation === loc.id} onClick={() => handleLocationSelect(loc.id)}>{loc.name} - All</DropdownItem>
                  {loc.Processes?.map(proc => (
                    <DropdownItem key={proc.id} indent selected={false} onClick={() => handleLocationSelect(loc.id)}>{proc.name}</DropdownItem>
                  ))}
                </div>
              ))}
            </Dropdown>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 480px", minWidth: 0 }}>
            <SectionHeader>Milestones</SectionHeader>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              <MilestoneCard icon={ListChecks} value={milestones.ready_to_audit ?? 0} label="Ready to Audit" subtitle="All Time Count" bg="#f0f7ff" accent="#2563eb" iconBg="rgba(37,99,235,0.1)" />
              <MilestoneCard icon={ClipboardCheck} value={milestones.qc_pass ?? 0} label="Agree" subtitle="Today's Count" bg="#ecfdf5" accent="#10b981" iconBg="rgba(16,185,129,0.1)" />
              <MilestoneCard icon={MessageSquareWarning} value={milestones.qc_fail ?? 0} label="Feedback Provided" subtitle="Today's Count" bg="#fef2f2" accent="#ef4444" iconBg="rgba(239,68,68,0.1)" />
            </div>
          </div>
          <div style={{ flex: "1 1 320px", minWidth: 0 }}>
            <SectionHeader>Status</SectionHeader>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              <StatusCard value={userStats?.complete_status ?? 0} label="Complete" accent="#10b981" icon={CheckCircle2} />
              <StatusCard value={userStats?.incomplete_status ?? 0} label="Incomplete" accent="#ef4444" icon={AlertCircle} />
            </div>
          </div>
          <div style={{ flex: "0 0 200px", minWidth: 0 }}>
            <SectionHeader>Current Chart</SectionHeader>
            <CurrentChartCard
              chartStats={userStats?.current_chart_stats}
              onClick={() => {
                const chartId = userStats?.current_chart_stats?.chartId;
                if (chartId) navigate(`/process-chart/${chartId}`);
              }}
            />
          </div>
        </div>

        {/* Charts Table */}
        <div style={{
          background: "#fff", borderRadius: 14, border: "1px solid #e8eaed",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden",
        }}>
          {/* Priority Tabs + Page Size + Toolbar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 12px", borderBottom: "1px solid #f0f1f3",
          }}>
            <div style={{ display: "flex", gap: 0 }}>
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => handleTabChange(tab.key)} style={{
                  padding: "14px 14px", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
                  background: "none", border: "none", position: "relative",
                  color: activeTab === tab.key ? "#1a1d23" : "#8c919a",
                  borderBottom: activeTab === tab.key ? "2.5px solid #f5a623" : "2.5px solid transparent",
                  transition: "all 0.15s ease",
                }}>
                  {tab.key} ({tab.count})
                </button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} style={{
                padding: "7px 12px", borderRadius: 8, border: "1px solid #e0e2e6",
                fontSize: 13, color: "#4a4f58", cursor: "pointer", background: "#fff",
              }}>
                {[10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>

              {/* Columns dropdown */}
              <div ref={columnsDropdownRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setColumnsDropdownOpen(prev => !prev)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 14px", borderRadius: 20,
                    border: "1px solid #f5a623",
                    background: "linear-gradient(135deg, #fdf6e3, #fef9ee)",
                    fontSize: 13, fontWeight: 600, color: "#b8860b",
                    cursor: "pointer", transition: "all 0.15s ease",
                    boxShadow: columnsDropdownOpen ? "0 0 0 2px rgba(245,166,35,0.2)" : "none",
                  }}
                >
                  <SlidersHorizontal size={14} />
                  Columns
                  {!allToggleableVisible && (
                    <span style={{
                      background: "#f5a623", color: "#fff", fontSize: 10, fontWeight: 700,
                      borderRadius: 10, padding: "1px 6px", lineHeight: "16px",
                    }}>
                      {visibleCount}
                    </span>
                  )}
                  <ChevronDown size={12} style={{ transform: columnsDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
                </button>

                {columnsDropdownOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 6px)", right: 0,
                    width: 280, maxHeight: 420, overflowY: "auto",
                    background: "#fff", borderRadius: 12,
                    border: "1px solid #e8eaed",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                    zIndex: 1000,
                  }}>
                    <div style={{
                      padding: "12px 16px 10px", borderBottom: "1px solid #f0f1f3",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1d23" }}>Toggle Columns</span>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={selectAllColumns} style={{
                          background: "none", border: "none", fontSize: 12, fontWeight: 600,
                          color: allToggleableVisible ? "#b0b5be" : "#f5a623",
                          cursor: allToggleableVisible ? "default" : "pointer", padding: "2px 0",
                        }}>Show All</button>
                        <span style={{ color: "#e0e2e6" }}>|</span>
                        <button onClick={deselectAllColumns} style={{
                          background: "none", border: "none", fontSize: 12, fontWeight: 600,
                          color: noneToggleableVisible ? "#b0b5be" : "#f5a623",
                          cursor: noneToggleableVisible ? "default" : "pointer", padding: "2px 0",
                        }}>Hide All</button>
                      </div>
                    </div>
                    <div style={{ padding: "4px 0" }}>
                      {toggleableColumns.map(col => {
                        const isVisible = visibleColumns.has(col.key);
                        return (
                          <label key={col.key} style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "9px 16px", cursor: "pointer", transition: "background 0.1s",
                          }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#fafbfc"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                          >
                            <div
                              onClick={(e) => { e.preventDefault(); toggleColumnVisibility(col.key); }}
                              style={{
                                width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                                border: isVisible ? "2px solid #f5a623" : "2px solid #d0d3d9",
                                background: isVisible ? "#f5a623" : "#fff",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.15s ease", cursor: "pointer",
                              }}
                            >
                              {isVisible && (
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                              )}
                            </div>
                            <span style={{
                              fontSize: 13, fontWeight: 500,
                              color: isVisible ? "#1a1d23" : "#8c919a", userSelect: "none",
                            }}>{col.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Filter button */}
              <button style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 20,
                border: "1px solid #f5a623",
                background: "linear-gradient(135deg, #fdf6e3, #fef9ee)",
                fontSize: 13, fontWeight: 600, color: "#b8860b",
                cursor: "pointer", transition: "all 0.15s ease",
              }}>
                <Filter size={14} />
                Filter
              </button>

              {/* Reallocation button */}
              <button style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 20,
                border: "1px solid #f5a623",
                background: "linear-gradient(135deg, #fdf6e3, #fef9ee)",
                fontSize: 13, fontWeight: 600, color: "#b8860b",
                cursor: "pointer", transition: "all 0.15s ease",
              }}>
                <ArrowRightLeft size={14} />
                Reallocation
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ padding: 60, textAlign: "center", color: "#8c919a" }}>
              <div style={{
                width: 32, height: 32, border: "3px solid #f0f1f3",
                borderTopColor: "#f5a623", borderRadius: "50%",
                animation: "spin 0.8s linear infinite", margin: "0 auto 12px",
              }} />
              Loading charts...
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Table */}
          {!loading && (
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%", borderCollapse: "collapse",
                minWidth: displayedColumns.reduce((s, c) => s + c.width, 0),
              }}>
                <thead>
                  <tr style={{ background: "#fafbfc" }}>
                    {displayedColumns.map(col => {
                      const isSortable = !!SORT_MAP[col.key];
                      const isActive = col.key === activeSortKey;
                      return (
                        <th key={col.key}
                          onClick={() => isSortable && handleSort(col.key)}
                          style={{
                            padding: "10px 8px", fontSize: 10.5, fontWeight: 700,
                            color: "#8c919a", textAlign: "left", textTransform: "uppercase",
                            letterSpacing: "0.6px", whiteSpace: "nowrap",
                            borderBottom: "1px solid #f0f1f3", width: col.width,
                            cursor: isSortable ? "pointer" : "default", userSelect: "none",
                          }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                            {col.label}
                            {isSortable && (
                              <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
                                <path d="M4 0L7 4H1L4 0Z" fill={isActive && sortDir === "ASC" ? "#f5a623" : "#ccc"} />
                                <path d="M4 10L1 6H7L4 10Z" fill={isActive && sortDir === "DESC" ? "#f5a623" : "#ccc"} />
                              </svg>
                            )}
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {charts.length === 0 ? (
                    <tr>
                      <td colSpan={displayedColumns.length} style={{ padding: 60, textAlign: "center", color: "#b0b5be", fontSize: 14 }}>
                        No charts found for this priority level.
                      </td>
                    </tr>
                  ) : (
                    charts.map((chart, idx) => (
                      <tr key={chart.Id}
                        onClick={() => navigate(`/process-chart/${chart.Id}`)}
                        style={{
                          borderBottom: "1px solid #f4f5f7",
                          background: idx % 2 === 0 ? "#fff" : "#fdfdfe",
                          cursor: "pointer", transition: "background 0.1s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#fafbfc"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fdfdfe"; }}
                      >
                        {displayedColumns.map(col => (
                          <td key={col.key} style={{
                            padding: "10px 8px", fontSize: 13, color: "#3a3f48",
                            whiteSpace: col.key === "Location" ? "normal" : "nowrap",
                            verticalAlign: "middle",
                          }}>
                            {renderCell(chart, col)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div style={{
              display: "flex", justifyContent: "center", alignItems: "center",
              padding: "16px 12px", gap: 6, borderTop: "1px solid #f0f1f3",
            }}>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: "1px solid #e0e2e6",
                  background: "#fff", cursor: currentPage === 1 ? "default" : "pointer",
                  opacity: currentPage === 1 ? 0.4 : 1, display: "flex", alignItems: "center",
                  justifyContent: "center", color: "#6b7280",
                }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i + 1} onClick={() => setCurrentPage(i + 1)} style={{
                  width: 32, height: 32, borderRadius: 8, fontSize: 13, fontWeight: 600,
                  border: currentPage === i + 1 ? "none" : "1px solid #e0e2e6",
                  background: currentPage === i + 1 ? "linear-gradient(135deg, #f5a623, #f7b731)" : "#fff",
                  color: currentPage === i + 1 ? "#fff" : "#6b7280",
                  cursor: "pointer", boxShadow: currentPage === i + 1 ? "0 2px 6px rgba(245,166,35,0.3)" : "none",
                }}>{i + 1}</button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: "1px solid #e0e2e6",
                  background: "#fff", cursor: currentPage === totalPages ? "default" : "pointer",
                  opacity: currentPage === totalPages ? 0.4 : 1, display: "flex", alignItems: "center",
                  justifyContent: "center", color: "#6b7280",
                }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuditorDashboard;
