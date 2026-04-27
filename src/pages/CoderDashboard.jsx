import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import axios from "axios";
import { MEDX_API_URL } from "../utils/constants";
import { useChartsStore } from "../store/chartsStore";
import { useChartStatuses } from "../hooks/useChartStatuses";

const fmtElapsed = (s) => {
  if (s == null) return "--:--";
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)} : ${pad(m)} : ${pad(sec)}` : `${pad(m)} : ${pad(sec)}`;
};

const CHARTS_BASE_URL = "/charts/";

// Map table column keys to API sort column names
const SORT_COLUMN_MAP = {
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
  Priority: "Priority",
  SubSpecialty: "SubSpecialty",
  qc_status: "qc_status",
  date_of_coder_allocation: "date_of_coder_allocation",
  date_of_auditor_allocation: "date_of_auditor_allocation",
};

const Avatar = ({ src, name, size = 36 }) => {
  const [err, setErr] = useState(false);
  if (!src || err) {
    if (!name) return null;
    const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
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
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: isComplete ? "#1b9e4b" : "#e6a817",
      }} />
      {status}
    </span>
  );
};

const MilestoneBadge = ({ milestone }) => {
  const isProgress = milestone === "Coding in Progress";
  return (
    <span style={{
      display: "inline-block", padding: "3px 12px", borderRadius: 20,
      fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
      background: isProgress ? "#fff3e0" : "#e3f2fd",
      color: isProgress ? "#e65100" : "#1565c0",
      border: `1px solid ${isProgress ? "#ffcc80" : "#90caf9"}`,
    }}>{milestone}</span>
  );
};

const COLUMNS = [
  { key: "checkbox", label: "", width: 40, alwaysVisible: true },
  { key: "Worklist", label: "WORKLIST #", width: 110 },
  { key: "SNo", label: "S. NO.", width: 55 },
  { key: "Client", label: "CLIENT", width: 65 },
  { key: "Location", label: "LOCATION", width: 140 },
  { key: "Specialty", label: "PRIMARY SPECIALITY", width: 120 },
  { key: "chart_no", label: "CHART #", width: 90 },
  { key: "DateOfService", label: "DATE OF SERVICE", width: 115 },
  { key: "OriginalCoder", label: "ORIGINAL CODER", width: 90 },
  { key: "FollowUpCoder", label: "FOLLOW UP CODER", width: 90 },
  { key: "OriginalAuditor", label: "ORIGINAL AUDITOR", width: 90 },
  { key: "AllocatedUser", label: "ALLOCATED USER", width: 90 },
  { key: "Status", label: "CHART STATUS", width: 100 },
  { key: "Milestone", label: "MILESTONE", width: 140 },
  { key: "qc_status", label: "QC STATUS", width: 80 },
  { key: "Process", label: "PROCESS", width: 80 },
  { key: "ReceivedDate", label: "RECEIVED DATE", width: 115 },
  { key: "SubSpecialty", label: "SUB SPECIALTY", width: 120 },
  { key: "date_of_coder_allocation", label: "DATE OF CODER ALLOCATION", width: 130 },
  { key: "date_of_auditor_allocation", label: "DATE OF AUDITOR ALLOCATION", width: 140 },
];

const PRIORITY_TABS = ["Critical", "High", "Medium", "Low", "Done"];

const USER_STATS_URL = "/charts/user-stats";

export default function MyToDoList() {
  const navigate = useNavigate();
  const [charts, setCharts] = useState([]);
  const [counts, setCounts] = useState({ Critical: 0, High: 0, Medium: 0, Low: 0, done: 0 });
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [sortCol, setSortCol] = useState("MilestoneId");
  const [sortDir, setSortDir] = useState("ASC");

  // Zustand store for persisted preferences & chart navigation
  const activeTab = useChartsStore((s) => s.activeTab);
  const setActiveTab = useChartsStore((s) => s.setActiveTab);
  const pageSize = useChartsStore((s) => s.pageSize);
  const setPageSize = useChartsStore((s) => s.setPageSize);
  const storedVisibleColumns = useChartsStore((s) => s.visibleColumns);
  const setStoredVisibleColumns = useChartsStore((s) => s.setVisibleColumns);
  const setChartIds = useChartsStore((s) => s.setChartIds);

  // Column visibility state — derived from store
  const [visibleColumns, setVisibleColumns] = useState(
    () => new Set(storedVisibleColumns)
  );
  const [columnsDropdownOpen, setColumnsDropdownOpen] = useState(false);
  const columnsDropdownRef = useRef(null);

  // AI processing status — polled every 10s + live via WebSocket
  const sessionIds = useMemo(() => charts.map((c) => c.Id), [charts]);
  const fetchStatuses = useCallback(async () => {
    if (!sessionIds || sessionIds.length === 0) return null;
    const token = localStorage.getItem("token");
    const res = await axios.post(`${MEDX_API_URL}/charts/batch-status`, { sessionIds }, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    return res.data?.success ? res.data.data : null;
  }, [sessionIds]);
  const aiStatusMap = useChartStatuses(sessionIds, fetchStatuses);

  // Sync visibleColumns to store whenever it changes
  useEffect(() => {
    setStoredVisibleColumns([...visibleColumns]);
  }, [visibleColumns, setStoredVisibleColumns]);

  const fetchCharts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.post(CHARTS_BASE_URL, {}, {
        params: {
          priority: activeTab,
          page: currentPage,
          size: pageSize,
          column: sortCol,
          direction: sortDir,
          client: 0,
          location: 0,
        },
      });
      const data = response.data;
      if (data.success) {
        const chartsData = data.data.charts || [];
        setCharts(chartsData);
        setCounts(data.data.counts || {});
        // Store chart IDs for prev/next navigation in ProcessChart
        setChartIds(chartsData.map((c) => c.Id));
      }
    } catch (e) {
      console.error("Failed to fetch charts:", e.message);
      setCharts([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentPage, pageSize, sortCol, sortDir]);

  const fetchUserStats = useCallback(async () => {
    try {
      const response = await api.get(USER_STATS_URL, {
        params: { client: 0, location: 0 },
      });
      if (response.data.success) {
        setUserStats(response.data.data);
      }
    } catch (e) {
      console.error("Failed to fetch user stats:", e.message);
    }
  }, []);

  // Re-fetch when any query param changes
  useEffect(() => {
    fetchCharts();
  }, [fetchCharts]);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  // (AI status fetching is now handled inside useChartStatuses hook via polling + WebSocket)

  const [elapsed, setElapsed] = useState(null);
  useEffect(() => {
    const timer = userStats?.current_chart_stats?.timer;
    if (!timer) { setElapsed(null); return; }
    const startTime = new Date(timer).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - startTime) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [userStats]);

  // Reset to page 1 when tab or pageSize changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSelectedRows(new Set());
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleSort = (colKey) => {
    const apiCol = SORT_COLUMN_MAP[colKey];
    if (!apiCol) return;
    if (sortCol === apiCol) {
      setSortDir(prev => prev === "ASC" ? "DESC" : "ASC");
    } else {
      setSortCol(apiCol);
      setSortDir("ASC");
    }
    setCurrentPage(1);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (columnsDropdownRef.current && !columnsDropdownRef.current.contains(e.target)) {
        setColumnsDropdownOpen(false);
      }
    };
    if (columnsDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [columnsDropdownOpen]);

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

  // Total count for the active tab (API uses lowercase "done")
  const activeTabCount = activeTab === "Done" ? (counts.done ?? 0) : (counts[activeTab] ?? 0);
  const totalPages = Math.max(1, Math.ceil(activeTabCount / pageSize));

  const tabs = PRIORITY_TABS.map(key => ({
    key,
    count: key === "Done" ? (counts.done ?? 0) : (counts[key] ?? 0),
  }));

  const toggleRow = (id) => {
    setSelectedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === charts.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(charts.map(c => c.Id)));
    }
  };

  const renderCell = (chart, col) => {
    switch (col.key) {
      case "checkbox":
        return (
          <input type="checkbox" checked={selectedRows.has(chart.Id)}
            onChange={() => toggleRow(chart.Id)}
            style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#f5a623" }} />
        );
      case "SNo":
        return <span onClick={() => navigate(`/process-chart/${chart.Id}`)} style={{ color: "#f5a623", fontWeight: 700, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2 }}>{chart.SNo}</span>;
      case "chart_no":
        return chart.chart_no
          ? <span onClick={() => navigate(`/process-chart/${chart.Id}`)} style={{ color: "#f5a623", fontWeight: 600, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2 }}>{chart.chart_no}</span>
          : <span style={{ color: "#ccc" }}>—</span>;
      case "OriginalCoder":
        return chart.CoderFirstName ? (
          <Avatar src={chart.coder_image_url} name={`${chart.CoderFirstName} ${chart.CoderLastName}`} />
        ) : null;
      case "FollowUpCoder":
        return chart.FollowUpCoderFirstName ? (
          <Avatar src={chart.follow_up_coder_image_url} name={`${chart.FollowUpCoderFirstName} ${chart.FollowUpCoderLastName}`} />
        ) : null;
      case "OriginalAuditor":
        return chart.AuditorFirstName ? (
          <Avatar src={chart.auditor_image_url} name={`${chart.AuditorFirstName} ${chart.AuditorLastName}`} />
        ) : null;
      case "AllocatedUser":
        return chart.UserFirstName ? (
          <Avatar src={chart.UserImageUrl} name={`${chart.UserFirstName} ${chart.UserLastName}`} />
        ) : null;
      case "Status":
        return <StatusBadge status={chart.Status} />;
      case "Milestone":
        return <MilestoneBadge milestone={chart.Milestone} />;
      case "SubSpecialty":
        return chart.SubSpecialty || <span style={{ color: "#ccc" }}>—</span>;
      case "qc_status":
        return chart.qc_status || <span style={{ color: "#ccc" }}>—</span>;
      case "date_of_coder_allocation":
        return chart.date_of_coder_allocation || <span style={{ color: "#ccc" }}>—</span>;
      case "date_of_auditor_allocation":
        return chart.date_of_auditor_allocation || <span style={{ color: "#ccc" }}>—</span>;
      default:
        return chart[col.key] || <span style={{ color: "#ccc" }}>—</span>;
    }
  };

  const visibleCount = toggleableColumns.filter(c => visibleColumns.has(c.key)).length;

  // Find which API column name maps to which table key for sort indicator
  const activeSortKey = Object.entries(SORT_COLUMN_MAP).find(([, v]) => v === sortCol)?.[0];

  return (
    <DashboardLayout>
      <div style={{
        fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

        {/* User Stats Cards */}
        {userStats && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
            marginBottom: 24,
          }}>
            {/* Ready to Code Card */}
            <div style={{
              background: "#fff",
              borderRadius: 14,
              border: "1px solid #e8eaed",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: 140,
              position: "relative",
            }}>
              <div style={{ color: "#94a3b8", fontSize: 22, marginBottom: 8 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="4" cy="6" r="1.5" fill="#94a3b8" />
                  <circle cx="4" cy="12" r="1.5" fill="#94a3b8" />
                  <circle cx="4" cy="18" r="1.5" fill="#94a3b8" />
                  <line x1="9" y1="6" x2="20" y2="6" />
                  <line x1="9" y1="12" x2="20" y2="12" />
                  <line x1="9" y1="18" x2="20" y2="18" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 36, fontWeight: 700, color: "#0ea5e9", lineHeight: 1 }}>
                  {userStats.milestones?.ready_to_code ?? 0}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0ea5e9", marginTop: 4 }}>
                  Ready to Code
                </div>
              </div>
              <div style={{
                position: "absolute", bottom: 16, right: 20,
                fontSize: 12, color: "#94a3b8", fontWeight: 500,
              }}>
                All Time Count
              </div>
            </div>

            {/* Complete Card */}
            <div style={{
              background: "#fff",
              borderRadius: 14,
              border: "1px solid #e8eaed",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 140,
              position: "relative",
            }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 36, fontWeight: 700, color: "#10b981", lineHeight: 1 }}>
                  {userStats.complete_status ?? 0}
                </span>
                <span style={{ fontSize: 16, fontWeight: 600, color: "#10b981" }}>
                  Complete
                </span>
              </div>
              <div style={{ margin: "8px 0" }}>
                <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
                  <rect x="30" y="5" width="30" height="45" rx="4" fill="#e0f2fe" stroke="#93c5fd" strokeWidth="1"/>
                  <circle cx="45" cy="20" r="3" fill="#93c5fd"/>
                  <line x1="38" y1="30" x2="52" y2="30" stroke="#93c5fd" strokeWidth="1.5"/>
                  <line x1="38" y1="35" x2="48" y2="35" stroke="#93c5fd" strokeWidth="1.5"/>
                  <circle cx="25" cy="22" r="8" fill="#fce7f3" stroke="#f9a8d4" strokeWidth="1"/>
                  <path d="M22 22 L24 24 L28 20" stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="20" cy="15" r="5" fill="#fecdd3"/>
                  <circle cx="20" cy="12" r="3" fill="#1e293b"/>
                </svg>
              </div>
              <div style={{
                fontSize: 12, color: "#94a3b8", fontWeight: 500,
              }}>
                Today's Count
              </div>
            </div>

            {/* Incomplete Card */}
            <div style={{
              background: "#fff",
              borderRadius: 14,
              border: "1px solid #e8eaed",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 140,
              position: "relative",
            }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 36, fontWeight: 700, color: "#f43f5e", lineHeight: 1 }}>
                  {userStats.incomplete_status ?? 0}
                </span>
                <span style={{ fontSize: 16, fontWeight: 600, color: "#f43f5e" }}>
                  Incomplete
                </span>
              </div>
              <div style={{ margin: "8px 0" }}>
                <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
                  <rect x="35" y="15" width="25" height="35" rx="3" fill="#e0f2fe" stroke="#93c5fd" strokeWidth="1"/>
                  <line x1="40" y1="25" x2="55" y2="25" stroke="#93c5fd" strokeWidth="1.5"/>
                  <line x1="40" y1="30" x2="50" y2="30" stroke="#93c5fd" strokeWidth="1.5"/>
                  <line x1="40" y1="35" x2="52" y2="35" stroke="#93c5fd" strokeWidth="1.5"/>
                  <circle cx="25" cy="20" r="5" fill="#1e293b"/>
                  <circle cx="25" cy="17" r="3" fill="#64748b"/>
                  <rect x="20" y="25" width="10" height="15" rx="3" fill="#1e293b"/>
                  <circle cx="60" cy="12" r="2" fill="#93c5fd"/>
                  <circle cx="55" cy="8" r="1.5" fill="#c4b5fd"/>
                  <line x1="62" y1="18" x2="68" y2="12" stroke="#93c5fd" strokeWidth="1"/>
                </svg>
              </div>
              <div style={{
                fontSize: 12, color: "#94a3b8", fontWeight: 500,
              }}>
                Today's Count
              </div>
            </div>

            {/* Current Chart Card */}
            <div
              onClick={() => userStats.current_chart_stats?.chartId && navigate(`/process-chart/${userStats.current_chart_stats.chartId}`)}
              style={{
                background: "#fff",
                borderRadius: 14,
                border: "1px solid #e8eaed",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                display: "flex",
                flexDirection: "column",
                minHeight: 140,
                cursor: userStats.current_chart_stats?.chartId ? "pointer" : "default",
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "12px 16px",
                borderBottom: "1px dashed #e8eaed",
              }}>
                <span style={{ color: "#10b981", fontSize: 10, lineHeight: 1 }}>●</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>Current Chart</span>
              </div>

              {/* Body */}
              {userStats.current_chart_stats ? (
                <div style={{ padding: "10px 16px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{
                    background: "linear-gradient(135deg, #38bdf8, #06b6d4)",
                    borderRadius: 12,
                    padding: "16px 18px",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 4,
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
                      {userStats.current_chart_stats.chart_no || "—"}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>
                      {userStats.current_chart_stats.milestone || "—"}
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: 2, marginTop: 4 }}>
                      {fmtElapsed(elapsed)}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
                      Tap to view
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#94a3b8", fontSize: 13, fontWeight: 500,
                }}>
                  No active chart
                </div>
              )}
            </div>
          </div>
        )}

        {/* Header */}
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1d23", margin: "0 0 20px 0", letterSpacing: "-0.3px" }}>
          My To-do List
        </h1>

        {/* Tabs + Actions Bar */}
        <div style={{
          background: "#fff", borderRadius: 14, border: "1px solid #e8eaed",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden",
        }}>
          {/* Top bar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 20px", borderBottom: "1px solid #f0f1f3",
          }}>
            {/* Priority Tabs */}
            <div style={{ display: "flex", gap: 0 }}>
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => handleTabChange(tab.key)} style={{
                  padding: "14px 18px", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
                  background: "none", border: "none", position: "relative",
                  color: activeTab === tab.key ? "#1a1d23" : "#8c919a",
                  borderBottom: activeTab === tab.key ? "2.5px solid #f5a623" : "2.5px solid transparent",
                  transition: "all 0.15s ease",
                }}>
                  {tab.key} ({tab.count})
                </button>
              ))}
            </div>

            {/* Right actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <select value={pageSize} onChange={e => handlePageSizeChange(Number(e.target.value))} style={{
                padding: "7px 12px", borderRadius: 8, border: "1px solid #e0e2e6",
                fontSize: 13, color: "#4a4f58", cursor: "pointer", background: "#fff",
              }}>
                {[10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
              </select>

              {/* Columns button with dropdown */}
              <div ref={columnsDropdownRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setColumnsDropdownOpen(prev => !prev)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 16px", borderRadius: 8,
                    border: columnsDropdownOpen ? "1px solid #f5a623" : "1px solid #e0e2e6",
                    background: columnsDropdownOpen ? "#fffbf0" : "#fff",
                    fontSize: 13, fontWeight: 500, color: "#4a4f58",
                    cursor: "pointer", transition: "all 0.15s ease",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5h6M11 9h6M11 13h4M5 5l2 2L5 9M5 13l2 2-2 2" /></svg>
                  Columns
                  {!allToggleableVisible && (
                    <span style={{
                      background: "#f5a623", color: "#fff", fontSize: 10, fontWeight: 700,
                      borderRadius: 10, padding: "1px 6px", marginLeft: 2, lineHeight: "16px",
                    }}>
                      {visibleCount}
                    </span>
                  )}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ marginLeft: 2, transform: columnsDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {/* Dropdown panel */}
                {columnsDropdownOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 6px)", right: 0,
                    width: 280, maxHeight: 420, overflowY: "auto",
                    background: "#fff", borderRadius: 12,
                    border: "1px solid #e8eaed",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                    zIndex: 1000,
                    animation: "columnsFadeIn 0.15s ease",
                  }}>
                    <style>{`
                    @keyframes columnsFadeIn {
                      from { opacity: 0; transform: translateY(-4px); }
                      to { opacity: 1; transform: translateY(0); }
                    }
                    .col-item:hover { background: #fafbfc !important; }
                  `}</style>

                    {/* Header */}
                    <div style={{
                      padding: "12px 16px 10px", borderBottom: "1px solid #f0f1f3",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1d23" }}>
                        Toggle Columns
                      </span>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={selectAllColumns} style={{
                          background: "none", border: "none", fontSize: 12, fontWeight: 600,
                          color: allToggleableVisible ? "#b0b5be" : "#f5a623",
                          cursor: allToggleableVisible ? "default" : "pointer",
                          padding: "2px 0",
                        }}>
                          Show All
                        </button>
                        <span style={{ color: "#e0e2e6" }}>|</span>
                        <button onClick={deselectAllColumns} style={{
                          background: "none", border: "none", fontSize: 12, fontWeight: 600,
                          color: noneToggleableVisible ? "#b0b5be" : "#f5a623",
                          cursor: noneToggleableVisible ? "default" : "pointer",
                          padding: "2px 0",
                        }}>
                          Hide All
                        </button>
                      </div>
                    </div>

                    {/* Column list */}
                    <div style={{ padding: "4px 0" }}>
                      {toggleableColumns.map(col => {
                        const isVisible = visibleColumns.has(col.key);
                        return (
                          <label
                            key={col.key}
                            className="col-item"
                            style={{
                              display: "flex", alignItems: "center", gap: 10,
                              padding: "9px 16px", cursor: "pointer",
                              transition: "background 0.1s",
                              borderRadius: 0,
                            }}
                          >
                            <div
                              onClick={(e) => {
                                e.preventDefault();
                                toggleColumnVisibility(col.key);
                              }}
                              style={{
                                width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                                border: isVisible ? "2px solid #f5a623" : "2px solid #d0d3d9",
                                background: isVisible ? "#f5a623" : "#fff",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.15s ease",
                                cursor: "pointer",
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
                              color: isVisible ? "#1a1d23" : "#8c919a",
                              userSelect: "none",
                            }}>
                              {col.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <button style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 16px", borderRadius: 8, border: "1px solid #e0e2e6",
                background: "#fff", fontSize: 13, fontWeight: 500, color: "#6b47dc",
                cursor: "pointer",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>
                Filter
              </button>

              <button style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 16px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg, #f5a623, #f7b731)",
                fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer",
                boxShadow: "0 2px 8px rgba(245,166,35,0.3)",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                Reallocation
              </button>

              {/* <button style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 16px", borderRadius: 10, border: "2px solid #1a1d23",
                background: "#fff", fontSize: 13, fontWeight: 600, color: "#1a1d23",
                cursor: "pointer",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                Add Chart
              </button> */}
            </div>
          </div>

          {/* Loading state */}
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
                minWidth: displayedColumns.reduce((sum, c) => sum + c.width, 0),
              }}>
                <thead>
                  <tr style={{ background: "#fafbfc" }}>
                    {displayedColumns.map(col => {
                      const isSortable = !!SORT_COLUMN_MAP[col.key];
                      const isActiveSortCol = col.key === activeSortKey;
                      return (
                        <th key={col.key}
                          onClick={() => isSortable && handleSort(col.key)}
                          style={{
                            padding: "12px 14px", fontSize: 10.5, fontWeight: 700,
                            color: "#8c919a", textAlign: "left", textTransform: "uppercase",
                            letterSpacing: "0.6px", whiteSpace: "nowrap",
                            borderBottom: "1px solid #f0f1f3",
                            width: col.width,
                            cursor: isSortable ? "pointer" : "default",
                            userSelect: "none",
                          }}>
                          {col.key === "checkbox" ? (
                            <input type="checkbox" onChange={toggleAll}
                              checked={charts.length > 0 && selectedRows.size === charts.length}
                              style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#f5a623" }} />
                          ) : (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                              {col.label}
                              {isSortable && (
                                <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
                                  <path d="M4 0L7 4H1L4 0Z" fill={isActiveSortCol && sortDir === "ASC" ? "#f5a623" : "#ccc"} />
                                  <path d="M4 10L1 6H7L4 10Z" fill={isActiveSortCol && sortDir === "DESC" ? "#f5a623" : "#ccc"} />
                                </svg>
                              )}
                            </span>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {charts.length === 0 ? (
                    <tr>
                      <td colSpan={displayedColumns.length} style={{
                        padding: 60, textAlign: "center", color: "#b0b5be", fontSize: 14,
                      }}>
                        No charts found for this priority level.
                      </td>
                    </tr>
                  ) : (
                    charts.map((chart, idx) => {
                      const aiSt = aiStatusMap[String(chart.Id)];
                      const aiBorderColor = aiSt === "processing" ? "#f59e0b"
                        : aiSt === "queued" ? "#3b82f6"
                        : aiSt === "ready" || aiSt === "submitted" ? "#10b981"
                        : "transparent";
                      return (
                      <tr key={chart.Id} style={{
                        borderBottom: "1px solid #f4f5f7",
                        borderLeft: aiBorderColor !== "transparent" ? `3px solid ${aiBorderColor}` : "3px solid transparent",
                        background: selectedRows.has(chart.Id) ? "#fffbf0" : idx % 2 === 0 ? "#fff" : "#fdfdfe",
                        transition: "background 0.1s",
                      }}
                        onMouseEnter={e => { if (!selectedRows.has(chart.Id)) e.currentTarget.style.background = "#fafbfc"; }}
                        onMouseLeave={e => { if (!selectedRows.has(chart.Id)) e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fdfdfe"; }}
                      >
                        {displayedColumns.map(col => (
                          <td key={col.key} style={{
                            padding: "16px 14px", fontSize: 13, color: "#3a3f48",
                            whiteSpace: col.key === "Location" ? "normal" : "nowrap",
                            verticalAlign: "middle",
                          }}>
                            {renderCell(chart, col)}
                          </td>
                        ))}
                      </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div style={{
              display: "flex", justifyContent: "center", alignItems: "center",
              padding: "16px 20px", gap: 6, borderTop: "1px solid #f0f1f3",
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
}
