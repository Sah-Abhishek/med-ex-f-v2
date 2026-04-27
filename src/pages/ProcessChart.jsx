import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import { MEDX_API_URL } from "../utils/constants";
import { listReasonOptions } from "../services/reasonOptionsService";
import { useChartsStore } from "../store/chartsStore";
import { useAuthStore } from "../store/authStore";
import { useJobStatus } from "../hooks/useJobStatus";
import axios from "axios";
import {
  FileText, File as FileIcon, FileImage, Layers,
  ClipboardPaste, X, Plus, Trash2, Upload, Loader2, CheckCircle2, AlertCircle,
  Eye, ExternalLink, Wifi, WifiOff, Clock, ChevronLeft, ChevronRight, List,
  Minimize2, Maximize2, Sparkles, ChevronDown, ChevronUp, Check, XCircle, Pencil, Save, Send,
} from "lucide-react";

/* ── SVG Icon components ── */
const IconBuilding = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" />
  </svg>
);
const IconGear = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const IconHospital = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18M9 8h6M12 5v6M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
  </svg>
);
const IconMapPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const IconUser = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconClipboard = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" />
  </svg>
);
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconBot = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" />
  </svg>
);

/* ── Reusable components ── */

const Avatar = ({ src, name, size = 40 }) => {
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

const ToggleButton = ({ open, onClick, variant = "add" }) => {
  const isRemove = variant === "remove";
  return (
    <button onClick={onClick} style={{
      width: 28, height: 28, borderRadius: "50%", border: "none",
      background: isRemove ? "#fef2f2" : "#fff3e0",
      color: isRemove ? "#ef4444" : "#f5a623",
      fontSize: 18, fontWeight: 500, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      lineHeight: 1,
    }}>
      {open ? "−" : "+"}
    </button>
  );
};

const StyledDropdown = ({ value, onChange, options, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", padding: "9px 32px 9px 12px", borderRadius: 10,
          border: open ? "1.5px solid #c084fc" : "1.5px solid #e9d5ff",
          background: "#fff", textAlign: "left", cursor: "pointer",
          fontSize: 12, fontWeight: 600, color: selected ? "#1e293b" : "#94a3b8",
          display: "flex", alignItems: "center", gap: 8,
          transition: "border-color 0.15s",
          position: "relative",
        }}
      >
        {selected?.dot && <span style={{ width: 8, height: 8, borderRadius: "50%", background: selected.dot, flexShrink: 0 }} />}
        {selected?.label || placeholder || "Select..."}
        <ChevronDown style={{
          width: 14, height: 14, color: "#a855f7", position: "absolute", right: 10, top: "50%",
          transform: open ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)",
          transition: "transform 0.2s",
        }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
          background: "#fff", borderRadius: 10, border: "1.5px solid #e9d5ff",
          boxShadow: "0 8px 24px rgba(168, 85, 247, 0.12)", overflow: "hidden",
          maxHeight: 200, overflowY: "auto",
        }}>
          {options.map((opt) => {
            const isActive = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  width: "100%", padding: "9px 12px", border: "none", textAlign: "left",
                  cursor: "pointer", fontSize: 12, fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#7c3aed" : "#1e293b",
                  background: isActive ? "#f5f3ff" : "transparent",
                  display: "flex", alignItems: "center", gap: 8,
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#fdf4ff"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                {opt.dot && <span style={{ width: 8, height: 8, borderRadius: "50%", background: opt.dot, flexShrink: 0 }} />}
                <span style={{ flex: 1 }}>{opt.label}</span>
                {isActive && <Check style={{ width: 14, height: 14, color: "#7c3aed" }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ReasonDropdown = ({ value, onChange, options, placeholder, emptyPlaceholder, theme = "reject" }) => {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);
  const selected = options.find(o => o.id === value);

  const palette = theme === "edit"
    ? { border: "#93c5fd", borderOpen: "#3b82f6", borderHover: "#60a5fa", chevron: "#2563eb", activeBg: "#eff6ff", activeText: "#1d4ed8", hoverBg: "#f0f9ff", shadow: "rgba(37, 99, 235, 0.12)" }
    : { border: "#fecaca", borderOpen: "#ef4444", borderHover: "#fca5a5", chevron: "#dc2626", activeBg: "#fef2f2", activeText: "#b91c1c", hoverBg: "#fff1f2", shadow: "rgba(220, 38, 38, 0.12)" };

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const hasOptions = options.length > 0;
  const displayText = selected?.label || (hasOptions ? (placeholder || "Select a reason…") : (emptyPlaceholder || "No options available"));

  return (
    <div ref={ref} style={{ position: "relative", marginBottom: 8 }}>
      <button
        type="button"
        onClick={() => hasOptions && setOpen(o => !o)}
        disabled={!hasOptions}
        style={{
          width: "100%", padding: "8px 32px 8px 12px", borderRadius: 8,
          border: `1.5px solid ${open ? palette.borderOpen : palette.border}`,
          background: hasOptions ? "#fff" : "#f8fafc",
          textAlign: "left",
          cursor: hasOptions ? "pointer" : "not-allowed",
          fontSize: 12, fontWeight: selected ? 600 : 500,
          color: selected ? "#1e293b" : "#94a3b8",
          display: "flex", alignItems: "center",
          outline: "none", boxSizing: "border-box", fontFamily: "inherit",
          transition: "border-color 0.15s, box-shadow 0.15s",
          boxShadow: open ? `0 0 0 3px ${palette.shadow}` : "none",
          position: "relative",
        }}
      >
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {displayText}
        </span>
        {hasOptions && (
          <ChevronDown style={{
            width: 14, height: 14, color: palette.chevron,
            position: "absolute", right: 10, top: "50%",
            transform: open ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)",
            transition: "transform 0.2s",
          }} />
        )}
      </button>
      {open && hasOptions && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
          background: "#fff", borderRadius: 8,
          border: `1.5px solid ${palette.border}`,
          boxShadow: `0 8px 24px ${palette.shadow}`,
          overflow: "hidden",
          maxHeight: 200, overflowY: "auto",
        }}>
          {options.map((opt) => {
            const isActive = opt.id === value;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => { onChange(opt.id, opt.label); setOpen(false); }}
                style={{
                  width: "100%", padding: "9px 12px", border: "none", textAlign: "left",
                  cursor: "pointer", fontSize: 12,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? palette.activeText : "#1e293b",
                  background: isActive ? palette.activeBg : "transparent",
                  display: "flex", alignItems: "center", gap: 8,
                  transition: "background 0.1s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = palette.hoverBg; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ flex: 1 }}>{opt.label}</span>
                {isActive && <Check style={{ width: 14, height: 14, color: palette.activeText, flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CollapsibleSection = ({ title, subtitle, defaultOpen = false, children, headerAction }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: "#fff", borderRadius: 14, border: "1px solid #e8eaed",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)", marginBottom: 16,
    }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", cursor: "pointer", userSelect: "none",
        }}
      >
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: "#1a1d23", margin: 0 }}>{title}</h4>
          {subtitle && <p style={{ fontSize: 11, color: "#8c919a", margin: "2px 0 0" }}>{subtitle}</p>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {headerAction}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2.5"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
      {open && <div style={{ padding: "0 20px 20px" }}>{children}</div>}
    </div>
  );
};

const CollapsibleCard = ({ title, subtitle, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: "#fff", borderRadius: 14, border: "1px solid #e8eaed",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)", marginBottom: 20,
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 24px", borderBottom: open ? "1px solid #f0f1f3" : "none",
        cursor: "pointer", userSelect: "none",
        borderRadius: open ? "14px 14px 0 0" : 14,
      }} onClick={() => setOpen(o => !o)}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1d23", margin: 0 }}>{title}</h3>
          {subtitle && <p style={{ fontSize: 12, color: "#8c919a", margin: "2px 0 0 0" }}>{subtitle}</p>}
        </div>
        <ToggleButton open={open} onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }} />
      </div>
      {open && <div style={{ padding: "20px 24px" }}>{children}</div>}
    </div>
  );
};

const FormFieldDropdown = ({ value, onChange, options = [], placeholder, readOnly }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = React.useRef(null);
  const searchRef = React.useRef(null);

  const normalizedOpts = options.map(opt =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );
  const selected = normalizedOpts.find(o => o.value === value);
  const filtered = search
    ? normalizedOpts.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : normalizedOpts;
  const showSearch = normalizedOpts.length > 6;

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setSearch(""); } };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (open && showSearch && searchRef.current) searchRef.current.focus();
  }, [open, showSearch]);

  if (readOnly) {
    return (
      <div style={{
        width: "100%", padding: "10px 12px", borderRadius: 8,
        border: "1px solid #d1d5db", background: "#e5e7eb",
        fontSize: 13, color: value ? "#6b7280" : "#9ca3af",
        boxSizing: "border-box", minHeight: 40, cursor: "not-allowed",
      }}>
        {selected?.label || value || placeholder || "Select..."}
      </div>
    );
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", padding: "10px 32px 10px 12px", borderRadius: 8,
          border: open ? "1.5px solid #a78bfa" : "1px solid #e2e8f0",
          background: "#fff", textAlign: "left", cursor: "pointer",
          fontSize: 13, fontWeight: 500, color: selected ? "#1a1d23" : "#94a3b8",
          display: "flex", alignItems: "center", gap: 8,
          transition: "border-color 0.15s, box-shadow 0.15s",
          boxShadow: open ? "0 0 0 3px rgba(167, 139, 250, 0.1)" : "none",
          position: "relative", boxSizing: "border-box",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
          {selected?.label || placeholder || "Select..."}
        </span>
        <ChevronDown style={{
          width: 14, height: 14, color: "#94a3b8", position: "absolute", right: 10, top: "50%",
          transform: open ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)",
          transition: "transform 0.2s",
        }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
          background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0",
          boxShadow: "0 10px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
        }}>
          {showSearch && (
            <div style={{ padding: "8px 8px 4px" }}>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                style={{
                  width: "100%", padding: "7px 10px", borderRadius: 6,
                  border: "1px solid #e2e8f0", fontSize: 12, color: "#1a1d23",
                  outline: "none", boxSizing: "border-box", background: "#f8fafc",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#a78bfa"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
              />
            </div>
          )}
          <div style={{ maxHeight: 200, overflowY: "auto", padding: "4px 0" }}>
            {filtered.length === 0 && (
              <div style={{ padding: "12px 16px", fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
                No options found
              </div>
            )}
            {filtered.map((opt) => {
              const isActive = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange?.(opt.value); setOpen(false); setSearch(""); }}
                  style={{
                    width: "100%", padding: "8px 12px", border: "none", textAlign: "left",
                    cursor: "pointer", fontSize: 13, fontWeight: isActive ? 600 : 400,
                    color: isActive ? "#7c3aed" : "#1e293b",
                    background: isActive ? "#f5f3ff" : "transparent",
                    display: "flex", alignItems: "center", gap: 8,
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = isActive ? "#f5f3ff" : "transparent"; }}
                >
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{opt.label}</span>
                  {isActive && <Check style={{ width: 14, height: 14, color: "#7c3aed", flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const FormField = ({ label, value, required, type = "text", options, placeholder, readOnly = true, onChange, aiTag }) => (
  <div style={{ flex: 1, minWidth: 0 }}>
    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
      {label}{required && <span style={{ color: "#ef4444" }}> *</span>}
      {aiTag && (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 3,
          padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700,
          background: "linear-gradient(135deg, #ede9fe, #e0e7ff)", color: "#6d28d9",
          border: "1px solid #c4b5fd", letterSpacing: "0.02em",
        }}>
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M8 1l2.1 4.3L15 6l-3.5 3.4.8 4.8L8 12l-4.3 2.2.8-4.8L1 6l4.9-.7L8 1z" fill="#7c3aed" /></svg>
          AI Generated
        </span>
      )}
    </label>
    {type === "select" ? (
      <FormFieldDropdown
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    ) : (
      <input type={type} value={value || ""} readOnly={readOnly} placeholder={placeholder || ""}
        onChange={readOnly ? undefined : (e) => onChange?.(e.target.value)}
        style={{
          width: "100%", padding: "10px 12px", borderRadius: 8,
          border: `1px solid ${aiTag ? "#c4b5fd" : readOnly ? "#d1d5db" : "#e2e8f0"}`,
          background: aiTag ? "#faf5ff" : readOnly ? "#e5e7eb" : "#fff",
          fontSize: 13, color: readOnly ? "#6b7280" : "#1a1d23", boxSizing: "border-box",
          cursor: readOnly ? "not-allowed" : "text",
        }} />
    )}
  </div>
);

const FormFieldMultiSelect = ({ value = [], onChange, options = [], placeholder, readOnly }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = React.useRef(null);
  const searchRef = React.useRef(null);

  const normalizedOpts = options.map(opt =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );
  const filtered = search
    ? normalizedOpts.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : normalizedOpts;
  const showSearch = normalizedOpts.length > 6;

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setSearch(""); } };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (open && showSearch && searchRef.current) searchRef.current.focus();
  }, [open, showSearch]);

  const toggleOption = (optValue) => {
    const arr = Array.isArray(value) ? value : [];
    if (arr.includes(optValue)) {
      onChange(arr.filter(v => v !== optValue));
    } else {
      onChange([...arr, optValue]);
    }
  };

  if (readOnly) {
    const display = Array.isArray(value) && value.length > 0 ? value.join(", ") : (placeholder || "Select...");
    return (
      <div style={{
        width: "100%", padding: "10px 12px", borderRadius: 8,
        border: "1px solid #d1d5db", background: "#e5e7eb",
        fontSize: 13, color: value?.length ? "#6b7280" : "#9ca3af",
        boxSizing: "border-box", minHeight: 40, cursor: "not-allowed",
      }}>
        {display}
      </div>
    );
  }

  const selectedLabels = normalizedOpts.filter(o => (value || []).includes(o.value)).map(o => o.label);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", padding: "10px 32px 10px 12px", borderRadius: 8,
          border: open ? "1.5px solid #a78bfa" : "1px solid #e2e8f0",
          background: "#fff", textAlign: "left", cursor: "pointer",
          fontSize: 13, fontWeight: 500, color: selectedLabels.length > 0 ? "#1a1d23" : "#94a3b8",
          display: "flex", alignItems: "center", gap: 8,
          transition: "border-color 0.15s, box-shadow 0.15s",
          boxShadow: open ? "0 0 0 3px rgba(167, 139, 250, 0.1)" : "none",
          position: "relative", boxSizing: "border-box", minHeight: 40,
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
          {selectedLabels.length > 0 ? selectedLabels.join(", ") : (placeholder || "Select...")}
        </span>
        <ChevronDown style={{
          width: 14, height: 14, color: "#94a3b8", position: "absolute", right: 10, top: "50%",
          transform: open ? "translateY(-50%) rotate(180deg)" : "translateY(-50%)",
          transition: "transform 0.2s",
        }} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
          background: "#fff", borderRadius: 10, border: "1px solid #e2e8f0",
          boxShadow: "0 10px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
        }}>
          {showSearch && (
            <div style={{ padding: "8px 8px 4px" }}>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                style={{
                  width: "100%", padding: "7px 10px", borderRadius: 6,
                  border: "1px solid #e2e8f0", fontSize: 12, color: "#1a1d23",
                  outline: "none", boxSizing: "border-box", background: "#f8fafc",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#a78bfa"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e2e8f0"}
              />
            </div>
          )}
          <div style={{ maxHeight: 200, overflowY: "auto", padding: "4px 0" }}>
            {filtered.length === 0 && (
              <div style={{ padding: "12px 16px", fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
                No options found
              </div>
            )}
            {filtered.map((opt) => {
              const isChecked = (value || []).includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleOption(opt.value)}
                  style={{
                    width: "100%", padding: "8px 12px", border: "none", textAlign: "left",
                    cursor: "pointer", fontSize: 13, fontWeight: isChecked ? 600 : 400,
                    color: isChecked ? "#7c3aed" : "#1e293b",
                    background: isChecked ? "#f5f3ff" : "transparent",
                    display: "flex", alignItems: "center", gap: 8,
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => { if (!isChecked) e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseLeave={(e) => { if (!isChecked) e.currentTarget.style.background = isChecked ? "#f5f3ff" : "transparent"; }}
                >
                  <span style={{
                    width: 16, height: 16, borderRadius: 3, border: isChecked ? "none" : "1.5px solid #cbd5e1",
                    background: isChecked ? "#7c3aed" : "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {isChecked && <Check style={{ width: 11, height: 11, color: "#fff" }} />}
                  </span>
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const PriorityBadge = ({ priority }) => {
  const colors = {
    Critical: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
    High: { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
    Medium: { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
    Low: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  };
  const c = colors[priority] || colors.Medium;
  return (
    <span style={{
      padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>{priority}</span>
  );
};

/* ── Audit rows configuration ── */
const AUDIT_ROWS = [
  { key: "primaryDiagnosis", label: "Primary Diagnosis", feedKey: "prim_diag_feed" },
  { key: "secondaryDiagnosis", label: "Secondary Diagnosis", feedKey: "sec_diag_feed", multiFeedback: true },
  { key: "procedures", label: "Procedures", feedKey: "procedure_feed", multiFeedback: true },
  { key: "edEmLevel", label: "ED/EM Level", feedKey: "ed_em_feed", totalCodesOptions: ["0", "1"] },
  { key: "modifier", label: "Modifier", feedKey: "modifier_feed", multiFeedback: true },
  { key: "poaIndicator", label: "POA Indicator", feedKey: "poa_feed", multiFeedback: true },
  { key: "drgValue", label: "DRG Value", feedKey: "drug_feed", multiFeedback: true },
];

/* ── Metadata item with icon ── */
const MetaItem = ({ icon, children }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "#64748b" }}>
    <span style={{ display: "flex", color: "#94a3b8" }}>{icon}</span>
    {children}
  </span>
);

/* ── Main Page Component ── */

export default function ProcessChart() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState(null);
  const [masterData, setMasterData] = useState(null);
  const [formData, setFormData] = useState({});
  const [aiFilledFields, setAiFilledFields] = useState(new Set());
  const aiAutoFillDone = React.useRef(false);
  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear AI tag when user manually edits the field
    setAiFilledFields(prev => {
      if (!prev.has(field)) return prev;
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  };
  const [customFields, setCustomFields] = useState([]);
  const [customFieldValues, setCustomFieldValues] = useState({});
  const updateCustomField = (fieldId, value) => setCustomFieldValues(prev => ({ ...prev, [fieldId]: value }));
  const [feedbackCategories, setFeedbackCategories] = useState([]);
  const [auditData, setAuditData] = useState({});
  const updateAuditField = (rowKey, field, value) =>
    setAuditData(prev => {
      const row = { ...prev[rowKey], [field]: value };
      // Correct codes must always be <= total codes
      if (field === "correctCodes") {
        const total = parseInt(row.totalCodes, 10);
        const correct = parseInt(value, 10);
        if (!isNaN(total) && !isNaN(correct) && correct > total) {
          row.correctCodes = String(total);
        }
      }
      // If total codes is reduced below correct codes, cap correct codes
      if (field === "totalCodes") {
        const total = parseInt(value, 10);
        const correct = parseInt(row.correctCodes, 10);
        if (!isNaN(total) && !isNaN(correct) && correct > total) {
          row.correctCodes = String(total);
        }
      }
      return { ...prev, [rowKey]: row };
    });

  // Chart navigation from Zustand store
  const getPrevId = useChartsStore((s) => s.getPrevId);
  const getNextId = useChartsStore((s) => s.getNextId);
  const currentId = Number(id);
  const prevId = getPrevId(currentId);
  const nextId = getNextId(currentId);

  // Timer state — server is source of truth; localStorage only persists start/stop display times
  const timerStorageKey = `timer_${id}`;
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem(timerStorageKey)); return saved?.startTime || null; } catch { return null; }
  });
  const [timerStopTime, setTimerStopTime] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem(timerStorageKey)); return saved?.stopTime || null; } catch { return null; }
  });
  const [timerStopped, setTimerStopped] = useState(true);
  const [isAnotherChartProcessing, setIsAnotherChartProcessing] = useState(null);
  const [currentChartStats, setCurrentChartStats] = useState(null);
  const [timerMessage, setTimerMessage] = useState("");

  // Toast state
  const [toast, setToast] = useState(null); // { message, type: 'error' | 'warning' | 'info' }

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);

  // Auditor can edit audit info only while timer is running
  const isAuditor = user?.role === 'auditor';
  const auditSectionDisabled = isAuditor ? !timerRunning : true;
  const auditReadOnly = isAuditor ? !timerRunning : true;

  // Upload section state
  const [activeTab] = useState("coding"); // default tab context
  const [dragActive, setDragActive] = useState({ document: false, image: false });
  const [uploads, setUploads] = useState({
    coding: { documents: [], imageGroups: [], texts: [] },
  });
  const [stagedImages, setStagedImages] = useState([]);
  const [groupLabel, setGroupLabel] = useState("");
  const [textInput, setTextInput] = useState("");

  const currentUploads = uploads[activeTab] || { documents: [], imageGroups: [], texts: [] };
  const currentTab = { icon: Upload, label: "Coding" };

  const getTabColor = (tab, variant) => {
    const colors = {
      light: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
    };
    return colors[variant] || "";
  };

  const acceptedDocumentTypes = ".pdf,.doc,.docx";

  const getFileTypeInfo = (type) => {
    if (type === "application/pdf") return { label: "PDF", color: "text-red-600", bgColor: "bg-red-50" };
    if (type?.includes("word") || type?.includes("doc")) return { label: "DOC", color: "text-blue-600", bgColor: "bg-blue-50" };
    return { label: "FILE", color: "text-slate-600", bgColor: "bg-slate-50" };
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleDrag = (e, zone, active) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [zone]: active }));
  };

  const processFiles = (files, type) => {
    const fileArray = Array.from(files);
    if (type === "documents") {
      const newDocs = fileArray.map((f) => ({
        id: Date.now() + Math.random(),
        name: f.name,
        size: formatFileSize(f.size),
        type: f.type,
        file: f,
      }));
      setUploads((prev) => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          documents: [...prev[activeTab].documents, ...newDocs],
        },
      }));
    } else if (type === "images") {
      const newImages = fileArray.map((f) => ({
        id: Date.now() + Math.random(),
        name: f.name,
        size: f.size,
        file: f,
        preview: URL.createObjectURL(f),
      }));
      setStagedImages((prev) => [...prev, ...newImages]);
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive({ document: false, image: false });
    if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files, type);
  };

  const handleFileInput = (e, type) => {
    if (e.target.files?.length) processFiles(e.target.files, type);
    e.target.value = "";
  };

  const removeItem = (type, itemId) => {
    setUploads((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [type]: prev[activeTab][type].filter((item) => item.id !== itemId),
      },
    }));
  };

  const removeStagedImage = (imgId) => {
    setStagedImages((prev) => {
      const img = prev.find((i) => i.id === imgId);
      if (img?.preview) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== imgId);
    });
  };

  const addImageGroup = () => {
    if (stagedImages.length === 0) return;
    const group = {
      id: Date.now(),
      label: groupLabel || `Group ${currentUploads.imageGroups.length + 1}`,
      images: stagedImages,
      totalSize: stagedImages.reduce((sum, img) => sum + img.size, 0),
    };
    setUploads((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        imageGroups: [...prev[activeTab].imageGroups, group],
      },
    }));
    setStagedImages([]);
    setGroupLabel("");
  };

  const removeImageGroup = (groupId) => {
    setUploads((prev) => {
      const group = prev[activeTab].imageGroups.find((g) => g.id === groupId);
      group?.images.forEach((img) => { if (img.preview) URL.revokeObjectURL(img.preview); });
      return {
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          imageGroups: prev[activeTab].imageGroups.filter((g) => g.id !== groupId),
        },
      };
    });
  };

  const addTextEntry = () => {
    if (!textInput.trim()) return;
    const entry = {
      id: Date.now(),
      text: textInput.trim(),
      preview: textInput.trim().slice(0, 120) + (textInput.trim().length > 120 ? "..." : ""),
    };
    setUploads((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        texts: [...prev[activeTab].texts, entry],
      },
    }));
    setTextInput("");
  };

  // MedEx AI data for this session
  const [aiData, setAiData] = useState(null);
  const [aiDataLoading, setAiDataLoading] = useState(false);
  const [aiNoSession, setAiNoSession] = useState(false);

  // Document processing API
  const DOCUMENT_PROCESS_URL = `${MEDX_API_URL}/documents/process`;
  const [uploadStatus, setUploadStatus] = useState(null); // null | 'uploading' | 'success' | 'error'
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [docViewerUrl, setDocViewerUrl] = useState(null); // for document popup
  const [docSidebarOpen, setDocSidebarOpen] = useState(true); // sidebar in popup
  const [popupMinimized, setPopupMinimized] = useState(false); // popup collapsed to mini sidebar
  const [popupSidebarView, setPopupSidebarView] = useState("documents"); // "documents" | "ai-summary"
  const [uploadSectionOpen, setUploadSectionOpen] = useState(false); // upload section collapsed/expanded

  // Review & Edit popup state
  const [reviewPopupOpen, setReviewPopupOpen] = useState(false);
  const [codeDecisions, setCodeDecisions] = useState({}); // { [code]: { status, editedCode?, editedDesc? } }
  const [selectedCode, setSelectedCode] = useState(null);
  const [editingCode, setEditingCode] = useState(null);
  const [reviewTab, setReviewTab] = useState("document"); // "document" | "ai-summary"
  const [reviewDocIndex, setReviewDocIndex] = useState(0); // which document to show in review popup
  const [customCodes, setCustomCodes] = useState([]); // user-added codes
  const [addingCode, setAddingCode] = useState(false); // whether the add-code form is open
  const [newCodeForm, setNewCodeForm] = useState({ code: '', description: '', type: 'icd', category: 'Secondary', reason: '', reasonOptionId: null, reasonOptionLabel: '' });
  const [reasonOptions, setReasonOptions] = useState([]); // all active options from backend

  // Map the display category string (e.g. "Admit Code", "Primary") to the backend canonical key
  const categoryToKey = (displayCategory) => {
    switch (displayCategory) {
      case 'Admit Code':
      case 'Reason for Admit': return 'admit_code';
      case 'Primary': return 'primary_diagnosis';
      case 'Secondary': return 'secondary_diagnosis';
      case 'E/M Level': return 'em_level';
      case 'Procedure': return 'cpt';
      case 'Modifier': return 'modifier';
      default: return null;
    }
  };

  const reasonOptionsFor = (displayCategory, action) => {
    const key = categoryToKey(displayCategory);
    if (!key) return [];
    return reasonOptions.filter(o => o.category === key && o.action === action);
  };
  const [addingRule, setAddingRule] = useState(false);
  const [newRuleForm, setNewRuleForm] = useState({ rule_text: '', applies_to: 'ALL', priority: 'NORMAL' });
  const [ruleSubmitting, setRuleSubmitting] = useState(false);
  const [submitPopupOpen, setSubmitPopupOpen] = useState(false); // review & submit popup
  const [rejectingCode, setRejectingCode] = useState(null); // { _key, reason }
  const [confirmPopup, setConfirmPopup] = useState(null); // { type: 'success'|'error'|'warning', title, message }
  // Gold-dataset submit metadata — collected in the Review & Submit popup
  const [sessionConfidence, setSessionConfidence] = useState(8); // 1–10 coder confidence
  const [goldSpecialty, setGoldSpecialty] = useState(""); // overrides chart.Specialty if set

  // WebSocket job status tracking — recover jobId from upload result or from aiData on page reload
  const jobId = uploadResult?.jobId || aiData?.activeJobId || null;
  const { status: wsJobStatus, phase: wsJobPhase, message: wsJobMessage, isConnected: wsConnected } = useJobStatus(jobId);

  // Fall back to polled aiData when WebSocket is disconnected (fixes progress bar freezing)
  const jobStatus = wsJobStatus || aiData?.activeJobStatus || null;
  const jobPhase = wsJobPhase || aiData?.activeJobPhase || null;
  const jobMessage = wsJobMessage || null;

  // Phase progression for the visual tracker
  const PHASES = [
    { key: "pending", label: "Queued" },
    { key: "processing", label: "Processing" },
    { key: "ocr_started", label: "OCR Started" },
    { key: "ocr_completed", label: "OCR Done" },
    { key: "ai_started", label: "AI Analysis" },
    { key: "ai_completed", label: "AI Done" },
    { key: "saving_results", label: "Saving" },
    { key: "completed", label: "Completed" },
  ];

  const getPhaseIndex = (p) => {
    const idx = PHASES.findIndex((ph) => ph.key === p);
    return idx >= 0 ? idx : -1;
  };

  const currentPhaseIndex = getPhaseIndex(jobPhase);

  const processDocuments = async () => {
    const docs = currentUploads.documents;
    const imageGroups = currentUploads.imageGroups;
    const texts = currentUploads.texts;
    if (docs.length === 0 && imageGroups.length === 0 && texts.length === 0) return;

    setUploadStatus("uploading");
    setUploadResult(null);
    setUploadError(null);

    try {
      const formData = new FormData();
      const transactions = [];
      let fileIndex = 0;

      // Append document files (PDF / Word)
      docs.forEach((doc) => {
        formData.append("files", doc.file);
        transactions.push({
          type: doc.type === "application/pdf" ? "pdf" : "doc",
          fileIndex: fileIndex++,
          label: doc.name,
        });
      });

      // Append image group files — each group shares a transaction ID
      imageGroups.forEach((group) => {
        const fileIndices = [];
        group.images.forEach((img) => {
          formData.append("files", img.file);
          fileIndices.push(fileIndex++);
        });
        transactions.push({
          type: "image_group",
          fileIndices,
          label: group.label,
        });
      });

      // Append clinical text entries as plain-text files (skip OCR on backend)
      texts.forEach((entry, i) => {
        const blob = new Blob([entry.text], { type: "text/plain" });
        const textFile = new File([blob], `clinical-text-${i + 1}.txt`, { type: "text/plain" });
        formData.append("files", textFile);
        transactions.push({
          type: "text",
          fileIndex: fileIndex++,
          label: `Clinical Text ${i + 1}`,
        });
      });

      formData.append("sessionId", id);
      formData.append("documentType", "ed-notes");
      formData.append("mrn", chart?.MR_No || "");
      formData.append("chartNumber", chart?.ChartNo || "");
      formData.append("facility", chart?.Facility || "");
      formData.append("specialty", chart?.Specialty || "");
      formData.append("dateOfService", chart?.DateOfService || "");
      formData.append("provider", "");
      formData.append("transactions", JSON.stringify(transactions));

      const token = localStorage.getItem("token");
      const response = await axios.post(DOCUMENT_PROCESS_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.data.success) {
        setUploadStatus("success");
        setUploadResult(response.data);
        // Refetch AI data so aiStatus becomes 'queued'/'processing',
        // enabling the REST polling fallback if WebSocket misses updates
        fetchAiData();
      } else {
        setUploadStatus("error");
        setUploadError(response.data.message || "Upload failed");
      }
    } catch (e) {
      console.error("Document upload failed:", e);
      setUploadStatus("error");
      setUploadError(e.response?.data?.message || e.message || "Upload failed");
    }
  };

  const toDateInput = (val) => {
    if (!val) return "";
    const d = new Date(val);
    if (isNaN(d)) return "";
    return d.toISOString().slice(0, 10);
  };

  const fetchChart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/charts/${id}`);
      if (response.data.success) {
        const c = response.data.data;
        setChart(c);
        setFormData({
          chartNo: c.ChartNo || "",
          mrNo: c.MR_No || "",
          dateOfService: toDateInput(c.DateOfService),
          admitDate: toDateInput(c.AdmitDate),
          dischargeDate: c.DischargeDate || "",
          disposition: c.Disposition || "",
          em: c.EM || "",
          primaryDiagnosis: c.PrimaryDiagnosis || "",
          primaryHealth: c.PrimaryHealth || "",
          facility: c.Facility || "",
          poa: c.poa || "",
          los: c.los || "",
          drgValue: c.drg_value || "",
          procedureCode: c.procedure_code || "",
          subSpecialty: c.SubSpecialty || "",
          chartStatus: c.Status || "",
          responsibleParty: c.ResponsibleParty ? (Array.isArray(c.ResponsibleParty) ? c.ResponsibleParty : c.ResponsibleParty.split(",").map(s => s.trim()).filter(Boolean)) : [],
          holdReason: c.HoldReason ? (Array.isArray(c.HoldReason) ? c.HoldReason : c.HoldReason.split(",").map(s => s.trim()).filter(Boolean)) : [],
          coderComments: c.CoderComments || "",
          rejectionComments: c.RejectionComments || "",
          deficiencyComments: c.DeficiencyComments || "",
          auditOption: c.AuditOption ? (Array.isArray(c.AuditOption) ? c.AuditOption : c.AuditOption.split(",").map(s => s.trim()).filter(Boolean)) : [],
          qcStatus: c.qc_status || "",
          priority: c.Priority || null,
          feedbackType: c.FeedbackType || "",
          auditorQcStatus: c.AuditorQcStatus || "",
          allocateAuditor: c.AllocateAuditor || "",
          allocateCoder: c.AllocateCoder || "",
          auditAllocateCoder: c.AuditAllocateCoder || "",
        });
        fetchCustomFields(c.ClientId, c.LocationId);
        fetchConfiguration(c.ClientId, c.LocationId);
        fetchMasterData(c.ClientId, c.LocationId);
        fetchFeedbackCategories(c.ClientId, c.LocationId);
      } else {
        setError("Failed to load chart data");
      }
    } catch (e) {
      console.error("Failed to fetch chart:", e.message);
      setError("Failed to load chart data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchAiData = useCallback(async () => {
    setAiDataLoading(true);
    setAiNoSession(false);
    try {
      const response = await axios.get(`${MEDX_API_URL}/charts/session/${id}`, {
        headers: {
          ...(localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {}),
        },
      });
      if (response.data.success) {
        setAiData(response.data.chart);
        setAiNoSession(false);
      } else {
        setAiData(null);
        setAiNoSession(true);
      }
    } catch (e) {
      // No AI data for this session yet
      setAiData(null);
      setAiNoSession(true);
      console.log("No AI data found for session:", id);
    } finally {
      setAiDataLoading(false);
    }
  }, [id]);

  const fetchConfiguration = useCallback(async (clientId = 0, locationId = 1) => {
    try {
      const response = await api.get(
        `https://uat-app.valerionhealth.com/integrations/ai/users/getcongfiguration/0/${locationId}`
      );
      if (response.data.success) {
        setConfig(response.data.data);
      }
    } catch (e) {
      console.error("Failed to fetch configuration:", e.message);
    }
  }, []);

  const fetchMasterData = useCallback(async (clientId = 0, locationId = 0) => {
    try {
      const response = await api.get("/hn-master-data", {
        params: { client: clientId, location: locationId },
      });
      if (response.data.success) {
        setMasterData(response.data.data);
      }
    } catch (e) {
      console.error("Failed to fetch master data:", e.message);
    }
  }, []);

  const fetchCustomFields = useCallback(async (clientId, locationId) => {
    try {
      const response = await api.get(`/users/configurations/chart-custom-fields/${clientId}/${locationId}`);
      if (response.data?.data) {
        setCustomFields(response.data.data);
      }
    } catch (e) {
      console.error("Failed to fetch custom fields:", e.message);
    }
  }, []);

  const fetchFeedbackCategories = useCallback(async (clientId, locationId) => {
    try {
      const response = await api.get(
        `https://uat-app.valerionhealth.com/integrations/ai/users/configuration/feedback-categories/${clientId}/${locationId}`
      );
      if (response.data?.success) {
        setFeedbackCategories(response.data.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch feedback categories:", e.message);
    }
  }, []);

  // Fetch comments for this chart
  const fetchComments = useCallback(async () => {
    try {
      const response = await api.get(`/charts/${id}/comments`);
      if (response.data?.success) {
        setComments(response.data.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch comments:", e.message);
    }
  }, [id]);

  // Post a new comment
  const postComment = async () => {
    const msg = commentText.trim();
    if (!msg || postingComment) return;
    setPostingComment(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `https://uat-app.valerionhealth.com/integrations/ai/charts/${id}/comments`,
        { comment_msg: msg, UserId: profile?.id, edit: false },
        { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } }
      );
      setCommentText("");
      fetchComments();
    } catch (e) {
      console.error("Failed to post comment:", e.message);
      showToast("Failed to post comment. Please try again.", "error");
    } finally {
      setPostingComment(false);
    }
  };

  // Check if a chart is under process on page load
  const checkTimerStatus = useCallback(async () => {
    try {
      const [procRes, statsRes] = await Promise.all([
        api.get("/users/processing-chart"),
        api.get("/charts/user-stats", { params: { client: 0, location: 0 } }),
      ]);
      if (procRes.data?.success) {
        setIsAnotherChartProcessing(procRes.data.isChartUnderProcess);
      }
      if (statsRes.data?.success) {
        setCurrentChartStats(statsRes.data.data?.current_chart_stats || null);
      }
    } catch (e) {
      console.error("Failed to check timer status on load:", e.message);
    }
  }, []);

  // Reset stale state when navigating to a different chart
  useEffect(() => {
    setUploadResult(null);
    setUploadStatus(null);
    setUploadError(null);
    setAiData(null);
    setAiNoSession(false);
    setUploads({ coding: { documents: [], imageGroups: [], texts: [] } });
    setStagedImages([]);
    setGroupLabel("");
    setTextInput("");
    setComments([]);
    setCommentText("");
    aiAutoFillDone.current = false;
    setAiFilledFields(new Set());
  }, [id]);

  useEffect(() => {
    fetchChart();
    fetchAiData();
    checkTimerStatus();
    fetchComments();
  }, [fetchChart, fetchAiData, checkTimerStatus, fetchComments]);

  useEffect(() => {
    listReasonOptions()
      .then(setReasonOptions)
      .catch((err) => console.warn('Failed to load reason options:', err?.message));
  }, []);

  // Combined timer logic: decide timer state from MilestoneId + isAnotherChartProcessing + userStats
  useEffect(() => {
    if (!chart || isAnotherChartProcessing === null) return;

    // If coding is already done (MilestoneId === 4), block timer entirely
    if (chart.MilestoneId === 4) {
      setTimerSeconds(0);
      setTimerRunning(false);
      setTimerStopped(true);
      setTimerStartTime(null);
      setTimerMessage("Coding is already done for this chart");
      return;
    }

    // Check if THIS chart is the one currently being processed (via userstats)
    const isThisChartActive = currentChartStats?.chartId?.toString() === id?.toString()
      && currentChartStats?.timer;

    if (chart.MilestoneId === 3 || isThisChartActive) {
      // Chart is being coded — compute elapsed from server timestamp
      // Prefer chart.timer, fall back to userstats timer
      const timerValue = chart.timer || (isThisChartActive ? currentChartStats.timer : null);
      if (timerValue) {
        const serverStart = new Date(timerValue).getTime();
        const elapsed = Math.max(0, Math.floor((Date.now() - serverStart) / 1000));
        setTimerSeconds(elapsed);
      } else {
        setTimerSeconds(0);
      }
      setTimerRunning(true);
      setTimerStopped(false);
      setTimerStartTime(now());
      setTimerMessage("");
    } else {
      // Chart is NOT under coding
      setTimerSeconds(0);
      setTimerRunning(false);
      setTimerStopped(true);
      setTimerStartTime(null);
      if (isAnotherChartProcessing) {
        setTimerMessage("Another chart is in process");
      } else {
        setTimerMessage("");
      }
    }
  }, [chart, isAnotherChartProcessing, currentChartStats, id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch AI data when job completes
  useEffect(() => {
    if (jobStatus === "completed") {
      fetchAiData();
    }
  }, [jobStatus, fetchAiData]);

  // Poll aiData while aiStatus is processing/queued (handles page refresh mid-processing)
  useEffect(() => {
    if (!aiData) return;
    const status = aiData.aiStatus;
    if (status !== 'processing' && status !== 'queued') return;

    const interval = setInterval(() => {
      fetchAiData();
    }, 5000);

    return () => clearInterval(interval);
  }, [aiData?.aiStatus, fetchAiData]);

  // Auto-fill form fields from AI results once both chart and AI data are loaded.
  // Uses setFormData(prev => ...) to read the LATEST form state (avoids stale closure
  // from race between fetchChart and fetchAiData). Ref prevents duplicate fills.
  useEffect(() => {
    if (!aiData || aiData.aiStatus !== 'ready' || !chart) return;
    if (aiAutoFillDone.current) return;
    aiAutoFillDone.current = true;

    // Extract AI values
    const primaryDx = aiData.diagnosisCodes?.primary_diagnosis?.[0]
      || aiData.diagnosisCodes?.principal_diagnosis;
    const firstProc = aiData.procedures?.[0];
    const emLevel = aiData.diagnosisCodes?.ed_em_level?.[0];

    const primaryCode = primaryDx?.icd_10_code || primaryDx?.code || '';
    const primaryDesc = primaryDx?.description || primaryDx?.finding || '';
    const procCode = firstProc?.cpt_code || firstProc?.code || '';
    const emCode = emLevel?.icd_10_code || emLevel?.code || '';

    // Use functional update to read latest formData (not stale closure)
    setFormData(prev => {
      const updates = {};
      const filled = new Set();

      if (primaryCode && !prev.primaryDiagnosis) {
        updates.primaryDiagnosis = primaryCode;
        filled.add('primaryDiagnosis');
      }
      if (procCode && !prev.procedureCode) {
        updates.procedureCode = procCode;
        filled.add('procedureCode');
      }
      if (emCode && !prev.em) {
        updates.em = emCode;
        filled.add('em');
      }

      if (filled.size > 0) {
        setAiFilledFields(prev => new Set([...prev, ...filled]));
        return { ...prev, ...updates };
      }
      return prev;
    });
  }, [aiData?.aiStatus, chart]); // eslint-disable-line react-hooks/exhaustive-deps

  // Timer logic
  useEffect(() => {
    let interval;
    if (timerRunning) {
      interval = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Persist timer state to localStorage
  useEffect(() => {
    const data = { seconds: timerSeconds, running: timerRunning, startTime: timerStartTime, stopTime: timerStopTime, stopped: timerStopped };
    if (timerRunning) data.runStartedAt = Date.now();
    localStorage.setItem(timerStorageKey, JSON.stringify(data));
  }, [timerSeconds, timerRunning, timerStartTime, timerStopTime, timerStopped, timerStorageKey]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m} : ${s}`;
  };

  const formatTimeShort = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const now = () => {
    const d = new Date();
    return d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });
  };

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (saving) return;

    const missing = [];

    if (isAuditor) {
      // Auditor: only validate audit information section fields
      if (!formData.feedbackType) missing.push("Feedback Type");
      if (!formData.auditorQcStatus) missing.push("Auditor QC Status");
      if (formData.auditorQcStatus === "Feedback Provided" && !formData.auditAllocateCoder) missing.push("Allocate to Coder");
    } else {
      // --- Required field validation (driven by chartFieldConfiguration) ---
      // Helper: only validate fields that are both visible (not "NA") and currently enabled
      const reqVisible = (key) => isFieldVisible(key) && isFieldRequired(key);
      const chartStatus = formData.chartStatus || "Open";
      const isComplete = chartStatus === "Complete";
      const isIncomplete = chartStatus === "Incomplete";

      if (reqVisible("chart_no") && !formData.chartNo) missing.push("Chart #");
      if (reqVisible("mr_no") && !formData.mrNo) missing.push("MR#");
      if (reqVisible("date_of_service") && !formData.dateOfService) missing.push("Date of Service");
      if (reqVisible("discharge_date") && !formData.dischargeDate) missing.push("Discharge Date");
      const dispositionOpts = config?.dispositions || [];
      const primaryHealthOpts = config?.primary_health || [];
      const facilityOpts = config?.facility || [];
      const subSpecialtyOpts = config?.subspecialties || [];

      if (reqVisible("disposition") && dispositionOpts.length > 0 && !formData.disposition) missing.push("Disposition");
      if (reqVisible("em") && !formData.em) missing.push("EM");
      if (reqVisible("primary_diagnosis") && !formData.primaryDiagnosis) missing.push("Primary Diagnosis");
      if (reqVisible("primary_health") && primaryHealthOpts.length > 0 && !formData.primaryHealth) missing.push("Primary Health Plan");
      if (reqVisible("facility") && facilityOpts.length > 0 && !formData.facility) missing.push("Facility");
      if (reqVisible("poa") && !formData.poa) missing.push("POA");
      if (reqVisible("los") && !formData.los) missing.push("LOS");
      if (reqVisible("drg") && !formData.drgValue) missing.push("DRG Value");
      if (reqVisible("procedure_code") && !formData.procedureCode) missing.push("Procedure Code");
      if (reqVisible("sub_specialty") && subSpecialtyOpts.length > 0 && !formData.subSpecialty) missing.push("Sub Specialty");
      if (reqVisible("chart_status") && (chartStatus === "Open")) missing.push("Chart Status");
      if (isIncomplete && (!formData.holdReason || formData.holdReason.length === 0)) missing.push("Hold Reason");
      // Coder comments are disabled when status is Complete — skip validation in that case
      if (reqVisible("coder_comments") && !isComplete && (!formData.coderComments || !formData.coderComments.trim())) missing.push("Coder Comments");
      if (reqVisible("rejection_comments") && (!formData.rejectionComments || !formData.rejectionComments.trim())) missing.push("Rejection Comments");
      if (reqVisible("deficiency_comments") && (!formData.deficiencyComments || !formData.deficiencyComments.trim())) missing.push("Deficiency Comments");
      if (reqVisible("responsible_parties") && (!formData.responsibleParty || formData.responsibleParty.length === 0)) missing.push("Responsible Party");

      // Custom mandatory fields
      for (const field of customFields) {
        if (field.validation === "Mandatory") {
          const val = customFieldValues[field.id];
          // Skip mandatory check for dropdowns with no options
          if (field.type === "dropdown") {
            const dropdownOpts = field.ChartInfoDropdowns || [];
            if (dropdownOpts.length === 0) continue;
            if (field.isMultiSelect) {
              if (!val || !Array.isArray(val) || val.length === 0) missing.push(field.name);
            } else {
              if (!val) missing.push(field.name);
            }
          } else {
            if (!val) missing.push(field.name);
          }
        }
      }
    }

    if (missing.length > 0) {
      showToast("Required fields missing: " + missing.join(", "));
      return;
    }

    setSaving(true);
    try {
      if (isAuditor) {
        // Helper to resolve feedback IDs from config by name
        const feedId = (feedKey, name) => config?.[feedKey]?.find(f => f.feedback_name === name)?.id || null;
        const feedIds = (feedKey, names) => (names || []).map(n => feedId(feedKey, n)).filter(Boolean);

        // Resolve next_user_id from auditAllocateCoder
        const auditCoder = masterData?.coders?.find(c => `${c.first_name} ${c.last_name}` === formData.auditAllocateCoder);
        const auditNextUserId = auditCoder?.id || null;

        // Resolve FeedbackTypeId
        const feedbackTypeId = config?.feedback_types?.find(f => f.feed_type_name === formData.feedbackType)?.id || null;

        // Resolve QCStatusId
        const auditQcStatusId = masterData?.qc_status?.find(q =>
          q.name === formData.auditorQcStatus || (formData.auditorQcStatus === "Agreed" && q.name === "Agree")
        )?.id || null;

        // Compute totals
        const allKeys = [...AUDIT_ROWS.map(r => r.key), ...feedbackCategories.map(c => `feedbackCat_${c.id}`)];
        const totalTotal = allKeys.reduce((sum, k) => sum + (parseInt(auditData[k]?.totalCodes, 10) || 0), 0);
        const totalCorrect = allKeys.reduce((sum, k) => sum + (parseInt(auditData[k]?.correctCodes, 10) || 0), 0);

        const auditPayload = {
          prim_diag_total: parseInt(auditData.primaryDiagnosis?.totalCodes, 10) || 0,
          prim_diag_correct: parseInt(auditData.primaryDiagnosis?.correctCodes, 10) || 0,
          PrimDiagFeedbacks: feedId("prim_diag_feed", auditData.primaryDiagnosis?.feedbackCategory),
          sec_diag_total: parseInt(auditData.secondaryDiagnosis?.totalCodes, 10) || 0,
          sec_diag_correct: parseInt(auditData.secondaryDiagnosis?.correctCodes, 10) || 0,
          SecDiagFeedbacks: feedIds("sec_diag_feed", auditData.secondaryDiagnosis?.feedbackCategory),
          proc_total: parseInt(auditData.procedures?.totalCodes, 10) || 0,
          proc_correct: parseInt(auditData.procedures?.correctCodes, 10) || 0,
          ProceduresFeedbacks: feedIds("procedure_feed", auditData.procedures?.feedbackCategory),
          ed_em_total: parseInt(auditData.edEmLevel?.totalCodes, 10) || 0,
          ed_em_correct: parseInt(auditData.edEmLevel?.correctCodes, 10) || 0,
          EdEmFeedbacks: feedId("ed_em_feed", auditData.edEmLevel?.feedbackCategory),
          modifier_total: parseInt(auditData.modifier?.totalCodes, 10) || 0,
          modifier_correct: parseInt(auditData.modifier?.correctCodes, 10) || 0,
          ModifierFeedbacks: feedIds("modifier_feed", auditData.modifier?.feedbackCategory),
          poa_total: parseInt(auditData.poaIndicator?.totalCodes, 10) || 0,
          poa_correct: parseInt(auditData.poaIndicator?.correctCodes, 10) || 0,
          POAFeedbacks: feedIds("poa_feed", auditData.poaIndicator?.feedbackCategory),
          drg_total: parseInt(auditData.drgValue?.totalCodes, 10) || 0,
          drg_correct: parseInt(auditData.drgValue?.correctCodes, 10) || 0,
          DrugFeedbacks: feedIds("drug_feed", auditData.drgValue?.feedbackCategory),
          total_total: totalTotal,
          total_correct: totalCorrect,
          FeedbackTypeId: feedbackTypeId,
          QCStatusId: auditQcStatusId,
          next_user_id: auditNextUserId,
          comment_msg: "",
        };

        // Build v2 payload from dynamic feedback category rows
        const v2Payload = {};
        for (const cat of feedbackCategories) {
          const catKey = `feedbackCat_${cat.id}`;
          const catData = auditData[catKey];
          const selectedDropdown = cat.FeedbackCategoryDropdowns?.find(d => d.name === catData?.feedbackCategory);
          v2Payload[cat.name] = {
            totalCodes: parseInt(catData?.totalCodes, 10) || 0,
            correctCodes: parseInt(catData?.correctCodes, 10) || 0,
            FeedbackCategoryId: selectedDropdown?.id || null,
          };
        }

        await Promise.all([
          api.post(
            `https://uat-app.valerionhealth.com/integrations/ai/charts/${id}/audit-info`,
            auditPayload
          ),
          api.post(
            `https://uat-app.valerionhealth.com/integrations/ai/v2/charts/${id}/audit-info`,
            v2Payload
          ),
        ]);
        showToast("Audit information saved successfully!", "success");
      } else {
        // Resolve next_user_id from allocateCoder or allocateAuditor
        let nextUserId = null;
        if (formData.allocateCoder) {
          const coder = masterData?.coders_active?.find(c => c.name === formData.allocateCoder);
          nextUserId = coder?.id || null;
        } else if (formData.allocateAuditor) {
          const auditor = masterData?.auditors_active?.find(a => a.name === formData.allocateAuditor);
          nextUserId = auditor?.id || null;
        }

        // Resolve IDs from config
        const dispositionId = config?.dispositions?.find(d => d.disposition_name === formData.disposition)?.id || null;
        const facilityId = config?.facility?.find(f => f.FacilityName === formData.facility)?.id || null;
        const primaryHealthId = config?.primary_health?.find(p => p.PrimaryHealthName === formData.primaryHealth)?.id || null;
        const subSpecialtyId = config?.subspecialties?.find(s => s.SubSpecialtyName === formData.subSpecialty)?.id || null;
        const statusId = formData.chartStatus === "Complete" ? 2 : formData.chartStatus === "Incomplete" ? 3 : null;
        const qcStatusId = masterData?.qc_status?.find(q => q.name === formData.qcStatus)?.id || null;
        const responsiblePartyIds = (formData.responsibleParty || []).map(name => config?.responsible_parties?.find(r => r.resp_party_name === name)?.id).filter(Boolean);
        const holdReasonIds = (formData.holdReason || []).map(name => config?.hold_reasons?.find(h => h.hold_reason === name)?.id).filter(Boolean);
        const auditOptionIds = (formData.auditOption || []).map(name => config?.audit_options?.find(a => a.audit_opt === name)?.id).filter(Boolean);

        const payload = {
          admit_date: formData.admitDate ? new Date(formData.admitDate + "T00:00:00").toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : null,
          chart_no: formData.chartNo || null,
          coder_comments: null,
          date_of_completion: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
          date_of_service: formData.dateOfService ? new Date(formData.dateOfService + "T00:00:00").toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : null,
          discharge_date: formData.dischargeDate || null,
          em: formData.em || null,
          mr_no: formData.mrNo || null,
          primary_diagnosis: formData.primaryDiagnosis || null,
          next_user_id: nextUserId,
          poa: formData.poa || null,
          los: formData.los ? Number(formData.los) : null,
          drg_value: formData.drgValue ? Number(formData.drgValue) : null,
          procedure_code: formData.procedureCode || null,
          denial_comments: formData.rejectionComments || null,
          ResponsibleParties: responsiblePartyIds,
          deficiency_comments: formData.deficiencyComments || null,
          HoldReasons: holdReasonIds,
          DispositionId: dispositionId,
          FacilityId: facilityId,
          PrimaryHealthId: primaryHealthId,
          SubSpecialtyId: subSpecialtyId,
          StatusId: statusId,
          AuditOptions: auditOptionIds,
          QCStatusId: qcStatusId,
          // qc_status_id: qcStatusId,
          comment_msg: formData.coderComments || null,
          chartInfoCustomFields: customFieldValues,
        };

        await api.post(`/charts/${id}`, payload);
        showToast("Chart saved successfully!", "success");
      }
    } catch (e) {
      console.error("Failed to save chart:", e.message);
      showToast("Failed to save chart. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTimerStart = async () => {
    if (timerRunning) return;

    // Block if coding is already done
    if (chart?.MilestoneId === 4) {
      showToast("Coding is already done for this chart.", "warning");
      return;
    }

    if (isAuditor) {
      // Auditor flow: verify this chart is assigned to the auditor
      if (chart?.UserId !== profile?.id) {
        showToast("You are not assigned to this chart.", "warning");
        return;
      }
      // Auditors skip document upload check
    } else {
      // Coder flow: check if documents are uploaded
      if (aiNoSession || !aiData?.documents || aiData.documents.length === 0) {
        showToast("Please upload documents before starting the timer.", "warning");
        return;
      }
    }

    // Check if another chart is already being processed
    try {
      const res = await api.get("/users/processing-chart");
      if (res.data?.success && res.data?.isChartUnderProcess) {
        showToast("You already have a chart under process. Please complete or release it before starting a new one.", "warning");
        return;
      }
    } catch (e) {
      console.error("Failed to check processing-chart status:", e.message);
      showToast("Unable to verify processing status. Please try again.", "error");
      return;
    }

    // Call timer API to register start on backend
    try {
      const timerRes = await api.post(`/charts/${id}/timer`);
      if (!timerRes.data?.success) {
        showToast(timerRes.data?.message || "Failed to start timer. Please try again.", "warning");
        return;
      }
    } catch (e) {
      console.error("Failed to start timer:", e.message);
      showToast(e.response?.data?.message || "Failed to start timer. Please try again.", "error");
      return;
    }

    // All checks passed and backend confirmed — start the local timer
    setTimerRunning(true);
    setTimerStopped(false);
    setTimerStartTime(now());
    setTimerStopTime(null);
    setTimerMessage("");

    // Auto-fill Primary Diagnosis total codes with 1
    setAuditData(prev => ({
      ...prev,
      primaryDiagnosis: {
        ...prev.primaryDiagnosis,
        totalCodes: prev.primaryDiagnosis?.totalCodes || "1",
      },
    }));
  };

  const handleTimerStop = async () => {
    if (!timerRunning) return;

    // Call timer API to register stop on backend
    try {
      const timerRes = await api.post(`/charts/${id}/timer`);
      if (!timerRes.data?.success) {
        const msg = timerRes.data?.message;
        if (msg === "Chart status has to be updated") {
          showToast("Please save the chart before stopping the timer.", "warning");
        } else {
          showToast(msg || "Failed to stop timer. Please try again.", "warning");
        }
        return;
      }
    } catch (e) {
      console.error("Failed to stop timer:", e.message);
      const msg = e.response?.data?.message;
      if (msg === "Chart status has to be updated") {
        showToast("Please save the chart before stopping the timer.", "warning");
      } else {
        showToast(msg || "Failed to stop timer. Please try again.", "error");
      }
      return;
    }

    // Backend confirmed — stop local timer and reset
    setTimerRunning(false);
    setTimerStopTime(now());
    setTimerSeconds(0);
    setTimerStopped(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: 80, textAlign: "center", color: "#8c919a" }}>
          <div style={{
            width: 40, height: 40, border: "3px solid #f0f1f3",
            borderTopColor: "#f5a623", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
          }} />
          Loading chart...
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !chart) {
    return (
      <DashboardLayout>
        <div style={{ padding: 80, textAlign: "center" }}>
          <p style={{ color: "#ef4444", fontSize: 16, marginBottom: 16 }}>{error || "Chart not found"}</p>
          <button onClick={() => navigate(-1)} style={{
            padding: "10px 24px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg, #f5a623, #f7b731)",
            color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}>Go Back</button>
        </div>
      </DashboardLayout>
    );
  }

  const userName = [chart.UserFirstName, chart.UserLastName].filter(Boolean).join(" ");

  // Resolve the chart's SpecialtyId from config specialties by name
  const chartSpecialtyId = config?.specialties?.find(s => s.spec_name === chart?.Specialty)?.id || 0;

  // Helper: get field validation from chartFieldConfiguration
  // Returns "M" (mandatory), "NM" (not mandatory), or "NA" (not applicable / hidden)
  // Specialty-specific entries (SpecialtyId matches chart) override the default (SpecialtyId === 0)
  const getFieldValidation = (fieldName) => {
    const entries = config?.chartFieldConfiguration?.filter(f => f.field === fieldName) || [];
    // Try specialty-specific first
    const specific = entries.find(f => f.SpecialtyId === chartSpecialtyId && chartSpecialtyId !== 0);
    if (specific) return specific.validation;
    // Fallback to default (SpecialtyId === 0)
    const defaultEntry = entries.find(f => f.SpecialtyId === 0);
    return defaultEntry?.validation || "NM"; // default to not mandatory if no config
  };

  // Convenience: whether a field should be visible (not "NA") and whether it's required ("M")
  const isFieldVisible = (fieldName) => getFieldValidation(fieldName) !== "NA";
  const isFieldRequired = (fieldName) => getFieldValidation(fieldName) === "M";

  const renderCustomFields = (placement) => {
    const fields = customFields.filter(f => f.placement === placement);
    if (fields.length === 0) return null;
    const rows = [];
    for (let i = 0; i < fields.length; i += 3) {
      rows.push(fields.slice(i, i + 3));
    }
    const isReadOnly = placement === "Audit Info" ? auditReadOnly : timerStopped;
    return rows.map((row, rowIdx) => (
      <div key={`cf-${placement}-${rowIdx}`} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 16 }}>
        {row.map(field => {
          const isRequired = field.validation === "Mandatory";
          const options = field.ChartInfoDropdowns?.map(item => ({ value: item.name, label: item.name })) || [];
          if (field.type === "dropdown" && field.isMultiSelect) {
            return (
              <div key={field.id} style={{ flex: 1, minWidth: 0 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
                  {field.name}{isRequired && <span style={{ color: "#ef4444" }}> *</span>}
                </label>
                <FormFieldMultiSelect
                  value={customFieldValues[field.id] || []}
                  onChange={(v) => updateCustomField(field.id, v)}
                  options={options}
                  placeholder="Select..."
                  readOnly={isReadOnly}
                />
              </div>
            );
          }
          if (field.type === "dropdown") {
            return (
              <FormField
                key={field.id}
                label={field.name}
                value={customFieldValues[field.id] || ""}
                required={isRequired}
                type="select"
                options={options}
                placeholder="Select..."
                readOnly={isReadOnly}
                onChange={(v) => updateCustomField(field.id, v)}
              />
            );
          }
          return (
            <FormField
              key={field.id}
              label={field.name}
              value={customFieldValues[field.id] || ""}
              required={isRequired}
              type={field.type === "number" ? "number" : "text"}
              readOnly={isReadOnly}
              onChange={(v) => updateCustomField(field.id, v)}
            />
          );
        })}
        {row.length < 3 && Array.from({ length: 3 - row.length }).map((_, i) => <div key={`empty-${i}`} />)}
      </div>
    ));
  };

  return (
    <DashboardLayout>
      {/* Toast notification */}
      {toast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 9999,
          padding: "14px 20px", borderRadius: 12, maxWidth: 400,
          background: toast.type === "warning" ? "#fef3c7" : toast.type === "error" ? "#fef2f2" : "#eff6ff",
          border: `1px solid ${toast.type === "warning" ? "#f59e0b" : toast.type === "error" ? "#ef4444" : "#3b82f6"}`,
          color: toast.type === "warning" ? "#92400e" : toast.type === "error" ? "#991b1b" : "#1e40af",
          fontSize: 13, fontWeight: 500, boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          display: "flex", alignItems: "flex-start", gap: 10,
          animation: "slideInRight 0.3s ease-out",
        }}>
          <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
            {toast.type === "warning" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            ) : toast.type === "error" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
            )}
          </span>
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button onClick={() => setToast(null)} style={{
            background: "none", border: "none", cursor: "pointer", fontSize: 16,
            color: "inherit", padding: 0, lineHeight: 1, opacity: 0.6,
          }}>&times;</button>
        </div>
      )}
      <style>{`@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
      <div style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

        {/* Previous / Next Chart buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <button
            onClick={() => prevId != null ? navigate(`/process-chart/${prevId}`) : navigate('/coder')}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 20px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg, #f5a623, #f7b731)",
              color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
              boxShadow: "0 2px 8px rgba(245,166,35,0.3)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            {prevId != null ? "Previous Chart" : "Back to Dashboard"}
          </button>
          <button
            onClick={() => nextId != null ? navigate(`/process-chart/${nextId}`) : navigate('/coder')}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 20px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg, #f5a623, #f7b731)",
              color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
              boxShadow: "0 2px 8px rgba(245,166,35,0.3)",
            }}
          >
            {nextId != null ? "Next Chart" : "Back to Dashboard"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* Main content grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>

          {/* ===== LEFT COLUMN ===== */}
          <div>
            {/* Chart Header Card */}
            <div style={{
              background: "#fff", borderRadius: 14, border: "1px solid #e8eaed",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: "24px", marginBottom: 20,
              display: "grid", gridTemplateColumns: "1fr auto", gap: 24,
            }}>
              {/* Left: Chart info */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1a1d23", margin: 0 }}>
                    Chart: {chart.ChartNo}
                  </h2>
                  <span style={{ fontSize: 13, color: "#64748b" }}>Priority</span>
                  <PriorityBadge priority={chart.Priority} />
                </div>

                {/* Metadata badges with SVG icons */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginBottom: 20 }}>
                  <MetaItem icon={<IconBuilding />}>Client: {chart.ClientName || "—"}</MetaItem>
                  <MetaItem icon={<IconGear />}>Process: {chart.Process || "—"}</MetaItem>
                  <MetaItem icon={<IconHospital />}>Primary Specialty: {chart.Specialty || "—"}</MetaItem>
                  <MetaItem icon={<IconMapPin />}>Location: {chart.Location || "—"}</MetaItem>
                  <MetaItem icon={<IconUser />}>Allocated User: {userName || "—"}</MetaItem>
                  <MetaItem icon={<IconClipboard />}>Sub Specialty: {chart.SubSpecialty || "—"}</MetaItem>
                  <MetaItem icon={<IconSearch />}>Qc status: {chart.qc_status || "—"}</MetaItem>
                </div>

                {/* Info grid row 1 */}
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0,
                  borderTop: "1px solid #f0f1f3", paddingTop: 16, marginBottom: 12,
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{chart.Worklist || "—"}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Worklist #</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{chart.Milestone || "—"}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Milestone</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{chart.Status || "—"}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Status</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{chart.auditedWeek || "—"}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Audited week</div>
                  </div>
                </div>

                {/* Info grid row 2 */}
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, marginBottom: 12,
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{chart.SNo || "—"}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>S. No.</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{chart.DateOfService || "—"}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Date of service</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{chart.ReceivedDate || "—"}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Received date</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{chart.DateOfCompletion || "—"}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Completion date</div>
                  </div>
                </div>

                {/* Info grid row 3 */}
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0,
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{chart.DateOfCoderAllocation || "NA"}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Date of Coder Allocation</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{chart.DateOfAuditorAllocation || "NA"}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Date of Auditor Allocation</div>
                  </div>
                </div>
              </div>

              {/* Right: Timer */}
              <div style={{
                background: "linear-gradient(135deg, #f5a623, #f7b731)",
                borderRadius: 14, padding: "24px 28px", minWidth: 180,
                display: "flex", flexDirection: "column", alignItems: "center",
                color: "#fff", textAlign: "center",
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>Timer</div>
                <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: 2, marginBottom: timerMessage ? 8 : 16 }}>
                  {formatTime(timerSeconds)}
                </div>
                {timerMessage && (
                  <div style={{
                    background: "rgba(255,255,255,0.25)", borderRadius: 20,
                    padding: "4px 14px", fontSize: 11, fontWeight: 600,
                    marginBottom: 12, color: "#fff", letterSpacing: 0.3,
                  }}>
                    {timerMessage}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <button onClick={handleTimerStart} disabled={!!timerMessage} style={{
                    padding: "8px 24px", borderRadius: 8, border: "none",
                    background: timerRunning || timerMessage ? "rgba(255,255,255,0.3)" : "#10b981",
                    color: "#fff", fontSize: 13, fontWeight: 600,
                    cursor: timerMessage ? "not-allowed" : "pointer",
                    opacity: timerMessage ? 0.6 : 1,
                  }}>Start</button>
                  <button onClick={handleTimerStop} style={{
                    padding: "8px 24px", borderRadius: 8, border: "none",
                    background: !timerRunning && timerStartTime ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.2)",
                    color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}>Stop</button>
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 11, opacity: 0.9 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>Start</div>
                    <div>{timerStartTime || "00:00"}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Stop</div>
                    <div>{timerStopTime || "00:00"}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Time</div>
                    <div>{formatTimeShort(timerSeconds)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Header — collapsible when documents exist */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden" style={{ marginBottom: 20 }}>
              <div
                className={`px-6 py-4 ${getTabColor(activeTab, 'light')} border-b ${getTabColor(activeTab, 'border')} cursor-pointer select-none`}
                onClick={() => setUploadSectionOpen(o => !o)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {React.createElement(currentTab.icon, { className: `w-5 h-5 ${getTabColor(activeTab, 'text')}` })}
                    <div>
                      <h2 className={`font-semibold ${getTabColor(activeTab, 'text')}`}>
                        {aiData?.documents?.length > 0 ? 'Upload More Documents' : 'Upload Medical Documents'}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {aiData?.documents?.length > 0
                          ? `${aiData.documents.length} document${aiData.documents.length !== 1 ? 's' : ''} uploaded — click to add more`
                          : 'Add documents (PDF, Word), grouped images, or paste clinical text'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {aiData?.documents?.length > 0 && !uploadSectionOpen && (
                      <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                        {aiData.documents.length} uploaded
                      </span>
                    )}
                    {uploadSectionOpen ? <ChevronUp className="w-5 h-5 text-amber-500" /> : <ChevronDown className="w-5 h-5 text-amber-500" />}
                  </div>
                </div>
              </div>

              <div className="p-6">
                {(uploadSectionOpen || (!aiData?.documents?.length)) && <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
                  {/* Document Upload (PDF + Word) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-50 to-blue-50 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-slate-600" />
                        </div>
                        <span className="font-medium text-slate-800 text-sm">Document Upload</span>
                      </div>
                      {currentUploads.documents.length > 0 && <span className="text-xs text-slate-500">{currentUploads.documents.length} file(s)</span>}
                    </div>

                    <div
                      className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer hover:border-slate-400 hover:bg-slate-50/50 ${dragActive.document ? 'border-slate-400 bg-slate-50/50' : 'border-slate-200'}`}
                      onDragEnter={(e) => handleDrag(e, 'document', true)}
                      onDragLeave={(e) => handleDrag(e, 'document', false)}
                      onDragOver={(e) => handleDrag(e, 'document', true)}
                      onDrop={(e) => handleDrop(e, 'documents')}
                    >
                      <input
                        type="file"
                        accept={acceptedDocumentTypes}
                        multiple
                        onChange={(e) => handleFileInput(e, 'documents')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <FileIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 font-medium">Drop documents here</p>
                      <p className="text-xs text-slate-400 mt-1">PDF or Word (.doc, .docx)</p>
                    </div>

                    {currentUploads.documents.length > 0 && (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {currentUploads.documents.map((file) => {
                          const fileInfo = getFileTypeInfo(file.type);
                          return (
                            <div key={file.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg group">
                              <div className={`w-6 h-6 rounded flex items-center justify-center ${fileInfo.bgColor}`}>
                                <FileText className={`w-3.5 h-3.5 ${fileInfo.color}`} />
                              </div>
                              <span className="text-xs text-slate-700 truncate flex-1">{file.name}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${fileInfo.bgColor} ${fileInfo.color}`}>
                                {fileInfo.label}
                              </span>
                              <span className="text-xs text-slate-400">{file.size}</span>
                              <button onClick={() => removeItem('documents', file.id)} className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Image Upload with Grouping */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Layers className="w-4 h-4 text-blue-500" />
                        </div>
                        <span className="font-medium text-slate-800 text-sm">Image Groups</span>
                      </div>
                      {currentUploads.imageGroups.length > 0 && (
                        <span className="text-xs text-slate-500">{currentUploads.imageGroups.length} group(s)</span>
                      )}
                    </div>

                    {/* Staging Area */}
                    <div className={`border-2 rounded-xl transition-all ${stagedImages.length > 0 ? 'border-blue-300 bg-blue-50/30' : 'border-dashed border-slate-200'}`}>
                      {/* Drop Zone */}
                      <div
                        className={`relative p-4 text-center transition-all cursor-pointer hover:bg-blue-50/50 ${dragActive.image ? 'bg-blue-50/50' : ''}`}
                        onDragEnter={(e) => handleDrag(e, 'image', true)}
                        onDragLeave={(e) => handleDrag(e, 'image', false)}
                        onDragOver={(e) => handleDrag(e, 'image', true)}
                        onDrop={(e) => handleDrop(e, 'images')}
                      >
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.tiff,.webp"
                          multiple
                          onChange={(e) => handleFileInput(e, 'images')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <FileImage className="w-6 h-6 text-blue-300 mx-auto mb-1" />
                        <p className="text-sm text-slate-600 font-medium">
                          {stagedImages.length > 0 ? 'Add more images' : 'Drop images here'}
                        </p>
                        <p className="text-xs text-slate-400">Multi-page documents</p>
                      </div>

                      {/* Staged Images Preview */}
                      {stagedImages.length > 0 && (
                        <div className="border-t border-blue-200 p-3 space-y-3">
                          <div className="flex items-center gap-2 text-xs text-blue-700 font-medium">
                            <Layers className="w-3.5 h-3.5" />
                            <span>Staging: {stagedImages.length} image(s)</span>
                          </div>

                          {/* Thumbnail Grid */}
                          <div className="grid grid-cols-4 gap-2">
                            {stagedImages.map((img) => (
                              <div key={img.id} className="relative group">
                                <img
                                  src={img.preview}
                                  alt={img.name}
                                  className="w-full h-14 object-cover rounded-lg border border-blue-200"
                                />
                                <button
                                  onClick={() => removeStagedImage(img.id)}
                                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Group Label & Add Button */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Group label (optional)"
                              value={groupLabel}
                              onChange={(e) => setGroupLabel(e.target.value)}
                              className="flex-1 px-3 py-1.5 text-xs border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                            <button
                              onClick={addImageGroup}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Add Group
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Added Image Groups */}
                    {currentUploads.imageGroups.length > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {currentUploads.imageGroups.map((group) => (
                          <div key={group.id} className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 group">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-slate-800">{group.label}</span>
                              </div>
                              <button
                                onClick={() => removeImageGroup(group.id)}
                                className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {group.images.slice(0, 4).map((img) => (
                                <img
                                  key={img.id}
                                  src={img.preview}
                                  alt={img.name}
                                  className="w-10 h-10 object-cover rounded-md border border-blue-200"
                                />
                              ))}
                              {group.images.length > 4 && (
                                <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                                  +{group.images.length - 4}
                                </div>
                              )}
                              <span className="ml-auto text-xs text-slate-500">
                                {group.images.length} page(s) • {(group.totalSize / 1024).toFixed(0)} KB
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Text Paste */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                          <ClipboardPaste className="w-4 h-4 text-emerald-500" />
                        </div>
                        <span className="font-medium text-slate-800 text-sm">Clinical Text</span>
                      </div>
                      {currentUploads.texts.length > 0 && <span className="text-xs text-slate-500">{currentUploads.texts.length} entry(s)</span>}
                    </div>

                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 transition-all focus-within:border-emerald-400 focus-within:bg-emerald-50/20">
                      <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Paste clinical text here..."
                        className="w-full h-20 text-sm text-slate-700 placeholder-slate-400 bg-transparent resize-none outline-none"
                      />
                      <div className="flex justify-end pt-2 border-t border-slate-100">
                        <button
                          onClick={addTextEntry}
                          disabled={!textInput.trim()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Entry
                        </button>
                      </div>
                    </div>

                    {currentUploads.texts.length > 0 && (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {currentUploads.texts.map((entry) => (
                          <div key={entry.id} className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg group">
                            <ClipboardPaste className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-slate-700 flex-1 line-clamp-2">{entry.preview}</span>
                            <button onClick={() => removeItem('texts', entry.id)} className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>}

                {/* Process Documents Button & Status */}
                <div className="mt-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={processDocuments}
                      disabled={(currentUploads.documents.length === 0 && currentUploads.imageGroups.length === 0 && currentUploads.texts.length === 0) || uploadStatus === "uploading"}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                    >
                      {uploadStatus === "uploading" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Process Documents
                        </>
                      )}
                    </button>

                    {uploadStatus === "error" && (
                      <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-4 py-2 rounded-xl border border-red-200">
                        <AlertCircle className="w-4 h-4" />
                        <span>{uploadError}</span>
                      </div>
                    )}
                  </div>

                  {/* Live Job Progress Bar (during active processing) */}
                  {jobId && jobStatus && jobStatus !== 'completed' && jobStatus !== 'failed' && (() => {
                    const progressPercent = jobStatus === 'failed' ? Math.round(((currentPhaseIndex >= 0 ? currentPhaseIndex : 0) / (PHASES.length - 1)) * 100)
                      : jobStatus === 'completed' ? 100
                        : currentPhaseIndex >= 0 ? Math.round(((currentPhaseIndex + 0.5) / (PHASES.length - 1)) * 100)
                          : 0;
                    const isFailed = jobStatus === 'failed';
                    const isComplete = jobStatus === 'completed';
                    const barColor = isFailed ? 'bg-red-500' : isComplete ? 'bg-emerald-500' : 'bg-amber-500';
                    const textColor = isFailed ? 'text-red-700' : isComplete ? 'text-emerald-700' : 'text-amber-700';

                    return (
                      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isComplete ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
                              isFailed ? <AlertCircle className="w-4 h-4 text-red-500" /> :
                                <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />}
                            <span className={`text-sm font-semibold ${textColor}`}>
                              {isComplete ? 'Processing Complete' : isFailed ? 'Processing Failed' : 'Processing...'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* <span className={`text-lg font-bold ${textColor}`}>{progressPercent}%</span> */}
                            <div className="flex items-center gap-1">
                              {wsConnected ? <Wifi className="w-3 h-3 text-emerald-500" /> : <WifiOff className="w-3 h-3 text-slate-400" />}
                            </div>
                          </div>
                        </div>

                        {/* Single progress bar */}
                        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${barColor} ${!isComplete && !isFailed ? 'animate-pulse' : ''}`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>

                        {jobMessage && (
                          <p className={`text-xs ${isFailed ? 'text-red-600' : 'text-slate-500'}`}>{jobMessage}</p>
                        )}
                      </div>
                    );
                  })()}

                  {/* AI Status & Uploaded Documents (from saved session data) */}
                  {aiData && (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      {/* AI Status Header */}
                      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${aiData.aiStatus === 'ready' ? 'bg-emerald-50' :
                            aiData.aiStatus === 'failed' ? 'bg-red-50' :
                              aiData.aiStatus === 'processing' || aiData.aiStatus === 'queued' ? 'bg-amber-50' :
                                'bg-slate-50'
                            }`}>
                            {aiData.aiStatus === 'ready' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> :
                              aiData.aiStatus === 'failed' ? <AlertCircle className="w-5 h-5 text-red-500" /> :
                                aiData.aiStatus === 'processing' || aiData.aiStatus === 'queued' ? <Loader2 className="w-5 h-5 text-amber-500 animate-spin" /> :
                                  <Clock className="w-5 h-5 text-slate-400" />}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-800">AI Processing</h4>
                            <p className="text-xs text-slate-500">
                              {aiData.aiStatus === 'ready' ? 'Completed — AI results available' :
                                aiData.aiStatus === 'failed' ? 'Failed — processing encountered an error' :
                                  aiData.aiStatus === 'processing' ? 'Processing — AI is analyzing documents' :
                                    aiData.aiStatus === 'queued' ? 'Queued — waiting for processing' :
                                      aiData.aiStatus === 'submitted' ? 'Submitted — codes sent to NextCode' :
                                        `Status: ${aiData.aiStatus}`}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${aiData.aiStatus === 'ready' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          aiData.aiStatus === 'failed' ? 'bg-red-50 text-red-700 border border-red-200' :
                            aiData.aiStatus === 'processing' || aiData.aiStatus === 'queued' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              aiData.aiStatus === 'submitted' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                'bg-slate-50 text-slate-600 border border-slate-200'
                          }`}>
                          {aiData.aiStatus?.toUpperCase()}
                        </span>
                      </div>

                      {/* Error Message */}
                      {aiData.aiStatus === 'failed' && aiData.lastError && (
                        <div className="mx-5 mt-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">Processing Error</p>
                            <p className="text-xs mt-0.5 text-red-600">{aiData.lastError}</p>
                            {aiData.retryCount > 0 && (
                              <p className="text-xs mt-1 text-red-500">Retried {aiData.retryCount} time(s)</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Uploaded Documents List */}
                      {aiData.documents?.length > 0 && (
                        <div className="p-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              Uploaded Documents
                            </span>
                            <span className="text-xs text-slate-400">
                              {aiData.documents.length} file{aiData.documents.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {aiData.documents.map((doc) => {
                              const isPdf = doc.mimeType === 'application/pdf';
                              const isWord = doc.mimeType?.includes('word') || doc.mimeType?.includes('doc');
                              const isImage = doc.mimeType?.startsWith('image/');
                              const fileTypeLabel = isPdf ? 'PDF' : isWord ? 'DOC' : isImage ? 'IMG' : 'FILE';
                              const fileTypeColor = isPdf ? 'text-red-600 bg-red-50' : isWord ? 'text-blue-600 bg-blue-50' : isImage ? 'text-purple-600 bg-purple-50' : 'text-slate-600 bg-slate-50';
                              const iconColor = isPdf ? 'bg-red-50' : isWord ? 'bg-blue-50' : isImage ? 'bg-purple-50' : 'bg-slate-50';
                              const iconTextColor = isPdf ? 'text-red-500' : isWord ? 'text-blue-500' : isImage ? 'text-purple-500' : 'text-slate-500';

                              return (
                                <div key={doc.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 group hover:border-slate-200 transition-colors">
                                  <div className={`w-9 h-9 rounded-lg ${iconColor} flex items-center justify-center flex-shrink-0`}>
                                    {isImage ? <FileImage className={`w-4 h-4 ${iconTextColor}`} /> : <FileText className={`w-4 h-4 ${iconTextColor}`} />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800 truncate">{doc.filename}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${fileTypeColor}`}>
                                        {fileTypeLabel}
                                      </span>
                                      <span className="text-[10px] text-slate-400">
                                        {doc.fileSize < 1024 ? doc.fileSize + ' B' :
                                          doc.fileSize < 1048576 ? (doc.fileSize / 1024).toFixed(1) + ' KB' :
                                            (doc.fileSize / 1048576).toFixed(1) + ' MB'}
                                      </span>
                                      {doc.ocrStatus && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${doc.ocrStatus === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                                          doc.ocrStatus === 'failed' ? 'bg-red-50 text-red-600' :
                                            'bg-amber-50 text-amber-600'
                                          }`}>
                                          OCR: {doc.ocrStatus}
                                        </span>
                                      )}
                                      {doc.transactionId && (
                                        <span className="text-[10px] text-slate-400 font-mono">{doc.transactionId}</span>
                                      )}
                                    </div>
                                  </div>
                                  {doc.s3Url && (
                                    <button
                                      onClick={() => setDocViewerUrl(doc.s3Url)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors flex-shrink-0"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      View
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* No documents yet */}
                      {(!aiData.documents || aiData.documents.length === 0) && (
                        <div className="p-5 text-center">
                          <p className="text-sm text-slate-400">No documents uploaded yet</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Loading state for AI data */}
                  {aiDataLoading && !aiData && (
                    <div className="flex items-center gap-2 text-sm text-slate-500 py-3">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading session data...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chart Info Section — Collapsible */}
            <CollapsibleCard title="Chart Info" subtitle="All relevant chart fields" defaultOpen={true}>
              <div style={isAuditor ? { pointerEvents: "none", opacity: 0.5, filter: "grayscale(0.6)", background: "#f3f4f6", borderRadius: 10, padding: 12 } : (timerStopped ? { pointerEvents: "none" } : {})}>
                {/* Row 1: Chart #, MR#, Date of Service */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                  {isFieldVisible("chart_no") && <FormField label="Chart #" value={formData.chartNo} required={isFieldRequired("chart_no")} readOnly={timerStopped} onChange={(v) => updateForm("chartNo", v)} />}
                  {(isFieldVisible("mr_no") || !chart?.MR_No) && <FormField label="MR#" value={formData.mrNo} required={isFieldRequired("mr_no")} readOnly={timerStopped} onChange={(v) => updateForm("mrNo", v)} />}
                  {(isFieldVisible("date_of_service") || !chart?.DateOfService) && <FormField label="Date of Service" type="date" value={formData.dateOfService} required={isFieldRequired("date_of_service")} readOnly={timerStopped} onChange={(v) => updateForm("dateOfService", v)} />}
                </div>
                {/* Row 2: Admit date, Discharge date */}
                {(isFieldVisible("admit_date") || isFieldVisible("discharge_date")) && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                    {isFieldVisible("admit_date") && <FormField label="Admit date" type="date" value={formData.admitDate} readOnly={timerStopped} onChange={(v) => updateForm("admitDate", v)} />}
                    {isFieldVisible("discharge_date") && <FormField label="Discharge date" type="date" value={formData.dischargeDate} required={isFieldRequired("discharge_date")} readOnly={timerStopped} onChange={(v) => updateForm("dischargeDate", v)} />}
                    <div />
                  </div>
                )}
                {/* Row 3: Disposition, EM, Primary diagnosis */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                  {isFieldVisible("disposition") && <FormField label="Disposition" value={formData.disposition} type="select" required={isFieldRequired("disposition")} readOnly={timerStopped} onChange={(v) => updateForm("disposition", v)} options={config?.dispositions?.map(d => d.disposition_name) || []} />}
                  {isFieldVisible("em") && <FormField label="EM" value={formData.em} required={isFieldRequired("em")} readOnly={timerStopped} onChange={(v) => updateForm("em", v)} aiTag={aiFilledFields.has("em")} />}
                  {isFieldVisible("primary_diagnosis") && <FormField label="Primary diagnosis" value={formData.primaryDiagnosis} required={isFieldRequired("primary_diagnosis")} readOnly={timerStopped} onChange={(v) => updateForm("primaryDiagnosis", v)} aiTag={aiFilledFields.has("primaryDiagnosis")} />}
                </div>
                {/* Row 4: Primary Health Plan, Facility */}
                {(isFieldVisible("primary_health") || isFieldVisible("facility")) && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    {isFieldVisible("primary_health") && <FormField label="Primary Health Plan" value={formData.primaryHealth} type="select" required={isFieldRequired("primary_health")} readOnly={timerStopped} onChange={(v) => updateForm("primaryHealth", v)} options={config?.primary_health?.map(p => p.PrimaryHealthName) || []} />}
                    {isFieldVisible("facility") && <FormField label="Facility" value={formData.facility} type="select" required={isFieldRequired("facility")} readOnly={timerStopped} onChange={(v) => updateForm("facility", v)} options={config?.facility?.map(f => f.FacilityName) || []} />}
                  </div>
                )}
                {/* Row 5: POA, LOS, DRG Value */}
                {(isFieldVisible("poa") || isFieldVisible("los") || isFieldVisible("drg")) && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                    {isFieldVisible("poa") && <FormField label="POA" value={formData.poa} required={isFieldRequired("poa")} readOnly={timerStopped} onChange={(v) => updateForm("poa", v.slice(0, 1))} />}
                    {isFieldVisible("los") && <FormField label="LOS" value={formData.los} required={isFieldRequired("los")} readOnly={timerStopped} onChange={(v) => updateForm("los", v.slice(0, 3))} />}
                    {isFieldVisible("drg") && <FormField label="DRG Value" value={formData.drgValue} required={isFieldRequired("drg")} readOnly={timerStopped} onChange={(v) => updateForm("drgValue", v.slice(0, 3))} />}
                  </div>
                )}
                {/* Row 6: Procedure code, Sub Specialty */}
                {(isFieldVisible("procedure_code") || isFieldVisible("sub_specialty")) && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                    {isFieldVisible("procedure_code") && <FormField label="Procedure code" value={formData.procedureCode} required={isFieldRequired("procedure_code")} readOnly={timerStopped} onChange={(v) => updateForm("procedureCode", v)} aiTag={aiFilledFields.has("procedureCode")} />}
                    {isFieldVisible("sub_specialty") && <FormField label="Sub Specialty" value={formData.subSpecialty} type="select" required={isFieldRequired("sub_specialty")} readOnly={timerStopped} onChange={(v) => updateForm("subSpecialty", v)} options={config?.subspecialties?.map(s => s.SubSpecialtyName) || []} />}
                    <div />
                  </div>
                )}
                {renderCustomFields("Chart Info")}
              </div>
            </CollapsibleCard>

            {/* Processing Info Section — Collapsible */}
            <CollapsibleCard title="Processing Info" subtitle="All fields related to processing this chart" defaultOpen={true}>
              <div style={isAuditor ? { pointerEvents: "none", opacity: 0.5, filter: "grayscale(0.6)", background: "#f3f4f6", borderRadius: 10, padding: 12 } : (timerStopped ? { pointerEvents: "none" } : {})}>
                {/* Row 1: Chart status, Responsible party */}
                <div style={{ display: "grid", gridTemplateColumns: isFieldVisible("responsible_parties") ? "1fr 3fr" : "1fr", gap: 16, marginBottom: 16 }}>
                  {isFieldVisible("chart_status") && <FormField label="Chart status" value={formData.chartStatus || "Open"} type="select" required={isFieldRequired("chart_status")} readOnly={timerStopped} onChange={(v) => updateForm("chartStatus", v)} options={["Complete", "Incomplete"]} />}
                  {isFieldVisible("responsible_parties") && (
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Responsible party{isFieldRequired("responsible_parties") && <span style={{ color: "#ef4444" }}> *</span>}</label>
                      <FormFieldMultiSelect
                        value={formData.responsibleParty || []}
                        onChange={(v) => updateForm("responsibleParty", v)}
                        options={config?.responsible_parties?.map(r => r.resp_party_name) || []}
                        placeholder="Select..."
                        readOnly={timerStopped}
                      />
                    </div>
                  )}
                </div>
                {/* Row 2: Hold reason — disabled when Open or Complete */}
                <div style={{ marginBottom: 16, opacity: timerStopped ? 0.5 : ((formData.chartStatus || "Open") === "Incomplete" ? 1 : 0.5), pointerEvents: timerStopped ? "none" : ((formData.chartStatus || "Open") === "Incomplete" ? "auto" : "none") }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Hold reason{(formData.chartStatus === "Incomplete") && <span style={{ color: "#ef4444" }}> *</span>}</label>
                    <FormFieldMultiSelect
                      value={formData.holdReason || []}
                      onChange={(v) => updateForm("holdReason", v)}
                      options={config?.hold_reasons?.map(h => h.hold_reason) || []}
                      placeholder="Select..."
                      readOnly={timerStopped || (formData.chartStatus || "Open") !== "Incomplete"}
                    />
                  </div>
                </div>
                {/* Row 3: Coder comments to client — disabled when Complete */}
                {isFieldVisible("coder_comments") && (
                  <div style={{ marginBottom: 16, opacity: timerStopped ? 0.5 : ((formData.chartStatus || "Open") === "Complete" ? 0.5 : 1), pointerEvents: timerStopped ? "none" : ((formData.chartStatus || "Open") === "Complete" ? "none" : "auto") }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
                      Coder comments to client{isFieldRequired("coder_comments") && <span style={{ color: "#ef4444" }}> *</span>}
                    </label>
                    <textarea rows={3} value={formData.coderComments || ""} readOnly={timerStopped || (formData.chartStatus || "Open") === "Complete"} onChange={(e) => updateForm("coderComments", e.target.value)} style={{
                      width: "100%", padding: "10px 12px", borderRadius: 8,
                      border: `1px solid ${timerStopped || (formData.chartStatus || "Open") === "Complete" ? "#d1d5db" : "#e2e8f0"}`,
                      background: timerStopped || (formData.chartStatus || "Open") === "Complete" ? "#e5e7eb" : "#fff",
                      fontSize: 13, color: timerStopped || (formData.chartStatus || "Open") === "Complete" ? "#6b7280" : "#1a1d23",
                      resize: "vertical", boxSizing: "border-box",
                      cursor: timerStopped || (formData.chartStatus || "Open") === "Complete" ? "not-allowed" : "text",
                    }} />
                  </div>
                )}
                {/* Row 4: Rejection / Denial Comments */}
                {isFieldVisible("rejection_comments") && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
                      Rejection / Denial Comments{isFieldRequired("rejection_comments") && <span style={{ color: "#ef4444" }}> *</span>}
                    </label>
                    <textarea rows={3} value={formData.rejectionComments || ""} readOnly={timerStopped} onChange={(e) => updateForm("rejectionComments", e.target.value)} style={{
                      width: "100%", padding: "10px 12px", borderRadius: 8,
                      border: `1px solid ${timerStopped ? "#d1d5db" : "#e2e8f0"}`,
                      background: timerStopped ? "#e5e7eb" : "#fff",
                      fontSize: 13, color: timerStopped ? "#6b7280" : "#1a1d23", resize: "vertical", boxSizing: "border-box",
                      cursor: timerStopped ? "not-allowed" : "text",
                    }} />
                  </div>
                )}
                {/* Row 5: Deficiency Comments */}
                {isFieldVisible("deficiency_comments") && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
                      Deficiency Comments{isFieldRequired("deficiency_comments") && <span style={{ color: "#ef4444" }}> *</span>}
                    </label>
                    <textarea rows={3} value={formData.deficiencyComments || ""} readOnly={timerStopped} onChange={(e) => updateForm("deficiencyComments", e.target.value)} style={{
                      width: "100%", padding: "10px 12px", borderRadius: 8,
                      border: `1px solid ${timerStopped ? "#d1d5db" : "#e2e8f0"}`,
                      background: timerStopped ? "#e5e7eb" : "#fff",
                      fontSize: 13, color: timerStopped ? "#6b7280" : "#1a1d23", resize: "vertical", boxSizing: "border-box",
                      cursor: timerStopped ? "not-allowed" : "text",
                    }} />
                  </div>
                )}
                {/* Row 6: Date of completion, Audit options, Coder QC Status */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <FormField label="Date of completion" value={new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })} readOnly />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>Audit options<span style={{ color: "#ef4444" }}> *</span></label>
                    <FormFieldMultiSelect
                      value={formData.auditOption || []}
                      onChange={(v) => updateForm("auditOption", v)}
                      options={config?.audit_options?.map(a => a.audit_opt) || []}
                      placeholder="Select..."
                      readOnly={timerStopped}
                    />
                  </div>
                  <FormField label="Coder QC Status" value={formData.qcStatus} type="select" readOnly={!(chart?.coders?.length > 1) || timerStopped} onChange={(v) => updateForm("qcStatus", v)} options={masterData?.qc_status?.map(q => q.name) || []} placeholder="Select..." />
                </div>
                {/* Row 7: Allocate to auditor, Allocate to Coder, Priority */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <FormField label="Allocate to auditor" value={formData.allocateAuditor} type="select" readOnly={timerStopped || !!formData.allocateCoder} onChange={(v) => updateForm("allocateAuditor", v)} placeholder="Select..." options={masterData?.auditors_active?.map(a => ({ value: a.name, label: a.name || "None" })) || []} />
                  <FormField label="Allocate to Coder" value={formData.allocateCoder} type="select" readOnly={timerStopped} onChange={(v) => updateForm("allocateCoder", v)} placeholder="Select..." options={masterData?.coders_active?.map(c => ({ value: c.name, label: c.name || "None" })) || []} />
                  <FormField label="Priority" value={formData.priority} type="select" readOnly={timerStopped || chart?.MilestoneId !== 4} onChange={(v) => updateForm("priority", v)} placeholder="Select..." options={["Critical", "High", "Medium", "Low"]} />
                </div>
                {renderCustomFields("Processing Info")}
              </div>
            </CollapsibleCard>

            {/* Audit Information Section — Collapsible */}
            <CollapsibleCard title="Audit Information" defaultOpen={false}>
              <div style={{ ...(auditSectionDisabled ? { pointerEvents: "none", opacity: 0.5, filter: "grayscale(0.6)", background: "#f3f4f6" } : {}), borderRadius: 10, padding: 12 }}>
                {/* Audit table */}
                <div style={{ border: "1px solid #e8eaed", borderRadius: 10, overflow: "visible" }}>
                  {/* Header row */}
                  <div style={{
                    display: "grid", gridTemplateColumns: "160px 1fr 1fr 1fr",
                    background: "#fafafa", borderBottom: "1px solid #e8eaed",
                    borderRadius: "10px 10px 0 0",
                  }}>
                    <div style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: 0.5, textTransform: "uppercase", borderRight: "1px dashed #e8eaed" }}>Area</div>
                    <div style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: 0.5, textTransform: "uppercase" }}>Total Codes</div>
                    <div style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: 0.5, textTransform: "uppercase" }}>Correct Codes</div>
                    <div style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: 0.5, textTransform: "uppercase" }}>
                      <span style={{ background: "#fef3c7", borderRadius: 3, padding: "1px 4px" }}>Feedback</span> Category
                    </div>
                  </div>
                  {/* Data rows — static */}
                  {AUDIT_ROWS.map((row, idx) => {
                    const totalVal = auditData[row.key]?.totalCodes || "";
                    const correctVal = auditData[row.key]?.correctCodes || "";
                    const feedbackEnabled = !auditReadOnly && totalVal !== "" && correctVal !== "" && parseInt(correctVal, 10) < parseInt(totalVal, 10);
                    const feedbackDisabled = !feedbackEnabled;
                    return (
                      <div key={row.key} style={{
                        display: "grid", gridTemplateColumns: "160px 1fr 1fr 1fr",
                        borderBottom: "1px solid #f0f1f3",
                        alignItems: "center",
                      }}>
                        <div style={{
                          padding: "8px 14px", fontSize: 13, fontWeight: 500, color: "#334155",
                          borderRight: "1px dashed #e8eaed",
                        }}>{row.label}</div>
                        {/* Total Codes */}
                        <div style={{ padding: "8px 12px" }}>
                          {row.totalCodesOptions ? (
                            <FormFieldDropdown
                              value={totalVal}
                              onChange={(v) => updateAuditField(row.key, "totalCodes", v)}
                              options={row.totalCodesOptions}
                              placeholder="Select..."
                              readOnly={auditReadOnly}
                            />
                          ) : (
                            <input
                              type="text"
                              value={totalVal}
                              readOnly={auditReadOnly}
                              onChange={auditReadOnly ? undefined : (e) => updateAuditField(row.key, "totalCodes", e.target.value)}
                              style={{
                                width: "100%", padding: "8px 10px", borderRadius: 6,
                                border: `1px solid ${auditReadOnly ? "#d1d5db" : "#e2e8f0"}`,
                                background: auditReadOnly ? "#e5e7eb" : "#fff",
                                fontSize: 13, color: auditReadOnly ? "#6b7280" : "#1a1d23",
                                boxSizing: "border-box", cursor: auditReadOnly ? "not-allowed" : "text",
                              }}
                            />
                          )}
                        </div>
                        {/* Correct Codes */}
                        <div style={{ padding: "8px 12px" }}>
                          <input
                            type="text"
                            value={correctVal}
                            readOnly={auditReadOnly}
                            onChange={auditReadOnly ? undefined : (e) => updateAuditField(row.key, "correctCodes", e.target.value)}
                            style={{
                              width: "100%", padding: "8px 10px", borderRadius: 6,
                              border: `1px solid ${auditReadOnly ? "#d1d5db" : "#e2e8f0"}`,
                              background: auditReadOnly ? "#e5e7eb" : "#fff",
                              fontSize: 13, color: auditReadOnly ? "#6b7280" : "#1a1d23",
                              boxSizing: "border-box", cursor: auditReadOnly ? "not-allowed" : "text",
                            }}
                          />
                        </div>
                        {/* Feedback Category — disabled when totalCodes === correctCodes */}
                        <div style={{ padding: "8px 12px" }}>
                          {row.multiFeedback ? (
                            <FormFieldMultiSelect
                              value={auditData[row.key]?.feedbackCategory || []}
                              onChange={(v) => updateAuditField(row.key, "feedbackCategory", v)}
                              options={config?.[row.feedKey]?.map(f => f.feedback_name) || []}
                              placeholder="Select..."
                              readOnly={feedbackDisabled}
                            />
                          ) : (
                            <FormFieldDropdown
                              value={auditData[row.key]?.feedbackCategory || ""}
                              onChange={(v) => updateAuditField(row.key, "feedbackCategory", v)}
                              options={config?.[row.feedKey]?.map(f => f.feedback_name) || []}
                              placeholder="Select..."
                              readOnly={feedbackDisabled}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {/* Dynamic feedback category rows */}
                  {feedbackCategories.map((cat) => {
                    const catKey = `feedbackCat_${cat.id}`;
                    const totalVal = auditData[catKey]?.totalCodes || "";
                    const correctVal = auditData[catKey]?.correctCodes || "";
                    const feedbackEnabled = !auditReadOnly && totalVal !== "" && correctVal !== "" && parseInt(correctVal, 10) < parseInt(totalVal, 10);
                    const feedbackDisabled = !feedbackEnabled;
                    return (
                      <div key={catKey} style={{
                        display: "grid", gridTemplateColumns: "160px 1fr 1fr 1fr",
                        borderBottom: "1px solid #f0f1f3",
                        alignItems: "center",
                      }}>
                        <div style={{
                          padding: "8px 14px", fontSize: 13, fontWeight: 500, color: "#334155",
                          borderRight: "1px dashed #e8eaed",
                        }}>{cat.name}</div>
                        <div style={{ padding: "8px 12px" }}>
                          <input
                            type="text"
                            value={totalVal}
                            readOnly={auditReadOnly}
                            onChange={auditReadOnly ? undefined : (e) => updateAuditField(catKey, "totalCodes", e.target.value)}
                            style={{
                              width: "100%", padding: "8px 10px", borderRadius: 6,
                              border: `1px solid ${auditReadOnly ? "#d1d5db" : "#e2e8f0"}`,
                              background: auditReadOnly ? "#e5e7eb" : "#fff",
                              fontSize: 13, color: auditReadOnly ? "#6b7280" : "#1a1d23",
                              boxSizing: "border-box", cursor: auditReadOnly ? "not-allowed" : "text",
                            }}
                          />
                        </div>
                        <div style={{ padding: "8px 12px" }}>
                          <input
                            type="text"
                            value={correctVal}
                            readOnly={auditReadOnly}
                            onChange={auditReadOnly ? undefined : (e) => updateAuditField(catKey, "correctCodes", e.target.value)}
                            style={{
                              width: "100%", padding: "8px 10px", borderRadius: 6,
                              border: `1px solid ${auditReadOnly ? "#d1d5db" : "#e2e8f0"}`,
                              background: auditReadOnly ? "#e5e7eb" : "#fff",
                              fontSize: 13, color: auditReadOnly ? "#6b7280" : "#1a1d23",
                              boxSizing: "border-box", cursor: auditReadOnly ? "not-allowed" : "text",
                            }}
                          />
                        </div>
                        <div style={{ padding: "8px 12px" }}>
                          <FormFieldDropdown
                            value={auditData[catKey]?.feedbackCategory || ""}
                            onChange={(v) => updateAuditField(catKey, "feedbackCategory", v)}
                            options={cat.FeedbackCategoryDropdowns?.map(d => d.name) || []}
                            placeholder="Select..."
                            readOnly={feedbackDisabled}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {/* Total row — auto-computed, always disabled */}
                  {(() => {
                    const allKeys = [...AUDIT_ROWS.map(r => r.key), ...feedbackCategories.map(c => `feedbackCat_${c.id}`)];
                    const totalSum = allKeys.reduce((sum, k) => sum + (parseInt(auditData[k]?.totalCodes, 10) || 0), 0);
                    const correctSum = allKeys.reduce((sum, k) => sum + (parseInt(auditData[k]?.correctCodes, 10) || 0), 0);
                    return (
                      <div style={{
                        display: "grid", gridTemplateColumns: "160px 1fr 1fr 1fr",
                        alignItems: "center", background: "#f9fafb",
                        borderRadius: "0 0 10px 10px",
                      }}>
                        <div style={{
                          padding: "8px 14px", fontSize: 13, fontWeight: 700, color: "#1e293b",
                          borderRight: "1px dashed #e8eaed",
                        }}>Total</div>
                        <div style={{ padding: "8px 12px" }}>
                          <input
                            type="text"
                            value={totalSum || ""}
                            readOnly
                            style={{
                              width: "100%", padding: "8px 10px", borderRadius: 6,
                              border: "1px solid #d1d5db", background: "#e5e7eb",
                              fontSize: 13, fontWeight: 600, color: "#1e293b",
                              boxSizing: "border-box", cursor: "not-allowed",
                            }}
                          />
                        </div>
                        <div style={{ padding: "8px 12px" }}>
                          <input
                            type="text"
                            value={correctSum || ""}
                            readOnly
                            style={{
                              width: "100%", padding: "8px 10px", borderRadius: 6,
                              border: "1px solid #d1d5db", background: "#e5e7eb",
                              fontSize: 13, fontWeight: 600, color: "#1e293b",
                              boxSizing: "border-box", cursor: "not-allowed",
                            }}
                          />
                        </div>
                        <div style={{ padding: "8px 12px" }} />
                      </div>
                    );
                  })()}
                </div>

                {/* Feedback Type, Auditor QC Status & Allocate to Coder below table */}
                <div style={{ display: "grid", gridTemplateColumns: formData.auditorQcStatus === "Agreed" ? "1fr 1fr" : "1fr 1fr 1fr", gap: 16, marginTop: 20 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
                      <span style={{ background: "#fef3c7", borderRadius: 3, padding: "1px 4px" }}>Feedback</span> Type<span style={{ color: "#ef4444" }}> *</span>
                    </label>
                    <FormFieldDropdown
                      value={formData.feedbackType}
                      onChange={(v) => updateForm("feedbackType", v)}
                      options={config?.feedback_types?.map(f => f.feed_type_name) || []}
                      placeholder="Select..."
                      readOnly={auditReadOnly}
                    />
                  </div>
                  <FormField label="Auditor QC Status" value={formData.auditorQcStatus} required type="select" readOnly={auditReadOnly} onChange={(v) => updateForm("auditorQcStatus", v)} placeholder="Select..." options={["Agreed", "Feedback Provided"]} />
                  {formData.auditorQcStatus !== "Agreed" && (
                    <FormField
                      label="Allocate to Coder"
                      value={formData.auditAllocateCoder}
                      type="select"
                      readOnly={auditReadOnly || formData.auditorQcStatus !== "Feedback Provided"}
                      onChange={(v) => updateForm("auditAllocateCoder", v)}
                      placeholder="Select..."
                      options={masterData?.coders?.map(c => ({ value: `${c.first_name} ${c.last_name}`, label: `${c.first_name} ${c.last_name}` })) || []}
                    />
                  )}
                </div>

                {renderCustomFields("Audit Info")}
              </div>
            </CollapsibleCard>

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "12px 32px", borderRadius: 10, border: "none",
                background: saving ? "#fca5a5" : "#ef4444", color: "#fff", fontSize: 14, fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer", marginBottom: 20,
                opacity: saving ? 0.7 : 1,
              }}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div>
            {/* Users Section (Top) */}
            <CollapsibleSection title="Users" defaultOpen={true}
              headerAction={
                <button onClick={(e) => e.stopPropagation()} style={{
                  width: 24, height: 24, borderRadius: "50%", border: "none",
                  background: "#fef2f2", color: "#ef4444", fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </button>
              }
            >
              {/* Current Allocation (Allocated User) */}
              {userName && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                  borderBottom: "1px solid #f0f1f3",
                }}>
                  <Avatar name={userName} size={42} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{userName}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Current Allocation</div>
                  </div>
                </div>
              )}

              {/* Original Coder */}
              {chart.coders?.length > 0 && chart.coders.map(coder => (
                <div key={coder.id || coder.name} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                  borderBottom: "1px solid #f0f1f3",
                }}>
                  <Avatar src={coder.image_url} name={coder.name} size={42} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{coder.name}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>
                      {coder.role || "Coder"}
                    </div>
                  </div>
                  {chart.date_of_coding && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1d23" }}>{chart.date_of_coding}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>Date of Coding</div>
                    </div>
                  )}
                </div>
              ))}

              {/* Auditors */}
              {chart.auditors?.length > 0 && chart.auditors.map(auditor => (
                <div key={auditor.id || auditor.name} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                }}>
                  <Avatar src={auditor.image_url} name={auditor.name} size={42} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1d23" }}>{auditor.name}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>
                      {auditor.role || "Auditor"}
                    </div>
                  </div>
                  {chart.date_of_auditing && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1d23" }}>{chart.date_of_auditing}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>Date of Auditing</div>
                    </div>
                  )}
                </div>
              ))}

              {!userName && chart.coders?.length === 0 && chart.auditors?.length === 0 && (
                <p style={{ color: "#94a3b8", fontSize: 12, textAlign: "center", padding: "8px 0" }}>No users assigned</p>
              )}
            </CollapsibleSection>

            {/* Conversation Log */}
            <CollapsibleSection title="Conversation Log" subtitle="Internal comments within the team">
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {/* Comments list */}
                {comments.length > 0 ? (
                  <div style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, marginBottom: 12, paddingRight: 4 }}>
                    {comments.map((c) => (
                      <div key={c.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        {/* Avatar */}
                        <div style={{
                          width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                          background: "#f0f1f3", display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700, color: "#64748b", overflow: "hidden",
                        }}>
                          {c.user_image_url
                            ? <img src={c.user_image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : `${(c.user_first_name || "?")[0]}${(c.user_last_name || "")[0]}`.toUpperCase()
                          }
                        </div>
                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#1a1d23" }}>
                              {c.user_first_name} {c.user_last_name}
                            </span>
                            <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 500 }}>
                              {c.role}
                            </span>
                          </div>
                          <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.5, margin: 0, wordBreak: "break-word" }}>
                            {c.comment_msg}
                          </p>
                          <span style={{ fontSize: 10, color: "#94a3b8", marginTop: 3, display: "block" }}>
                            {c.comment_timestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#94a3b8", fontSize: 12, textAlign: "center", padding: "8px 0", marginBottom: 12 }}>No comments yet</p>
                )}

                {/* Comment input */}
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="Comment for chart..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); postComment(); } }}
                    disabled={!timerRunning}
                    style={{
                      flex: 1, padding: "9px 12px", borderRadius: 8,
                      border: "1px solid #e2e8f0", fontSize: 13,
                      background: !timerRunning ? "#f1f5f9" : "#fff",
                      color: !timerRunning ? "#94a3b8" : "#1a1d23",
                      cursor: !timerRunning ? "not-allowed" : "text",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={postComment}
                    disabled={!timerRunning || !commentText.trim() || postingComment}
                    style={{
                      width: 36, height: 36, borderRadius: 8, border: "none",
                      background: timerRunning && commentText.trim() ? "#1a1d23" : "#e2e8f0",
                      color: timerRunning && commentText.trim() ? "#fff" : "#94a3b8",
                      cursor: timerRunning && commentText.trim() ? "pointer" : "not-allowed",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}
                  >
                    {postingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </CollapsibleSection>

            {/* Time Tracker */}
            <CollapsibleSection title="Time Tracker" subtitle="Overall processing time by user"
              headerAction={
                <button onClick={(e) => e.stopPropagation()} style={{
                  width: 24, height: 24, borderRadius: "50%", border: "none",
                  background: "#fff3e0", color: "#f5a623", fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </button>
              }
            >
              {chart.timer ? (
                <div style={{ fontSize: 13, color: "#1a1d23" }}>
                  Timer: {chart.timer}
                </div>
              ) : (
                <p style={{ color: "#94a3b8", fontSize: 12, textAlign: "center", padding: "8px 0" }}>No time tracked yet</p>
              )}
            </CollapsibleSection>

            {/* AI ICD Prediction */}
            <CollapsibleSection
              title={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <IconBot /> AI ICD Prediction
                </span>
              }
              defaultOpen={true}
            >
              {(() => {
                const str = (val) => { if (val == null) return ''; if (typeof val === 'string') return val; return String(val); };
                const getCode = (item) => str(item?.icd_10_code || item?.code || item?.cpt_code || '');
                const getDesc = (item) => str(item?.description || item?.finding || '');
                const dc = aiData?.diagnosisCodes;
                const procs = aiData?.procedures;
                const hasCodes = dc && (
                  dc.principal_diagnosis || dc.primary_diagnosis?.length > 0 ||
                  dc.secondary_diagnoses?.length > 0 || dc.reason_for_admit?.length > 0 ||
                  dc.ed_em_level?.length > 0
                );
                const hasProcs = procs?.length > 0;

                if (aiNoSession) {
                  return (
                    <div style={{ textAlign: "center", padding: "12px 0" }}>
                      <Upload style={{ width: 24, height: 24, color: "#94a3b8", margin: "0 auto 8px" }} />
                      <p style={{ color: "#94a3b8", fontSize: 12 }}>Upload document to get ICD prediction</p>
                    </div>
                  );
                }

                if (!hasCodes && !hasProcs) {
                  return (
                    <div style={{ textAlign: "center", padding: "12px 0" }}>
                      <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 12 }}>No predictions available</p>
                      <button style={{
                        padding: "10px 24px", borderRadius: 10, border: "2px solid #1a1d23",
                        background: "#fff", color: "#1a1d23", fontSize: 13, fontWeight: 600, cursor: "pointer",
                      }}>Regenerate</button>
                    </div>
                  );
                }

                const CodeRow = ({ code, desc, bg, textColor }) => (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 8px", background: bg, borderRadius: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: textColor, flexShrink: 0 }}>{code}</span>
                    {desc && <span style={{ fontSize: 11, color: textColor, opacity: 0.85 }}>{desc}</span>}
                  </div>
                );

                return (
                  <div style={{ padding: "4px 0" }}>
                    {dc?.principal_diagnosis && (
                      <div style={{ marginBottom: 8 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", marginBottom: 4, textTransform: "uppercase" }}>Admit Code</p>
                        <CodeRow code={getCode(dc.principal_diagnosis)} desc={getDesc(dc.principal_diagnosis)} bg="#f5f3ff" textColor="#6d28d9" />
                      </div>
                    )}
                    {dc?.primary_diagnosis?.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "#d97706", marginBottom: 4, textTransform: "uppercase" }}>Primary</p>
                        {dc.primary_diagnosis.map((dx, i) => <CodeRow key={i} code={getCode(dx)} desc={getDesc(dx)} bg="#fffbeb" textColor="#b45309" />)}
                      </div>
                    )}
                    {dc?.secondary_diagnoses?.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase" }}>Secondary</p>
                        {dc.secondary_diagnoses.map((dx, i) => <CodeRow key={i} code={getCode(dx)} desc={getDesc(dx)} bg="#f8fafc" textColor="#475569" />)}
                      </div>
                    )}
                    {dc?.reason_for_admit?.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "#0891b2", marginBottom: 4, textTransform: "uppercase" }}>Reason for Admit</p>
                        {dc.reason_for_admit.map((dx, i) => <CodeRow key={i} code={getCode(dx)} desc={getDesc(dx)} bg="#ecfeff" textColor="#0e7490" />)}
                      </div>
                    )}
                    {dc?.ed_em_level?.length > 0 && (
                      <div style={{ marginBottom: 8 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "#2563eb", marginBottom: 4, textTransform: "uppercase" }}>E/M Level</p>
                        {dc.ed_em_level.map((em, i) => <CodeRow key={i} code={getCode(em)} desc={getDesc(em)} bg="#eff6ff" textColor="#1d4ed8" />)}
                      </div>
                    )}
                    {hasProcs && (
                      <div style={{ marginBottom: 4 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "#059669", marginBottom: 4, textTransform: "uppercase" }}>Procedures</p>
                        {procs.map((proc, i) => <CodeRow key={i} code={getCode(proc)} desc={getDesc(proc)} bg="#ecfdf5" textColor="#047857" />)}
                      </div>
                    )}
                  </div>
                );
              })()}
              {/* Review and Edit Button */}
              <div style={{ padding: "8px 0 4px", borderTop: "1px solid #f1f5f9", marginTop: 8 }}>
                <button
                  disabled={!timerRunning}
                  onClick={() => { setReviewPopupOpen(true); setSelectedCode(null); }}
                  style={{
                    width: "100%", padding: "10px 16px", borderRadius: 10,
                    border: "none", fontSize: 13, fontWeight: 600, cursor: timerRunning ? "pointer" : "not-allowed",
                    background: timerRunning ? "linear-gradient(135deg, #f59e0b, #d97706)" : "#e2e8f0",
                    color: timerRunning ? "#fff" : "#94a3b8",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "all 0.2s",
                    opacity: timerRunning ? 1 : 0.7,
                  }}
                >
                  <Pencil style={{ width: 14, height: 14 }} />
                  Review and Edit
                </button>
                {!timerRunning && (
                  <p style={{ color: "#94a3b8", fontSize: 11, textAlign: "center", marginTop: 6 }}>
                    Start the timer to review and edit
                  </p>
                )}
              </div>
            </CollapsibleSection>

            {/* Documentation Gaps — pulled from encounter payload feedback */}
            {aiData?.encounterPayload?.final_codes_json?.agent4_full?.feedback?.documentation_gaps?.length > 0 && (
              <CollapsibleSection title="Documentation Gaps" defaultOpen={true}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {aiData.encounterPayload.final_codes_json.agent4_full.feedback.documentation_gaps.map((item, i) => {
                    const sev = String(item.priority || '').toLowerCase();
                    const sevBg = sev === 'high' ? '#fee2e2' : sev === 'medium' ? '#fef3c7' : '#f1f5f9';
                    const sevColor = sev === 'high' ? '#b91c1c' : sev === 'medium' ? '#b45309' : '#64748b';
                    return (
                      <div key={i} style={{ background: "#fff1f2", border: "1px solid #ffe4e6", borderRadius: 8, padding: 10 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                          {item.priority && (
                            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "2px 6px", borderRadius: 4, background: sevBg, color: sevColor, flexShrink: 0 }}>
                              {String(item.priority)}
                            </span>
                          )}
                          <p style={{ fontSize: 12, fontWeight: 600, color: "#1a1d23", margin: 0 }}>{String(item.gap || '')}</p>
                        </div>
                        {item.impact && (
                          <p style={{ fontSize: 11, color: "#64748b", marginTop: 6, marginBottom: 0 }}>
                            <span style={{ fontWeight: 600 }}>Impact:</span> {String(item.impact)}
                          </p>
                        )}
                        {item.suggestion && (
                          <p style={{ fontSize: 11, color: "#047857", marginTop: 6, marginBottom: 0, background: "#ecfdf5", padding: "6px 8px", borderRadius: 6 }}>
                            <span style={{ fontWeight: 600 }}>Suggestion:</span> {String(item.suggestion)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CollapsibleSection>
            )}

            {/* Physician Queries Needed */}
            {aiData?.encounterPayload?.final_codes_json?.agent4_full?.feedback?.physician_queries_needed?.length > 0 && (
              <CollapsibleSection title="Physician Queries Needed" defaultOpen={true}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {aiData.encounterPayload.final_codes_json.agent4_full.feedback.physician_queries_needed.map((item, i) => {
                    const sev = String(item.priority || '').toLowerCase();
                    const sevBg = sev === 'high' ? '#fee2e2' : sev === 'medium' ? '#fef3c7' : '#f1f5f9';
                    const sevColor = sev === 'high' ? '#b91c1c' : sev === 'medium' ? '#b45309' : '#64748b';
                    return (
                      <div key={i} style={{ background: "#f5f3ff", border: "1px solid #ede9fe", borderRadius: 8, padding: 10 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                          {item.priority && (
                            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "2px 6px", borderRadius: 4, background: sevBg, color: sevColor, flexShrink: 0 }}>
                              {String(item.priority)}
                            </span>
                          )}
                          <p style={{ fontSize: 12, fontWeight: 600, color: "#1a1d23", margin: 0 }}>{String(item.query || '')}</p>
                        </div>
                        {item.reason && (
                          <p style={{ fontSize: 11, color: "#64748b", marginTop: 6, marginBottom: 0 }}>
                            <span style={{ fontWeight: 600 }}>Reason:</span> {String(item.reason)}
                          </p>
                        )}
                        {item.impact_on_coding && (
                          <p style={{ fontSize: 11, color: "#64748b", marginTop: 4, marginBottom: 0 }}>
                            <span style={{ fontWeight: 600 }}>Coding Impact:</span> {String(item.impact_on_coding)}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CollapsibleSection>
            )}

            {/* Coding Feedback — coding_tips + compliance_alerts (gaps and queries have their own sections above) */}
            {(aiData?.encounterPayload?.final_codes_json?.agent4_full?.feedback?.coding_tips?.length > 0 ||
              aiData?.encounterPayload?.final_codes_json?.agent4_full?.feedback?.compliance_alerts?.length > 0) && (
              <CollapsibleSection title="Coding Feedback" defaultOpen={true}>
                {aiData.encounterPayload.final_codes_json.agent4_full.feedback.coding_tips?.length > 0 && (
                  <div style={{ marginBottom: aiData.encounterPayload.final_codes_json.agent4_full.feedback.compliance_alerts?.length > 0 ? 12 : 0 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#4338ca", textTransform: "uppercase", marginBottom: 6 }}>Coding Tips</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {aiData.encounterPayload.final_codes_json.agent4_full.feedback.coding_tips.map((item, i) => (
                        <div key={i} style={{ background: "#eef2ff", border: "1px solid #e0e7ff", borderRadius: 8, padding: 10 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: "#1a1d23", margin: 0 }}>{String(item.tip || '')}</p>
                          {item.related_code && (
                            <p style={{ fontSize: 11, color: "#64748b", marginTop: 6, marginBottom: 0 }}>
                              <span style={{ fontWeight: 600 }}>Related Code:</span>{' '}
                              <span style={{ fontFamily: "monospace", background: "#fff", padding: "1px 6px", borderRadius: 4, color: "#4338ca" }}>
                                {String(item.related_code)}
                              </span>
                            </p>
                          )}
                          {item.potential_impact && (
                            <p style={{ fontSize: 11, color: "#64748b", marginTop: 6, marginBottom: 0 }}>
                              <span style={{ fontWeight: 600 }}>Impact:</span> {String(item.potential_impact)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {aiData.encounterPayload.final_codes_json.agent4_full.feedback.compliance_alerts?.length > 0 && (
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#b45309", textTransform: "uppercase", marginBottom: 6 }}>Compliance Alerts</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {aiData.encounterPayload.final_codes_json.agent4_full.feedback.compliance_alerts.map((item, i) => {
                        const sev = String(item.severity || '').toLowerCase();
                        const sevBg = sev === 'high' ? '#fee2e2' : sev === 'medium' ? '#fef3c7' : '#f1f5f9';
                        const sevColor = sev === 'high' ? '#b91c1c' : sev === 'medium' ? '#b45309' : '#64748b';
                        return (
                          <div key={i} style={{ background: "#fffbeb", border: "1px solid #fef3c7", borderRadius: 8, padding: 10 }}>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                              {item.severity && (
                                <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "2px 6px", borderRadius: 4, background: sevBg, color: sevColor, flexShrink: 0 }}>
                                  {String(item.severity)}
                                </span>
                              )}
                              <p style={{ fontSize: 12, fontWeight: 600, color: "#1a1d23", margin: 0 }}>{String(item.alert || '')}</p>
                            </div>
                            {item.regulation && (
                              <p style={{ fontSize: 11, color: "#64748b", marginTop: 6, marginBottom: 0 }}>
                                <span style={{ fontWeight: 600 }}>Regulation:</span> {String(item.regulation)}
                              </p>
                            )}
                            {item.recommended_action && (
                              <p style={{ fontSize: 11, color: "#64748b", marginTop: 4, marginBottom: 0 }}>
                                <span style={{ fontWeight: 600 }}>Action:</span> {String(item.recommended_action)}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CollapsibleSection>
            )}
          </div>
        </div>
      </div>

      {/* Document Viewer Popup */}
      {docViewerUrl && (() => {
        // Safe string renderer for AI data
        const str = (val) => {
          if (val == null) return '';
          if (typeof val === 'string') return val;
          if (typeof val === 'number' || typeof val === 'boolean') return String(val);
          return JSON.stringify(val);
        };
        const getCode = (item) => str(item?.icd_10_code || item?.code || item?.cpt_code || (typeof item === 'string' ? item : ''));
        const getDesc = (item) => str(item?.description || item?.finding || '');
        const isAiView = popupSidebarView === "ai-summary";

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => { setDocViewerUrl(null); setDocSidebarOpen(true); setPopupSidebarView("documents"); }}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-[94vw] h-[92vh] max-w-7xl flex overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Sidebar (open) ── */}
              {docSidebarOpen && (
                <div className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Navigator</span>
                    <button onClick={() => setDocSidebarOpen(false)} className="text-slate-400 hover:text-slate-600">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {/* Document items */}
                    {aiData?.documents?.map((doc, idx) => {
                      const isActive = !isAiView && doc.s3Url === docViewerUrl;
                      const isPdf = doc.mimeType === 'application/pdf';
                      const isImage = doc.mimeType?.startsWith('image/');
                      const iconColor = isPdf ? 'text-red-500' : isImage ? 'text-purple-500' : 'text-blue-500';

                      return (
                        <button
                          key={doc.id}
                          onClick={() => { doc.s3Url && setDocViewerUrl(doc.s3Url); setPopupSidebarView("documents"); }}
                          className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? 'bg-amber-50 border border-amber-200' : 'hover:bg-slate-50 border border-transparent'
                            }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-amber-100' : 'bg-slate-100'}`}>
                            {isImage
                              ? <FileImage className={`w-4 h-4 ${isActive ? 'text-amber-600' : iconColor}`} />
                              : <FileText className={`w-4 h-4 ${isActive ? 'text-amber-600' : iconColor}`} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${isActive ? 'text-amber-800' : 'text-slate-700'}`}>{doc.filename}</p>
                            <span className="text-[10px] text-slate-400">
                              {doc.fileSize < 1024 ? doc.fileSize + ' B' : doc.fileSize < 1048576 ? (doc.fileSize / 1024).toFixed(1) + ' KB' : (doc.fileSize / 1048576).toFixed(1) + ' MB'}
                            </span>
                          </div>
                        </button>
                      );
                    })}

                    {/* AI Summary item */}
                    <button
                      onClick={() => setPopupSidebarView("ai-summary")}
                      className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isAiView ? 'bg-purple-50 border border-purple-200' : 'hover:bg-slate-50 border border-transparent'
                        }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isAiView ? 'bg-purple-100' : 'bg-slate-100'}`}>
                        <Sparkles className={`w-4 h-4 ${isAiView ? 'text-purple-600' : 'text-slate-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${isAiView ? 'text-purple-800' : 'text-slate-700'}`}>AI Summary</p>
                        <span className={`text-[10px] ${isAiView ? 'text-purple-500' : 'text-slate-400'}`}>
                          {aiData?.aiStatus === 'ready' ? 'Results available' : aiData?.aiStatus || 'No data'}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* ── Sidebar (collapsed) ── */}
              {!docSidebarOpen && (
                <div className="w-14 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col items-center py-3 gap-2">
                  <button onClick={() => setDocSidebarOpen(true)} className="w-10 h-10 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors" title="Expand panel">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="w-8 border-t border-slate-200 my-1" />
                  {aiData?.documents?.map((doc, idx) => {
                    const isActive = !isAiView && doc.s3Url === docViewerUrl;
                    const isPdf = doc.mimeType === 'application/pdf';
                    return (
                      <button
                        key={doc.id}
                        onClick={() => { doc.s3Url && setDocViewerUrl(doc.s3Url); setPopupSidebarView("documents"); }}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-bold transition-colors ${isActive ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent'
                          }`}
                        title={doc.filename}
                      >
                        {isPdf ? 'P' : 'D'}{idx + 1}
                      </button>
                    );
                  })}
                  <div className="w-8 border-t border-slate-200 my-1" />
                  <button
                    onClick={() => setPopupSidebarView("ai-summary")}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isAiView ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent'
                      }`}
                    title="AI Summary"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* ── Main content area ── */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isAiView ? 'bg-purple-50' : 'bg-red-50'}`}>
                      {isAiView ? <Sparkles className="w-4 h-4 text-purple-500" /> : <FileText className="w-4 h-4 text-red-500" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">{isAiView ? 'AI Summary' : 'Document Viewer'}</h3>
                      {!isAiView && <p className="text-xs text-slate-400 truncate max-w-md">{docViewerUrl.split('/').pop()}</p>}
                      {isAiView && <p className="text-xs text-slate-400">AI-generated analysis of uploaded documents</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isAiView && (
                      <a href={docViewerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" /> New Tab
                      </a>
                    )}
                    <button
                      onClick={() => { setDocViewerUrl(null); setDocSidebarOpen(true); setPopupSidebarView("documents"); }}
                      className="w-8 h-8 rounded-lg bg-white hover:bg-red-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                  {/* Document iframe */}
                  {!isAiView && (
                    <iframe src={docViewerUrl} title="Document Viewer" className="w-full h-full border-0" />
                  )}

                  {/* AI Summary content */}
                  {isAiView && (
                    <div className="h-full overflow-y-auto p-8">
                      {aiData?.aiStatus === 'ready' && aiData?.aiSummary ? (
                        <div className="max-w-4xl mx-auto space-y-4">
                          {/* Patient Demographics & Provider */}
                          {(aiData.aiSummary.patient_demographics || aiData.aiSummary.attending_provider) && (
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                              <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center"><Sparkles className="w-3.5 h-3.5 text-blue-500" /></div>
                                Patient Information
                              </h4>
                              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-700">
                                {aiData.aiSummary.patient_demographics?.age && <span><span className="font-semibold text-slate-500">Age:</span> {str(aiData.aiSummary.patient_demographics.age)}</span>}
                                {aiData.aiSummary.patient_demographics?.sex && <span><span className="font-semibold text-slate-500">Sex:</span> {str(aiData.aiSummary.patient_demographics.sex)}</span>}
                                {aiData.aiSummary.patient_demographics?.weight && <span><span className="font-semibold text-slate-500">Weight:</span> {str(aiData.aiSummary.patient_demographics.weight)}</span>}
                                {aiData.aiSummary.attending_provider && <span><span className="font-semibold text-slate-500">Attending:</span> {str(aiData.aiSummary.attending_provider)}</span>}
                                {aiData.aiSummary.consulting_providers?.length > 0 && <span><span className="font-semibold text-slate-500">Consulting:</span> {aiData.aiSummary.consulting_providers.map(str).join(', ')}</span>}
                              </div>
                              {aiData.aiSummary.patient_demographics?.allergies?.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                  <span className="text-xs font-semibold text-red-600">Allergies:</span>
                                  {aiData.aiSummary.patient_demographics.allergies.map((a, i) => (
                                    <span key={i} className="text-xs px-2 py-0.5 bg-red-50 text-red-700 rounded-full border border-red-100">{str(a)}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Chief Complaint */}
                          {aiData.aiSummary.chief_complaint?.text && (
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                              <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-purple-50 flex items-center justify-center"><Sparkles className="w-3.5 h-3.5 text-purple-500" /></div>
                                Chief Complaint
                              </h4>
                              <p className="text-sm text-slate-700 leading-relaxed">{str(aiData.aiSummary.chief_complaint.text)}</p>
                              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs text-slate-500">
                                {aiData.aiSummary.chief_complaint.onset && aiData.aiSummary.chief_complaint.onset !== 'N/A' && <span><span className="font-semibold">Onset:</span> {str(aiData.aiSummary.chief_complaint.onset)}</span>}
                                {aiData.aiSummary.chief_complaint.duration && aiData.aiSummary.chief_complaint.duration !== 'N/A' && <span><span className="font-semibold">Duration:</span> {str(aiData.aiSummary.chief_complaint.duration)}</span>}
                                {aiData.aiSummary.chief_complaint.severity && aiData.aiSummary.chief_complaint.severity !== 'N/A' && <span><span className="font-semibold">Severity:</span> {str(aiData.aiSummary.chief_complaint.severity)}</span>}
                              </div>
                              {aiData.aiSummary.chief_complaint.associated_symptoms?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  <span className="text-xs font-semibold text-slate-500">Associated:</span>
                                  {aiData.aiSummary.chief_complaint.associated_symptoms.map((s, i) => (
                                    <span key={i} className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full">{str(s)}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* History of Present Illness */}
                          {aiData.aiSummary.history_of_present_illness?.text && (
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                              <h4 className="text-sm font-semibold text-slate-800 mb-3">History of Present Illness</h4>
                              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{str(aiData.aiSummary.history_of_present_illness.text)}</p>
                              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs text-slate-500">
                                {aiData.aiSummary.history_of_present_illness.location && aiData.aiSummary.history_of_present_illness.location !== 'N/A' && <span><span className="font-semibold">Location:</span> {str(aiData.aiSummary.history_of_present_illness.location)}</span>}
                                {aiData.aiSummary.history_of_present_illness.severity && aiData.aiSummary.history_of_present_illness.severity !== 'N/A' && <span><span className="font-semibold">Severity:</span> {str(aiData.aiSummary.history_of_present_illness.severity)}</span>}
                                {aiData.aiSummary.history_of_present_illness.duration && aiData.aiSummary.history_of_present_illness.duration !== 'N/A' && <span><span className="font-semibold">Duration:</span> {str(aiData.aiSummary.history_of_present_illness.duration)}</span>}
                                {aiData.aiSummary.history_of_present_illness.quality && aiData.aiSummary.history_of_present_illness.quality !== 'N/A' && <span><span className="font-semibold">Quality:</span> {str(aiData.aiSummary.history_of_present_illness.quality)}</span>}
                                {aiData.aiSummary.history_of_present_illness.modifying_factors && aiData.aiSummary.history_of_present_illness.modifying_factors !== 'N/A' && <span><span className="font-semibold">Modifying Factors:</span> {str(aiData.aiSummary.history_of_present_illness.modifying_factors)}</span>}
                              </div>
                              {aiData.aiSummary.history_of_present_illness.associated_signs_symptoms && aiData.aiSummary.history_of_present_illness.associated_signs_symptoms !== 'N/A' && (
                                <p className="text-xs text-slate-500 mt-1"><span className="font-semibold">Associated Signs/Symptoms:</span> {str(aiData.aiSummary.history_of_present_illness.associated_signs_symptoms)}</p>
                              )}
                            </div>
                          )}

                          {/* Review of Systems */}
                          {aiData.aiSummary.review_of_systems && Object.values(aiData.aiSummary.review_of_systems).some(v => v && v !== 'N/A') && (
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                              <h4 className="text-sm font-semibold text-slate-800 mb-3">Review of Systems</h4>
                              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                {Object.entries(aiData.aiSummary.review_of_systems).filter(([, v]) => v && v !== 'N/A').map(([system, value]) => (
                                  <div key={system} className="text-sm">
                                    <span className="font-semibold text-slate-500 capitalize">{str(system.replace(/_/g, ' '))}:</span>{' '}
                                    <span className="text-slate-700">{str(value)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Physical Examination & Vitals */}
                          {aiData.aiSummary.physical_examination && (
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                              <h4 className="text-sm font-semibold text-slate-800 mb-3">Physical Examination</h4>
                              {/* Vitals */}
                              {aiData.aiSummary.physical_examination.vitals && Object.values(aiData.aiSummary.physical_examination.vitals).some(v => v && v !== 'N/A') && (
                                <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                  <p className="text-xs font-semibold text-blue-700 mb-2">Vitals</p>
                                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
                                    {aiData.aiSummary.physical_examination.vitals.blood_pressure && aiData.aiSummary.physical_examination.vitals.blood_pressure !== 'N/A' && <span><span className="font-semibold text-slate-500">BP:</span> <span className="text-slate-700">{str(aiData.aiSummary.physical_examination.vitals.blood_pressure)}</span></span>}
                                    {aiData.aiSummary.physical_examination.vitals.heart_rate && aiData.aiSummary.physical_examination.vitals.heart_rate !== 'N/A' && <span><span className="font-semibold text-slate-500">HR:</span> <span className="text-slate-700">{str(aiData.aiSummary.physical_examination.vitals.heart_rate)}</span></span>}
                                    {aiData.aiSummary.physical_examination.vitals.temperature && aiData.aiSummary.physical_examination.vitals.temperature !== 'N/A' && <span><span className="font-semibold text-slate-500">Temp:</span> <span className="text-slate-700">{str(aiData.aiSummary.physical_examination.vitals.temperature)}</span></span>}
                                    {aiData.aiSummary.physical_examination.vitals.respiratory_rate && aiData.aiSummary.physical_examination.vitals.respiratory_rate !== 'N/A' && <span><span className="font-semibold text-slate-500">RR:</span> <span className="text-slate-700">{str(aiData.aiSummary.physical_examination.vitals.respiratory_rate)}</span></span>}
                                    {aiData.aiSummary.physical_examination.vitals.oxygen_saturation && aiData.aiSummary.physical_examination.vitals.oxygen_saturation !== 'N/A' && <span><span className="font-semibold text-slate-500">SpO2:</span> <span className="text-slate-700">{str(aiData.aiSummary.physical_examination.vitals.oxygen_saturation)}</span></span>}
                                    {aiData.aiSummary.physical_examination.vitals.pain_score && aiData.aiSummary.physical_examination.vitals.pain_score !== 'N/A' && <span><span className="font-semibold text-slate-500">Pain:</span> <span className="text-slate-700">{str(aiData.aiSummary.physical_examination.vitals.pain_score)}</span></span>}
                                  </div>
                                </div>
                              )}
                              {/* Exam Systems */}
                              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                {['general', 'heent', 'neck', 'cardiovascular', 'respiratory', 'abdomen', 'extremities', 'neurological', 'psychiatric', 'skin'].map(sys => (
                                  aiData.aiSummary.physical_examination[sys] && aiData.aiSummary.physical_examination[sys] !== 'N/A' ? (
                                    <div key={sys} className="text-sm">
                                      <span className="font-semibold text-slate-500 capitalize">{sys === 'heent' ? 'HEENT' : str(sys)}:</span>{' '}
                                      <span className="text-slate-700">{str(aiData.aiSummary.physical_examination[sys])}</span>
                                    </div>
                                  ) : null
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Past Medical History */}
                          {aiData.aiSummary.past_medical_history && (aiData.aiSummary.past_medical_history.conditions?.length > 0 || aiData.aiSummary.past_medical_history.surgeries?.length > 0 || aiData.aiSummary.past_medical_history.hospitalizations?.length > 0) && (
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                              <h4 className="text-sm font-semibold text-slate-800 mb-3">Past Medical History</h4>
                              {aiData.aiSummary.past_medical_history.conditions?.length > 0 && (
                                <div className="mb-2">
                                  <span className="text-xs font-semibold text-slate-500">Conditions: </span>
                                  <span className="text-sm text-slate-700">{aiData.aiSummary.past_medical_history.conditions.map(str).join(', ')}</span>
                                </div>
                              )}
                              {aiData.aiSummary.past_medical_history.surgeries?.length > 0 && (
                                <div className="mb-2">
                                  <span className="text-xs font-semibold text-slate-500">Surgeries: </span>
                                  <span className="text-sm text-slate-700">{aiData.aiSummary.past_medical_history.surgeries.map(str).join(', ')}</span>
                                </div>
                              )}
                              {aiData.aiSummary.past_medical_history.hospitalizations?.length > 0 && (
                                <div>
                                  <span className="text-xs font-semibold text-slate-500">Hospitalizations: </span>
                                  <span className="text-sm text-slate-700">{aiData.aiSummary.past_medical_history.hospitalizations.map(str).join(', ')}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Family History */}
                          {aiData.aiSummary.family_history?.relevant_conditions?.length > 0 && (
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                              <h4 className="text-sm font-semibold text-slate-800 mb-3">Family History</h4>
                              <ul className="space-y-1.5">
                                {aiData.aiSummary.family_history.relevant_conditions.map((cond, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                                    {str(cond)}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Social History */}
                          {aiData.aiSummary.social_history && Object.values(aiData.aiSummary.social_history).some(v => v && v !== 'N/A') && (
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                              <h4 className="text-sm font-semibold text-slate-800 mb-3">Social History</h4>
                              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                {Object.entries(aiData.aiSummary.social_history).filter(([, v]) => v && v !== 'N/A').map(([key, value]) => (
                                  <div key={key} className="text-sm">
                                    <span className="font-semibold text-slate-500 capitalize">{str(key.replace(/_/g, ' '))}:</span>{' '}
                                    <span className="text-slate-700">{str(value)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Assessment & Plan */}
                          {aiData.aiSummary.assessment_and_plan && (
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                              <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /></div>
                                Assessment & Plan
                              </h4>
                              {aiData.aiSummary.assessment_and_plan.assessment && (
                                <p className="text-sm text-slate-700 leading-relaxed mb-2">{str(aiData.aiSummary.assessment_and_plan.assessment)}</p>
                              )}
                              {aiData.aiSummary.assessment_and_plan.plan && (
                                <p className="text-sm text-slate-700 leading-relaxed mb-2"><span className="font-semibold">Plan:</span> {str(aiData.aiSummary.assessment_and_plan.plan)}</p>
                              )}
                              {aiData.aiSummary.assessment_and_plan.diagnoses?.length > 0 && (
                                <div className="mt-2">
                                  <span className="text-xs font-semibold text-slate-500">Diagnoses:</span>
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    {aiData.aiSummary.assessment_and_plan.diagnoses.map((d, i) => (
                                      <span key={i} className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">{str(d)}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {aiData.aiSummary.assessment_and_plan.follow_up && aiData.aiSummary.assessment_and_plan.follow_up !== 'N/A' && (
                                <p className="text-xs text-slate-500 mt-2"><span className="font-semibold">Follow-up:</span> {str(aiData.aiSummary.assessment_and_plan.follow_up)}</p>
                              )}
                              {aiData.aiSummary.assessment_and_plan.disposition && aiData.aiSummary.assessment_and_plan.disposition !== 'N/A' && (
                                <p className="text-xs text-slate-500 mt-1"><span className="font-semibold">Disposition:</span> {str(aiData.aiSummary.assessment_and_plan.disposition)}</p>
                              )}
                            </div>
                          )}

                          {/* ICD-10 Diagnosis Codes — hidden when encounterPayload provides richer Coding Categories */}
                          {!aiData.encounterPayload?.final_codes_json?.agent4_full?.coding_categories && aiData.diagnosisCodes && (aiData.diagnosisCodes.principal_diagnosis || aiData.diagnosisCodes.primary_diagnosis?.length > 0 || aiData.diagnosisCodes.secondary_diagnoses?.length > 0 || aiData.diagnosisCodes.reason_for_admit?.length > 0) && (
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                              <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center"><Layers className="w-3.5 h-3.5 text-blue-500" /></div>
                                ICD-10 Diagnosis Codes
                              </h4>
                              <div className="space-y-3">
                                {/* Principal Diagnosis */}
                                {aiData.diagnosisCodes.principal_diagnosis && (
                                  <div>
                                    <p className="text-xs font-semibold text-violet-600 mb-1.5">Admit Code</p>
                                    <div className="flex items-start gap-2 p-2.5 bg-violet-50 rounded-lg border border-violet-100">
                                      <span className="text-xs font-mono font-bold text-violet-700 bg-white px-2 py-0.5 rounded border border-violet-200 shrink-0">{str(aiData.diagnosisCodes.principal_diagnosis.icd_10_code)}</span>
                                      <span className="text-sm text-slate-700">{str(aiData.diagnosisCodes.principal_diagnosis.description)}</span>
                                    </div>
                                  </div>
                                )}
                                {/* Reason for Admit */}
                                {aiData.diagnosisCodes.reason_for_admit?.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-cyan-600 mb-1.5">Reason for Admit</p>
                                    <div className="space-y-1.5">
                                      {aiData.diagnosisCodes.reason_for_admit.map((dx, i) => (
                                        <div key={i} className="flex items-start gap-2 p-2.5 bg-cyan-50 rounded-lg border border-cyan-100">
                                          <span className="text-xs font-mono font-bold text-cyan-700 bg-white px-2 py-0.5 rounded border border-cyan-200 shrink-0">{str(dx.icd_10_code)}</span>
                                          <span className="text-sm text-slate-700">{str(dx.description)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {/* Primary Diagnosis */}
                                {aiData.diagnosisCodes.primary_diagnosis?.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-blue-600 mb-1.5">Primary Diagnosis</p>
                                    <div className="space-y-1.5">
                                      {aiData.diagnosisCodes.primary_diagnosis.map((dx, i) => (
                                        <div key={i} className="flex items-start gap-2 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
                                          <span className="text-xs font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200 shrink-0">{str(dx.icd_10_code)}</span>
                                          <span className="text-sm text-slate-700">{str(dx.description)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {/* Secondary Diagnoses */}
                                {aiData.diagnosisCodes.secondary_diagnoses?.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-slate-600 mb-1.5">Secondary Diagnoses</p>
                                    <div className="space-y-1.5">
                                      {aiData.diagnosisCodes.secondary_diagnoses.map((dx, i) => (
                                        <div key={i} className="flex items-start gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                                          <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">{str(dx.icd_10_code)}</span>
                                          <span className="text-sm text-slate-700">{str(dx.description)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {/* E/M Level */}
                                {aiData.diagnosisCodes.ed_em_level?.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-amber-600 mb-1.5">E/M Level</p>
                                    <div className="space-y-1.5">
                                      {aiData.diagnosisCodes.ed_em_level.map((em, i) => (
                                        <div key={i} className="flex items-start gap-2 p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                                          <span className="text-xs font-mono font-bold text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-200 shrink-0">{str(em.code || em.icd_10_code)}</span>
                                          <span className="text-sm text-slate-700">{str(em.description)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {/* Modifiers */}
                                {aiData.diagnosisCodes.modifiers?.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-pink-600 mb-1.5">Modifiers</p>
                                    <div className="space-y-1.5">
                                      {aiData.diagnosisCodes.modifiers.map((mod, i) => (
                                        <div key={i} className="flex items-start gap-2 p-2.5 bg-pink-50 rounded-lg border border-pink-100">
                                          <span className="text-xs font-mono font-bold text-pink-700 bg-white px-2 py-0.5 rounded border border-pink-200 shrink-0">{str(mod.modifier_code)}</span>
                                          <div>
                                            <span className="text-sm text-slate-700">{str(mod.modifier_name)}</span>
                                            {mod.applies_to_code && <p className="text-xs text-slate-500 mt-0.5">Applies to: <span className="font-mono">{str(mod.applies_to_code)}</span></p>}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Procedures (CPT Codes) — hidden when encounterPayload provides richer Coding Categories → procedures */}
                          {!aiData.encounterPayload?.final_codes_json?.agent4_full?.coding_categories?.procedures?.codes?.length && aiData.procedures?.length > 0 && (
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                              <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-teal-50 flex items-center justify-center"><ClipboardPaste className="w-3.5 h-3.5 text-teal-500" /></div>
                                Procedures
                              </h4>
                              <div className="space-y-2.5">
                                {aiData.procedures.map((proc, i) => (
                                  <div key={i} className="p-3 bg-teal-50 rounded-lg border border-teal-100">
                                    <div className="flex items-start gap-2.5">
                                      <span className="text-xs font-mono font-bold text-teal-700 bg-white px-2 py-0.5 rounded border border-teal-200 shrink-0">{str(proc.cpt_code)}</span>
                                      <div>
                                        <p className="text-sm font-medium text-slate-800">{str(proc.procedure_name)}</p>
                                        {proc.description && <p className="text-xs text-slate-600 mt-0.5">{str(proc.description)}</p>}
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs text-slate-500">
                                      {proc.date && <span><span className="font-semibold">Date:</span> {str(proc.date)}</span>}
                                      {proc.provider && <span><span className="font-semibold">Provider:</span> {str(proc.provider)}</span>}
                                      {proc.confidence && <span><span className="font-semibold">Confidence:</span> {str(proc.confidence)}</span>}
                                    </div>
                                    {proc.findings?.length > 0 && (
                                      <div className="mt-2 flex flex-wrap gap-1.5">
                                        {proc.findings.map((f, j) => (
                                          <span key={j} className="text-xs px-2 py-0.5 bg-white text-teal-700 rounded-full border border-teal-200">{str(f)}</span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Medications */}
                          {(aiData.medications?.length > 0 || aiData.aiSummary.medications?.current?.length > 0) && (
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                              <h4 className="text-sm font-semibold text-slate-800 mb-3">Medications</h4>
                              {aiData.medications?.length > 0 ? (
                                <div className="space-y-1.5">
                                  {aiData.medications.map((med, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm">
                                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${med.new_or_existing === 'new' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {str(med.new_or_existing === 'new' ? 'New' : 'Existing')}
                                      </span>
                                      <span className="text-slate-800 font-medium">{str(med.name)}</span>
                                      <span className="text-slate-500">{str(med.dose)}</span>
                                      {med.route && <span className="text-xs text-slate-400">{str(med.route)}</span>}
                                      {med.frequency && <span className="text-xs text-slate-400">({str(med.frequency)})</span>}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {aiData.aiSummary.medications.current.map((med, i) => (
                                    <span key={i} className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full font-medium">{str(med)}</span>
                                  ))}
                                </div>
                              )}
                              {aiData.aiSummary.medications?.allergies?.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-100">
                                  <span className="text-xs font-semibold text-red-600">Allergies: </span>
                                  {aiData.aiSummary.medications.allergies.map((a, i) => (
                                    <span key={i} className="text-xs px-2 py-0.5 bg-red-50 text-red-700 rounded-full border border-red-100 ml-1">{str(a)}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Timeline of Care */}
                          {aiData.aiSummary.timeline_of_care?.length > 0 && (
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                              <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center"><Clock className="w-3.5 h-3.5 text-amber-500" /></div>
                                Timeline of Care
                              </h4>
                              <div className="space-y-3">
                                {aiData.aiSummary.timeline_of_care.map((event, i) => (
                                  <div key={i} className="flex gap-3 relative">
                                    <div className="flex flex-col items-center">
                                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                                      {i < aiData.aiSummary.timeline_of_care.length - 1 && <div className="w-0.5 flex-1 bg-amber-200 mt-1" />}
                                    </div>
                                    <div className="pb-3">
                                      <p className="text-xs font-semibold text-amber-700">{str(event.time)}</p>
                                      <p className="text-sm font-medium text-slate-800">{str(event.event)}</p>
                                      {event.description && <p className="text-xs text-slate-600 mt-0.5">{str(event.description)}</p>}
                                      {event.provider && <p className="text-xs text-slate-400 mt-0.5">{str(event.provider)}</p>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Clinical Alerts */}
                          {aiData.aiSummary.clinical_alerts?.length > 0 && (
                            <div className="bg-white rounded-xl border border-amber-200 p-5">
                              <h4 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-amber-50 flex items-center justify-center"><AlertCircle className="w-3.5 h-3.5 text-amber-500" /></div>
                                Clinical Alerts
                              </h4>
                              {aiData.aiSummary.clinical_alerts.map((alert, i) => (
                                <div key={i} className="p-2.5 bg-amber-50 rounded-lg border border-amber-100 mb-2 last:mb-0">
                                  <div className="flex items-start gap-2">
                                    {alert.severity && (
                                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${alert.severity === 'high' ? 'bg-red-100 text-red-700' :
                                        alert.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                                          'bg-slate-100 text-slate-600'
                                        }`}>{str(alert.severity)}</span>
                                    )}
                                    <p className="text-sm text-amber-900 font-medium">{str(alert.alert)}</p>
                                  </div>
                                  {alert.action_required && (
                                    <p className="text-xs text-amber-700 mt-1.5 ml-0.5"><span className="font-semibold">Action:</span> {str(alert.action_required)}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Diagnostic Results */}
                          {aiData.aiSummary.diagnostic_results && (aiData.aiSummary.diagnostic_results.labs?.length > 0 || aiData.aiSummary.diagnostic_results.imaging?.length > 0 || aiData.aiSummary.diagnostic_results.other_tests?.length > 0 || (aiData.aiSummary.diagnostic_results.ekg && aiData.aiSummary.diagnostic_results.ekg !== 'N/A')) && (
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                              <h4 className="text-sm font-semibold text-slate-800 mb-3">Diagnostic Results</h4>
                              {aiData.aiSummary.diagnostic_results.ekg && aiData.aiSummary.diagnostic_results.ekg !== 'N/A' && (
                                <p className="text-sm text-slate-700 mb-2"><span className="font-semibold text-slate-500">EKG:</span> {str(aiData.aiSummary.diagnostic_results.ekg)}</p>
                              )}
                              {aiData.aiSummary.diagnostic_results.labs?.length > 0 && (
                                <div className="mb-2">
                                  <p className="text-xs font-semibold text-slate-500 mb-1">Labs</p>
                                  <ul className="space-y-1">
                                    {aiData.aiSummary.diagnostic_results.labs.map((lab, i) => (
                                      <li key={i} className="text-sm text-slate-700">{str(typeof lab === 'string' ? lab : lab?.test ? `${lab.test}: ${lab.result || ''}` : JSON.stringify(lab))}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {aiData.aiSummary.diagnostic_results.imaging?.length > 0 && (
                                <div className="mb-2">
                                  <p className="text-xs font-semibold text-slate-500 mb-1">Imaging</p>
                                  <ul className="space-y-1">
                                    {aiData.aiSummary.diagnostic_results.imaging.map((img, i) => (
                                      <li key={i} className="text-sm text-slate-700">{str(typeof img === 'string' ? img : img?.test ? `${img.test}: ${img.result || ''}` : JSON.stringify(img))}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {aiData.aiSummary.diagnostic_results.other_tests?.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-slate-500 mb-1">Other Tests</p>
                                  <ul className="space-y-1">
                                    {aiData.aiSummary.diagnostic_results.other_tests.map((test, i) => (
                                      <li key={i} className="text-sm text-slate-700">{str(typeof test === 'string' ? test : test?.test ? `${test.test}: ${test.result || ''}` : JSON.stringify(test))}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Coding Notes — hidden when encounterPayload provides populated Coding Feedback */}
                          {!aiData.encounterPayload?.final_codes_json?.agent4_full?.feedback && aiData.codingNotes && Object.keys(aiData.codingNotes).length > 0 && (
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                              <h4 className="text-sm font-semibold text-slate-800 mb-3">Coding Notes</h4>
                              <div className="space-y-4">
                                {aiData.codingNotes.coding_tips?.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-indigo-600 mb-2">Coding Tips</p>
                                    <div className="space-y-2">
                                      {aiData.codingNotes.coding_tips.map((item, i) => (
                                        <div key={i} className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                                          <p className="text-sm text-slate-800 font-medium">{str(item.tip)}</p>
                                          {item.related_code && (
                                            <p className="text-xs text-slate-500 mt-1">
                                              <span className="font-medium">Related Code:</span> <span className="font-mono bg-white px-1.5 py-0.5 rounded text-indigo-700">{str(item.related_code)}</span>
                                            </p>
                                          )}
                                          {item.potential_impact && (
                                            <p className="text-xs text-slate-500 mt-1"><span className="font-medium">Impact:</span> {str(item.potential_impact)}</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {aiData.codingNotes.compliance_alerts?.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-amber-600 mb-2">Compliance Alerts</p>
                                    <div className="space-y-2">
                                      {aiData.codingNotes.compliance_alerts.map((item, i) => (
                                        <div key={i} className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                                          <div className="flex items-start gap-2">
                                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${item.severity === 'high' ? 'bg-red-100 text-red-700' :
                                              item.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                'bg-slate-100 text-slate-600'
                                              }`}>{str(item.severity)}</span>
                                            <p className="text-sm text-slate-800 font-medium">{str(item.alert)}</p>
                                          </div>
                                          {item.regulation && (
                                            <p className="text-xs text-slate-500 mt-1"><span className="font-medium">Regulation:</span> {str(item.regulation)}</p>
                                          )}
                                          {item.recommended_action && (
                                            <p className="text-xs text-slate-500 mt-1"><span className="font-medium">Action:</span> {str(item.recommended_action)}</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {aiData.codingNotes.documentation_gaps?.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-rose-600 mb-2">Documentation Gaps</p>
                                    <div className="space-y-2">
                                      {aiData.codingNotes.documentation_gaps.map((item, i) => (
                                        <div key={i} className="bg-rose-50 rounded-lg p-3 border border-rose-100">
                                          <div className="flex items-start gap-2">
                                            <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${item.priority === 'high' ? 'bg-red-100 text-red-700' :
                                              item.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                'bg-slate-100 text-slate-600'
                                              }`}>{str(item.priority)}</span>
                                            <p className="text-sm text-slate-800 font-medium">{str(item.gap)}</p>
                                          </div>
                                          {item.impact && (
                                            <p className="text-xs text-slate-500 mt-1"><span className="font-medium">Impact:</span> {str(item.impact)}</p>
                                          )}
                                          {item.suggestion && (
                                            <p className="text-xs text-emerald-700 mt-1 bg-emerald-50 px-2 py-1 rounded"><span className="font-medium">Suggestion:</span> {str(item.suggestion)}</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {aiData.codingNotes.physician_queries_needed?.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-violet-600 mb-2">Physician Queries Needed</p>
                                    <div className="space-y-2">
                                      {aiData.codingNotes.physician_queries_needed.map((item, i) => (
                                        <div key={i} className="bg-violet-50 rounded-lg p-3 border border-violet-100">
                                          <div className="flex items-start gap-2">
                                            {item.priority && (
                                              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${item.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                item.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                                                  'bg-slate-100 text-slate-600'
                                                }`}>{str(item.priority)}</span>
                                            )}
                                            <p className="text-sm text-slate-800 font-medium">{str(item.query)}</p>
                                          </div>
                                          {item.reason && (
                                            <p className="text-xs text-slate-500 mt-1"><span className="font-medium">Reason:</span> {str(item.reason)}</p>
                                          )}
                                          {item.impact_on_coding && (
                                            <p className="text-xs text-slate-500 mt-1"><span className="font-medium">Coding Impact:</span> {str(item.impact_on_coding)}</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* ═══════════════════════════════════════════════════════
                              Encounter Payload — raw fields from the ICD Predictor
                              (clinical_summary, final_codes_json, agent4_full.*).
                              pipeline_timing is intentionally excluded.
                              ═══════════════════════════════════════════════════════ */}

                          {/* Encounter Details header */}
                          {aiData.encounterPayload && (
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                              <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center"><FileText className="w-3.5 h-3.5 text-indigo-500" /></div>
                                Encounter Details
                              </h4>
                              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                {aiData.encounterPayload.chart_number && <div><span className="font-semibold text-slate-500">Chart #:</span> <span className="text-slate-700">{str(aiData.encounterPayload.chart_number)}</span></div>}
                                {aiData.encounterPayload.encounter_type && <div><span className="font-semibold text-slate-500">Type:</span> <span className="text-slate-700">{str(aiData.encounterPayload.encounter_type)}</span></div>}
                                {aiData.encounterPayload.encounter_date && <div><span className="font-semibold text-slate-500">Date:</span> <span className="text-slate-700">{str(aiData.encounterPayload.encounter_date)}</span></div>}
                                {aiData.encounterPayload.facility && <div><span className="font-semibold text-slate-500">Facility:</span> <span className="text-slate-700">{str(aiData.encounterPayload.facility)}</span></div>}
                                {aiData.encounterPayload.department && <div><span className="font-semibold text-slate-500">Department:</span> <span className="text-slate-700">{str(aiData.encounterPayload.department)}</span></div>}
                                {aiData.encounterPayload.status && <div><span className="font-semibold text-slate-500">Status:</span> <span className="text-slate-700">{str(aiData.encounterPayload.status)}</span></div>}
                                {aiData.encounterPayload.report_count != null && <div><span className="font-semibold text-slate-500">Reports:</span> <span className="text-slate-700">{str(aiData.encounterPayload.report_count)}</span></div>}
                                {aiData.encounterPayload.created_at && <div className="col-span-2"><span className="font-semibold text-slate-500">Created:</span> <span className="text-slate-700">{new Date(aiData.encounterPayload.created_at).toLocaleString()}</span></div>}
                              </div>
                            </div>
                          )}

                          {/* Coding Categories (with evidence + ai_reasoning) */}
                          {aiData.encounterPayload?.final_codes_json?.agent4_full?.coding_categories && (() => {
                            const cats = aiData.encounterPayload.final_codes_json.agent4_full.coding_categories;
                            const hasAny = Object.values(cats).some(c => c?.codes?.length > 0);
                            if (!hasAny) return null;
                            // Per-category palette: matches the existing ICD-10 card colors so both views feel consistent.
                            const catPalette = {
                              primary_diagnosis:   { label: 'text-blue-700',    card: 'bg-blue-50 border-blue-100',       code: 'text-blue-700 border-blue-200',    quote: 'border-blue-300'    },
                              secondary_diagnoses: { label: 'text-slate-700',   card: 'bg-slate-50 border-slate-200',     code: 'text-slate-700 border-slate-200',  quote: 'border-slate-300'   },
                              reason_for_admit:    { label: 'text-cyan-700',    card: 'bg-cyan-50 border-cyan-100',       code: 'text-cyan-700 border-cyan-200',    quote: 'border-cyan-300'    },
                              ed_em_level:         { label: 'text-amber-700',   card: 'bg-amber-50 border-amber-100',     code: 'text-amber-700 border-amber-200',  quote: 'border-amber-300'   },
                              modifiers:           { label: 'text-pink-700',    card: 'bg-pink-50 border-pink-100',       code: 'text-pink-700 border-pink-200',    quote: 'border-pink-300'    },
                              procedures:          { label: 'text-teal-700',    card: 'bg-teal-50 border-teal-100',       code: 'text-teal-700 border-teal-200',    quote: 'border-teal-300'    },
                              principal_diagnosis: { label: 'text-violet-700',  card: 'bg-violet-50 border-violet-100',   code: 'text-violet-700 border-violet-200', quote: 'border-violet-300' },
                            };
                            const defaultPalette = { label: 'text-slate-600', card: 'bg-slate-50 border-slate-200', code: 'text-slate-700 border-slate-200', quote: 'border-slate-300' };
                            const confBadge = (conf) => {
                              const c = String(conf).toLowerCase();
                              if (c === 'high') return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
                              if (c === 'medium') return 'bg-amber-100 text-amber-700 border border-amber-200';
                              if (c === 'low') return 'bg-red-100 text-red-700 border border-red-200';
                              return 'bg-slate-100 text-slate-600 border border-slate-200';
                            };
                            return (
                              <div className="bg-white rounded-xl border border-slate-200 p-5">
                                <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-md bg-purple-50 flex items-center justify-center"><Layers className="w-3.5 h-3.5 text-purple-500" /></div>
                                  Coding Categories
                                </h4>
                                {Object.entries(cats).map(([category, bucket]) => {
                                  if (!(bucket?.codes?.length > 0)) return null;
                                  const p = catPalette[category] || defaultPalette;
                                  return (
                                    <div key={category} className="mb-3 last:mb-0">
                                      <p className={`text-xs font-semibold mb-1.5 capitalize ${p.label}`}>{str(category.replace(/_/g, ' '))}</p>
                                      <div className="space-y-2">
                                        {bucket.codes.map((c, i) => (
                                          <div key={i} className={`p-2.5 rounded-lg border ${p.card}`}>
                                            <div className="flex items-start gap-2">
                                              <span className={`text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border shrink-0 ${p.code}`}>{str(c.code || c.icd_10_code || c.cpt_code || c.modifier_code)}</span>
                                              <div className="flex-1">
                                                {(c.description || c.modifier_name || c.procedure_name) && (
                                                  <p className="text-sm text-slate-800">{str(c.description || c.modifier_name || c.procedure_name)}</p>
                                                )}
                                                <div className="flex items-center flex-wrap gap-2 mt-1 text-xs text-slate-500">
                                                  {c.confidence && (
                                                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${confBadge(c.confidence)}`}>{str(c.confidence)}</span>
                                                  )}
                                                  {c.applies_to_code && <span>Applies to: <span className="font-mono">{str(c.applies_to_code)}</span></span>}
                                                  {c.date && <span>Date: {str(c.date)}</span>}
                                                  {c.provider && <span>Provider: {str(c.provider)}</span>}
                                                </div>
                                                {c.ai_reasoning && <p className="text-xs text-slate-700 mt-1.5">{str(c.ai_reasoning)}</p>}
                                                {c.evidence?.exact_text && (
                                                  <blockquote className={`text-xs text-slate-600 mt-1.5 border-l-2 pl-2 italic ${p.quote}`}>"{str(c.evidence.exact_text)}"</blockquote>
                                                )}
                                                {c.findings?.length > 0 && (
                                                  <div className="mt-1.5 flex flex-wrap gap-1">
                                                    {c.findings.map((f, j) => <span key={j} className="text-xs px-1.5 py-0.5 bg-white rounded border border-slate-200">{str(f)}</span>)}
                                                  </div>
                                                )}
                                                {c.level_justification && (
                                                  <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-slate-600">
                                                    {Object.entries(c.level_justification).filter(([, v]) => v).map(([k, v]) => (
                                                      <div key={k}><span className="font-semibold capitalize text-slate-500">{str(k.replace(/_/g, ' '))}:</span> {str(v)}</div>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}

                          {/* Coding Feedback (coding_tips, compliance_alerts, documentation_gaps, physician_queries) */}
                          {aiData.encounterPayload?.final_codes_json?.agent4_full?.feedback && (() => {
                            const fb = aiData.encounterPayload.final_codes_json.agent4_full.feedback;
                            const hasAny = fb.coding_tips?.length > 0 || fb.compliance_alerts?.length > 0 || fb.documentation_gaps?.length > 0 || fb.physician_queries_needed?.length > 0;
                            if (!hasAny) return null;
                            return (
                              <div className="bg-white rounded-xl border border-slate-200 p-5">
                                <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center"><Sparkles className="w-3.5 h-3.5 text-indigo-500" /></div>
                                  Coding Feedback
                                </h4>
                                {fb.coding_tips?.length > 0 && (
                                  <div className="mb-4">
                                    <p className="text-xs font-semibold text-indigo-600 mb-2">Coding Tips</p>
                                    <div className="space-y-2">
                                      {fb.coding_tips.map((item, i) => (
                                        <div key={i} className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                                          <p className="text-sm text-slate-800 font-medium">{str(item.tip)}</p>
                                          {item.related_code && (
                                            <p className="text-xs text-slate-500 mt-1"><span className="font-medium">Related Code:</span> <span className="font-mono bg-white px-1.5 py-0.5 rounded text-indigo-700">{str(item.related_code)}</span></p>
                                          )}
                                          {item.potential_impact && (
                                            <p className="text-xs text-slate-500 mt-1"><span className="font-medium">Impact:</span> {str(item.potential_impact)}</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {fb.compliance_alerts?.length > 0 && (
                                  <div className="mb-4">
                                    <p className="text-xs font-semibold text-amber-600 mb-2">Compliance Alerts</p>
                                    <div className="space-y-2">
                                      {fb.compliance_alerts.map((item, i) => (
                                        <div key={i} className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                                          <div className="flex items-start gap-2">
                                            {item.severity && (
                                              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${item.severity === 'high' ? 'bg-red-100 text-red-700' : item.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{str(item.severity)}</span>
                                            )}
                                            <p className="text-sm text-slate-800 font-medium">{str(item.alert)}</p>
                                          </div>
                                          {item.regulation && (
                                            <p className="text-xs text-slate-500 mt-1"><span className="font-medium">Regulation:</span> {str(item.regulation)}</p>
                                          )}
                                          {item.recommended_action && (
                                            <p className="text-xs text-slate-500 mt-1"><span className="font-medium">Action:</span> {str(item.recommended_action)}</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {fb.documentation_gaps?.length > 0 && (
                                  <div className="mb-4">
                                    <p className="text-xs font-semibold text-rose-600 mb-2">Documentation Gaps</p>
                                    <div className="space-y-2">
                                      {fb.documentation_gaps.map((item, i) => (
                                        <div key={i} className="bg-rose-50 rounded-lg p-3 border border-rose-100">
                                          <div className="flex items-start gap-2">
                                            {item.priority && (
                                              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${item.priority === 'high' ? 'bg-red-100 text-red-700' : item.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{str(item.priority)}</span>
                                            )}
                                            <p className="text-sm text-slate-800 font-medium">{str(item.gap)}</p>
                                          </div>
                                          {item.impact && (
                                            <p className="text-xs text-slate-500 mt-1"><span className="font-medium">Impact:</span> {str(item.impact)}</p>
                                          )}
                                          {item.suggestion && (
                                            <p className="text-xs text-emerald-700 mt-1 bg-emerald-50 px-2 py-1 rounded"><span className="font-medium">Suggestion:</span> {str(item.suggestion)}</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {fb.physician_queries_needed?.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-violet-600 mb-2">Physician Queries Needed</p>
                                    <div className="space-y-2">
                                      {fb.physician_queries_needed.map((item, i) => (
                                        <div key={i} className="bg-violet-50 rounded-lg p-3 border border-violet-100">
                                          <div className="flex items-start gap-2">
                                            {item.priority && (
                                              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${item.priority === 'high' ? 'bg-red-100 text-red-700' : item.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{str(item.priority)}</span>
                                            )}
                                            <p className="text-sm text-slate-800 font-medium">{str(item.query)}</p>
                                          </div>
                                          {item.reason && (
                                            <p className="text-xs text-slate-500 mt-1"><span className="font-medium">Reason:</span> {str(item.reason)}</p>
                                          )}
                                          {item.impact_on_coding && (
                                            <p className="text-xs text-slate-500 mt-1"><span className="font-medium">Coding Impact:</span> {str(item.impact_on_coding)}</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {/* Audit Notes */}
                          {(aiData.encounterPayload?.final_codes_json?.agent4_full?.audit_notes || aiData.encounterPayload?.final_codes_json?.audit_notes) && (
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                              <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center"><ClipboardPaste className="w-3.5 h-3.5 text-slate-500" /></div>
                                Audit Notes
                              </h4>
                              <p className="text-sm text-slate-700 whitespace-pre-wrap">{str(aiData.encounterPayload.final_codes_json.agent4_full?.audit_notes || aiData.encounterPayload.final_codes_json.audit_notes)}</p>
                            </div>
                          )}

                          {/* Total codes extracted */}
                          {aiData.encounterPayload?.final_codes_json?.agent4_full?.metadata?.total_codes_extracted != null && (
                            <div className="text-xs text-slate-400 text-center">
                              Total codes extracted: {str(aiData.encounterPayload.final_codes_json.agent4_full.metadata.total_codes_extracted)}
                            </div>
                          )}
                        </div>
                      ) : aiData?.aiStatus === 'processing' || aiData?.aiStatus === 'queued' ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
                          <p className="text-base font-medium text-slate-700">AI is processing...</p>
                          <p className="text-sm text-slate-400 mt-1">Summary will appear here when ready</p>
                        </div>
                      ) : aiData?.aiStatus === 'failed' ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <AlertCircle className="w-10 h-10 text-red-400 mb-4" />
                          <p className="text-base font-medium text-red-700">Processing Failed</p>
                          <p className="text-sm text-red-500 mt-1">{str(aiData?.lastError) || 'An error occurred'}</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <Sparkles className="w-10 h-10 text-slate-300 mb-4" />
                          <p className="text-base font-medium text-slate-500">No AI Summary</p>
                          <p className="text-sm text-slate-400 mt-1">Upload and process documents to generate AI insights</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Review & Edit Popup Modal ── */}
      {reviewPopupOpen && (() => {
        const str = (val) => {
          if (val == null) return '';
          if (typeof val === 'string') return val;
          if (typeof val === 'number' || typeof val === 'boolean') return String(val);
          return JSON.stringify(val);
        };
        const getCode = (item) => str(item?.icd_10_code || item?.code || item?.cpt_code || (typeof item === 'string' ? item : ''));
        const getDesc = (item) => str(item?.description || item?.finding || '');

        // Collect all codes into a flat list with category labels
        const allCodes = [];
        // Principal diagnosis (single object)
        if (aiData?.diagnosisCodes?.principal_diagnosis) {
          const dx = aiData.diagnosisCodes.principal_diagnosis;
          allCodes.push({ ...dx, _category: 'Admit Code', _key: 'principal-0', _code: getCode(dx), _desc: getDesc(dx), _type: 'icd' });
        }
        if (aiData?.diagnosisCodes?.primary_diagnosis) {
          aiData.diagnosisCodes.primary_diagnosis.forEach((dx, i) => {
            allCodes.push({ ...dx, _category: 'Primary', _key: `primary-${i}`, _code: getCode(dx), _desc: getDesc(dx), _type: 'icd' });
          });
        }
        if (aiData?.diagnosisCodes?.secondary_diagnoses) {
          aiData.diagnosisCodes.secondary_diagnoses.forEach((dx, i) => {
            allCodes.push({ ...dx, _category: 'Secondary', _key: `secondary-${i}`, _code: getCode(dx), _desc: getDesc(dx), _type: 'icd' });
          });
        }
        if (aiData?.diagnosisCodes?.reason_for_admit) {
          aiData.diagnosisCodes.reason_for_admit.forEach((dx, i) => {
            allCodes.push({ ...dx, _category: 'Reason for Admit', _key: `admit-${i}`, _code: getCode(dx), _desc: getDesc(dx), _type: 'icd' });
          });
        }
        if (aiData?.diagnosisCodes?.ed_em_level) {
          aiData.diagnosisCodes.ed_em_level.forEach((em, i) => {
            allCodes.push({ ...em, _category: 'E/M Level', _key: `em-${i}`, _code: getCode(em), _desc: getDesc(em), _type: 'icd' });
          });
        }
        // Procedures (CPT codes)
        if (aiData?.procedures) {
          aiData.procedures.forEach((proc, i) => {
            allCodes.push({ ...proc, _category: 'Procedure', _key: `proc-${i}`, _code: getCode(proc), _desc: str(proc.description || proc.procedure_name || ''), _type: 'cpt' });
          });
        }
        // User-added custom codes
        customCodes.forEach((cc) => {
          allCodes.push(cc);
        });

        const getBadgeStyle = (code) => {
          const decision = codeDecisions[code._key];
          const isSelected = selectedCode?._key === code._key;
          if (code._isCustom) return { bg: '#fdf4ff', border: '#e879f9', color: '#86198f' };
          if (decision?.status === 'accepted') return { bg: '#dcfce7', border: '#86efac', color: '#166534' };
          if (decision?.status === 'rejected') return { bg: '#fef2f2', border: '#fca5a5', color: '#991b1b' };
          if (decision?.status === 'edited') return { bg: '#dbeafe', border: '#93c5fd', color: '#1e40af' };
          if (isSelected) return { bg: '#fef3c7', border: '#fbbf24', color: '#92400e' };
          return { bg: '#f8fafc', border: '#e2e8f0', color: '#475569' };
        };

        const getStatusIcon = (code) => {
          const decision = codeDecisions[code._key];
          if (decision?.status === 'accepted') return <Check style={{ width: 10, height: 10 }} />;
          if (decision?.status === 'rejected') return <X style={{ width: 10, height: 10 }} />;
          if (decision?.status === 'edited') return <Pencil style={{ width: 10, height: 10 }} />;
          return null;
        };

        const handleAccept = (code) => {
          setCodeDecisions(prev => ({ ...prev, [code._key]: { status: 'accepted' } }));
          setEditingCode(null);
          setRejectingCode(null);
        };
        const handleStartReject = (code) => {
          const prev = codeDecisions[code._key];
          setRejectingCode({
            _key: code._key,
            reason: prev?.reason || '',
            reasonOptionId: prev?.reasonOptionId || null,
            reasonOptionLabel: prev?.reasonOptionLabel || '',
          });
          setEditingCode(null);
        };
        const handleConfirmReject = () => {
          if (!rejectingCode || rejectingCode.reason.length < 20) return;
          setCodeDecisions(prev => ({
            ...prev,
            [rejectingCode._key]: {
              status: 'rejected',
              reason: rejectingCode.reason,
              reasonOptionId: rejectingCode.reasonOptionId || null,
              reasonOptionLabel: rejectingCode.reasonOptionLabel || '',
            },
          }));
          setRejectingCode(null);
        };
        const handleStartEdit = (code) => {
          const decision = codeDecisions[code._key];
          setEditingCode({
            _key: code._key,
            editedCode: decision?.editedCode || code._code,
            editedDesc: decision?.editedDesc || code._desc,
            reason: decision?.reason || '',
            reasonOptionId: decision?.reasonOptionId || null,
            reasonOptionLabel: decision?.reasonOptionLabel || '',
          });
          setRejectingCode(null);
        };
        const handleSaveEdit = () => {
          if (!editingCode || (editingCode.reason || '').length < 20) return;
          setCodeDecisions(prev => ({
            ...prev,
            [editingCode._key]: {
              status: 'edited',
              editedCode: editingCode.editedCode,
              editedDesc: editingCode.editedDesc,
              reason: editingCode.reason,
              reasonOptionId: editingCode.reasonOptionId || null,
              reasonOptionLabel: editingCode.reasonOptionLabel || '',
            },
          }));
          setEditingCode(null);
        };

        const handleAddCode = () => {
          if (!newCodeForm.code.trim() || (newCodeForm.reason || '').length < 20) return;
          const key = `custom-${Date.now()}`;
          const newCode = {
            _key: key,
            _code: newCodeForm.code.trim(),
            _desc: newCodeForm.description.trim(),
            _category: newCodeForm.category,
            _type: newCodeForm.type,
            _reason: newCodeForm.reason,
            _reasonOptionId: newCodeForm.reasonOptionId || null,
            _reasonOptionLabel: newCodeForm.reasonOptionLabel || '',
            _isCustom: true,
          };
          setCustomCodes(prev => [...prev, newCode]);
          setCodeDecisions(prev => ({
            ...prev,
            [key]: {
              status: 'accepted',
              reason: newCodeForm.reason,
              reasonOptionId: newCodeForm.reasonOptionId || null,
              reasonOptionLabel: newCodeForm.reasonOptionLabel || '',
            },
          }));
          setNewCodeForm({ code: '', description: '', type: 'icd', category: 'Secondary', reason: '', reasonOptionId: null, reasonOptionLabel: '' });
          setAddingCode(false);
          // Select the newly added code
          setTimeout(() => setSelectedCode(newCode), 0);
        };

        const handleDeleteCustomCode = (key) => {
          setCustomCodes(prev => prev.filter(c => c._key !== key));
          setCodeDecisions(prev => { const next = { ...prev }; delete next[key]; return next; });
          if (selectedCode?._key === key) setSelectedCode(null);
        };

        const isReviewAiView = reviewTab === "ai-summary";

        // Auto-select first code when popup opens
        if (!selectedCode && allCodes.length > 0) {
          // Use setTimeout to avoid setState during render
          setTimeout(() => setSelectedCode(allCodes[0]), 0);
        }

        // Navigate to next/previous code
        const currentIdx = allCodes.findIndex(c => c._key === selectedCode?._key);
        const goToNext = () => {
          if (currentIdx < allCodes.length - 1) {
            setSelectedCode(allCodes[currentIdx + 1]);
            setEditingCode(null);
          }
        };
        const goToPrev = () => {
          if (currentIdx > 0) {
            setSelectedCode(allCodes[currentIdx - 1]);
            setEditingCode(null);
          }
        };

        return (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => { setReviewPopupOpen(false); setEditingCode(null); }}
          >
            <div
              className="bg-slate-50 rounded-2xl shadow-2xl w-[96vw] h-[94vh] max-w-[1600px] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Header Bar ── */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 20px", background: "#1a1d23", borderRadius: "16px 16px 0 0",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
                    Review & Edit
                  </span>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 12px",
                  }}>
                    <Clock style={{ width: 14, height: 14, color: "#fbbf24" }} />
                    <span style={{ color: "#fbbf24", fontSize: 14, fontWeight: 700, fontFamily: "monospace" }}>
                      {formatTime(timerSeconds)}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    onClick={() => setSubmitPopupOpen(true)}
                    style={{
                      padding: "7px 16px", borderRadius: 8, border: "none",
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6,
                    }}
                  >
                    <CheckCircle2 style={{ width: 14, height: 14 }} /> Review & Submit
                  </button>
                  <button
                    onClick={() => { setReviewPopupOpen(false); setEditingCode(null); }}
                    style={{
                      width: 32, height: 32, borderRadius: 8, border: "none",
                      background: "rgba(255,255,255,0.1)", color: "#94a3b8", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <X style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              </div>

              {/* ── Body ── */}
              <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                {/* ── Left Panel (60%) ── */}
                <div style={{ width: "60%", display: "flex", flexDirection: "column", borderRight: "1px solid #e2e8f0" }}>
                  {/* Tab Switcher */}
                  <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #e2e8f0", background: "#fff" }}>
                    {[
                      { key: "document", label: "Document", icon: <FileText style={{ width: 14, height: 14 }} /> },
                      { key: "ai-summary", label: "AI Summary", icon: <Sparkles style={{ width: 14, height: 14 }} /> },
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setReviewTab(tab.key)}
                        style={{
                          flex: 1, padding: "10px 16px", border: "none", cursor: "pointer",
                          background: reviewTab === tab.key ? "#fff" : "#f8fafc",
                          borderBottom: reviewTab === tab.key ? "2px solid #f59e0b" : "2px solid transparent",
                          color: reviewTab === tab.key ? "#1a1d23" : "#94a3b8",
                          fontSize: 13, fontWeight: 600,
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          transition: "all 0.15s",
                        }}
                      >
                        {tab.icon} {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Document Switcher (only in document tab when multiple docs) */}
                  {!isReviewAiView && aiData?.documents?.length > 1 && (
                    <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #e2e8f0", background: "#fff", overflowX: "auto" }}>
                      {aiData.documents.map((doc, idx) => (
                        <button
                          key={doc.id}
                          onClick={() => setReviewDocIndex(idx)}
                          style={{
                            padding: "8px 14px", border: "none", cursor: "pointer",
                            background: reviewDocIndex === idx ? "#fffbeb" : "#fff",
                            borderBottom: reviewDocIndex === idx ? "2px solid #d97706" : "2px solid transparent",
                            color: reviewDocIndex === idx ? "#92400e" : "#94a3b8",
                            fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                            display: "flex", alignItems: "center", gap: 5,
                            transition: "all 0.15s",
                          }}
                        >
                          {doc.mimeType === 'application/pdf'
                            ? <FileText style={{ width: 12, height: 12 }} />
                            : doc.mimeType?.startsWith('image/')
                              ? <FileImage style={{ width: 12, height: 12 }} />
                              : <FileIcon style={{ width: 12, height: 12 }} />
                          }
                          {doc.filename || `Document ${idx + 1}`}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Content Area */}
                  <div style={{ flex: 1, overflow: "hidden", background: "#f8fafc" }}>
                    {!isReviewAiView ? (
                      (() => {
                        const currentDoc = aiData?.documents?.[reviewDocIndex];
                        const docUrl = currentDoc?.s3Url;
                        return docUrl ? (
                          <iframe src={docUrl} title="Document Viewer" style={{ width: "100%", height: "100%", border: "none" }} />
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8" }}>
                            <FileText style={{ width: 40, height: 40, marginBottom: 12, opacity: 0.4 }} />
                            <p style={{ fontSize: 14, fontWeight: 500 }}>No document available</p>
                          </div>
                        );
                      })()
                    ) : (
                      <div style={{ height: "100%", overflowY: "auto", padding: 24 }}>
                        {aiData?.aiStatus === 'ready' && aiData?.aiSummary ? (
                          <div style={{ maxWidth: 700, margin: "0 auto" }}>
                            {/* Patient Information */}
                            {(aiData.aiSummary.patient_demographics || aiData.aiSummary.attending_provider) && (
                              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, marginBottom: 16 }}>
                                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                                  <Sparkles style={{ width: 14, height: 14, color: "#3b82f6" }} /> Patient Information
                                </h4>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", fontSize: 13, color: "#475569" }}>
                                  {aiData.aiSummary.patient_demographics?.age && <span><span style={{ fontWeight: 600, color: "#64748b" }}>Age:</span> {str(aiData.aiSummary.patient_demographics.age)}</span>}
                                  {aiData.aiSummary.patient_demographics?.sex && <span><span style={{ fontWeight: 600, color: "#64748b" }}>Sex:</span> {str(aiData.aiSummary.patient_demographics.sex)}</span>}
                                  {aiData.aiSummary.patient_demographics?.weight && <span><span style={{ fontWeight: 600, color: "#64748b" }}>Weight:</span> {str(aiData.aiSummary.patient_demographics.weight)}</span>}
                                  {aiData.aiSummary.attending_provider && <span><span style={{ fontWeight: 600, color: "#64748b" }}>Attending:</span> {str(aiData.aiSummary.attending_provider)}</span>}
                                  {aiData.aiSummary.consulting_providers?.length > 0 && <span><span style={{ fontWeight: 600, color: "#64748b" }}>Consulting:</span> {aiData.aiSummary.consulting_providers.map(str).join(', ')}</span>}
                                </div>
                                {aiData.aiSummary.patient_demographics?.allergies?.length > 0 && (
                                  <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: "#dc2626" }}>Allergies:</span>
                                    {aiData.aiSummary.patient_demographics.allergies.map((a, i) => (
                                      <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}>{str(a)}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Chief Complaint */}
                            {aiData.aiSummary.chief_complaint?.text && (
                              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, marginBottom: 16 }}>
                                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                                  <Sparkles style={{ width: 14, height: 14, color: "#a855f7" }} /> Chief Complaint
                                </h4>
                                <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7 }}>{str(aiData.aiSummary.chief_complaint.text)}</p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", marginTop: 8, fontSize: 11, color: "#64748b" }}>
                                  {aiData.aiSummary.chief_complaint.onset && aiData.aiSummary.chief_complaint.onset !== 'N/A' && <span><span style={{ fontWeight: 600 }}>Onset:</span> {str(aiData.aiSummary.chief_complaint.onset)}</span>}
                                  {aiData.aiSummary.chief_complaint.duration && aiData.aiSummary.chief_complaint.duration !== 'N/A' && <span><span style={{ fontWeight: 600 }}>Duration:</span> {str(aiData.aiSummary.chief_complaint.duration)}</span>}
                                  {aiData.aiSummary.chief_complaint.severity && aiData.aiSummary.chief_complaint.severity !== 'N/A' && <span><span style={{ fontWeight: 600 }}>Severity:</span> {str(aiData.aiSummary.chief_complaint.severity)}</span>}
                                </div>
                                {aiData.aiSummary.chief_complaint.associated_symptoms?.length > 0 && (
                                  <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>Associated:</span>
                                    {aiData.aiSummary.chief_complaint.associated_symptoms.map((s, i) => (
                                      <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 12, background: "#faf5ff", color: "#7c3aed" }}>{str(s)}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* History of Present Illness */}
                            {aiData.aiSummary.history_of_present_illness?.text && (
                              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, marginBottom: 16 }}>
                                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>History of Present Illness</h4>
                                <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{str(aiData.aiSummary.history_of_present_illness.text)}</p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", marginTop: 10, fontSize: 11, color: "#64748b" }}>
                                  {aiData.aiSummary.history_of_present_illness.location && aiData.aiSummary.history_of_present_illness.location !== 'N/A' && <span><span style={{ fontWeight: 600 }}>Location:</span> {str(aiData.aiSummary.history_of_present_illness.location)}</span>}
                                  {aiData.aiSummary.history_of_present_illness.severity && aiData.aiSummary.history_of_present_illness.severity !== 'N/A' && <span><span style={{ fontWeight: 600 }}>Severity:</span> {str(aiData.aiSummary.history_of_present_illness.severity)}</span>}
                                  {aiData.aiSummary.history_of_present_illness.duration && aiData.aiSummary.history_of_present_illness.duration !== 'N/A' && <span><span style={{ fontWeight: 600 }}>Duration:</span> {str(aiData.aiSummary.history_of_present_illness.duration)}</span>}
                                  {aiData.aiSummary.history_of_present_illness.quality && aiData.aiSummary.history_of_present_illness.quality !== 'N/A' && <span><span style={{ fontWeight: 600 }}>Quality:</span> {str(aiData.aiSummary.history_of_present_illness.quality)}</span>}
                                  {aiData.aiSummary.history_of_present_illness.modifying_factors && aiData.aiSummary.history_of_present_illness.modifying_factors !== 'N/A' && <span><span style={{ fontWeight: 600 }}>Modifying Factors:</span> {str(aiData.aiSummary.history_of_present_illness.modifying_factors)}</span>}
                                </div>
                                {aiData.aiSummary.history_of_present_illness.associated_signs_symptoms && aiData.aiSummary.history_of_present_illness.associated_signs_symptoms !== 'N/A' && (
                                  <p style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}><span style={{ fontWeight: 600 }}>Associated Signs/Symptoms:</span> {str(aiData.aiSummary.history_of_present_illness.associated_signs_symptoms)}</p>
                                )}
                              </div>
                            )}

                            {/* Review of Systems */}
                            {aiData.aiSummary.review_of_systems && Object.values(aiData.aiSummary.review_of_systems).some(v => v && v !== 'N/A') && (
                              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, marginBottom: 16 }}>
                                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>Review of Systems</h4>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
                                  {Object.entries(aiData.aiSummary.review_of_systems).filter(([, v]) => v && v !== 'N/A').map(([system, value]) => (
                                    <div key={system} style={{ fontSize: 13 }}>
                                      <span style={{ fontWeight: 600, color: "#64748b", textTransform: "capitalize" }}>{str(system.replace(/_/g, ' '))}:</span>{' '}
                                      <span style={{ color: "#475569" }}>{str(value)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Physical Examination */}
                            {aiData.aiSummary.physical_examination && (
                              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, marginBottom: 16 }}>
                                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>Physical Examination</h4>
                                {aiData.aiSummary.physical_examination.vitals && Object.values(aiData.aiSummary.physical_examination.vitals).some(v => v && v !== 'N/A') && (
                                  <div style={{ marginBottom: 12, padding: 10, background: "#eff6ff", borderRadius: 8, border: "1px solid #dbeafe" }}>
                                    <p style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", marginBottom: 6 }}>Vitals</p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", fontSize: 13 }}>
                                      {aiData.aiSummary.physical_examination.vitals.blood_pressure && aiData.aiSummary.physical_examination.vitals.blood_pressure !== 'N/A' && <span><span style={{ fontWeight: 600, color: "#64748b" }}>BP:</span> <span style={{ color: "#475569" }}>{str(aiData.aiSummary.physical_examination.vitals.blood_pressure)}</span></span>}
                                      {aiData.aiSummary.physical_examination.vitals.heart_rate && aiData.aiSummary.physical_examination.vitals.heart_rate !== 'N/A' && <span><span style={{ fontWeight: 600, color: "#64748b" }}>HR:</span> <span style={{ color: "#475569" }}>{str(aiData.aiSummary.physical_examination.vitals.heart_rate)}</span></span>}
                                      {aiData.aiSummary.physical_examination.vitals.temperature && aiData.aiSummary.physical_examination.vitals.temperature !== 'N/A' && <span><span style={{ fontWeight: 600, color: "#64748b" }}>Temp:</span> <span style={{ color: "#475569" }}>{str(aiData.aiSummary.physical_examination.vitals.temperature)}</span></span>}
                                      {aiData.aiSummary.physical_examination.vitals.respiratory_rate && aiData.aiSummary.physical_examination.vitals.respiratory_rate !== 'N/A' && <span><span style={{ fontWeight: 600, color: "#64748b" }}>RR:</span> <span style={{ color: "#475569" }}>{str(aiData.aiSummary.physical_examination.vitals.respiratory_rate)}</span></span>}
                                      {aiData.aiSummary.physical_examination.vitals.oxygen_saturation && aiData.aiSummary.physical_examination.vitals.oxygen_saturation !== 'N/A' && <span><span style={{ fontWeight: 600, color: "#64748b" }}>SpO2:</span> <span style={{ color: "#475569" }}>{str(aiData.aiSummary.physical_examination.vitals.oxygen_saturation)}</span></span>}
                                      {aiData.aiSummary.physical_examination.vitals.pain_score && aiData.aiSummary.physical_examination.vitals.pain_score !== 'N/A' && <span><span style={{ fontWeight: 600, color: "#64748b" }}>Pain:</span> <span style={{ color: "#475569" }}>{str(aiData.aiSummary.physical_examination.vitals.pain_score)}</span></span>}
                                    </div>
                                  </div>
                                )}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
                                  {['general', 'heent', 'neck', 'cardiovascular', 'respiratory', 'abdomen', 'extremities', 'neurological', 'psychiatric', 'skin'].map(sys => (
                                    aiData.aiSummary.physical_examination[sys] && aiData.aiSummary.physical_examination[sys] !== 'N/A' ? (
                                      <div key={sys} style={{ fontSize: 13 }}>
                                        <span style={{ fontWeight: 600, color: "#64748b", textTransform: "capitalize" }}>{sys === 'heent' ? 'HEENT' : str(sys)}:</span>{' '}
                                        <span style={{ color: "#475569" }}>{str(aiData.aiSummary.physical_examination[sys])}</span>
                                      </div>
                                    ) : null
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Past Medical History */}
                            {aiData.aiSummary.past_medical_history && (aiData.aiSummary.past_medical_history.conditions?.length > 0 || aiData.aiSummary.past_medical_history.surgeries?.length > 0 || aiData.aiSummary.past_medical_history.hospitalizations?.length > 0) && (
                              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, marginBottom: 16 }}>
                                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>Past Medical History</h4>
                                {aiData.aiSummary.past_medical_history.conditions?.length > 0 && (
                                  <div style={{ marginBottom: 8 }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>Conditions: </span>
                                    <span style={{ fontSize: 13, color: "#475569" }}>{aiData.aiSummary.past_medical_history.conditions.map(str).join(', ')}</span>
                                  </div>
                                )}
                                {aiData.aiSummary.past_medical_history.surgeries?.length > 0 && (
                                  <div style={{ marginBottom: 8 }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>Surgeries: </span>
                                    <span style={{ fontSize: 13, color: "#475569" }}>{aiData.aiSummary.past_medical_history.surgeries.map(str).join(', ')}</span>
                                  </div>
                                )}
                                {aiData.aiSummary.past_medical_history.hospitalizations?.length > 0 && (
                                  <div>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>Hospitalizations: </span>
                                    <span style={{ fontSize: 13, color: "#475569" }}>{aiData.aiSummary.past_medical_history.hospitalizations.map(str).join(', ')}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Family History */}
                            {aiData.aiSummary.family_history?.relevant_conditions?.length > 0 && (
                              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, marginBottom: 16 }}>
                                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>Family History</h4>
                                {aiData.aiSummary.family_history.relevant_conditions.map((cond, i) => (
                                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6, fontSize: 13, color: "#475569" }}>
                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f97316", marginTop: 6, flexShrink: 0 }} />
                                    {str(cond)}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Social History */}
                            {aiData.aiSummary.social_history && Object.values(aiData.aiSummary.social_history).some(v => v && v !== 'N/A') && (
                              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, marginBottom: 16 }}>
                                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>Social History</h4>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
                                  {Object.entries(aiData.aiSummary.social_history).filter(([, v]) => v && v !== 'N/A').map(([key, value]) => (
                                    <div key={key} style={{ fontSize: 13 }}>
                                      <span style={{ fontWeight: 600, color: "#64748b", textTransform: "capitalize" }}>{str(key.replace(/_/g, ' '))}:</span>{' '}
                                      <span style={{ color: "#475569" }}>{str(value)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Assessment & Plan */}
                            {aiData.aiSummary.assessment_and_plan && (
                              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, marginBottom: 16 }}>
                                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                                  <CheckCircle2 style={{ width: 14, height: 14, color: "#10b981" }} /> Assessment & Plan
                                </h4>
                                {aiData.aiSummary.assessment_and_plan.assessment && (
                                  <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, marginBottom: 8 }}>{str(aiData.aiSummary.assessment_and_plan.assessment)}</p>
                                )}
                                {aiData.aiSummary.assessment_and_plan.plan && (
                                  <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, marginBottom: 8 }}><span style={{ fontWeight: 600 }}>Plan:</span> {str(aiData.aiSummary.assessment_and_plan.plan)}</p>
                                )}
                                {aiData.aiSummary.assessment_and_plan.diagnoses?.length > 0 && (
                                  <div style={{ marginTop: 8 }}>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>Diagnoses:</span>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                                      {aiData.aiSummary.assessment_and_plan.diagnoses.map((d, i) => (
                                        <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 12, background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857" }}>{str(d)}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {aiData.aiSummary.assessment_and_plan.follow_up && aiData.aiSummary.assessment_and_plan.follow_up !== 'N/A' && (
                                  <p style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}><span style={{ fontWeight: 600 }}>Follow-up:</span> {str(aiData.aiSummary.assessment_and_plan.follow_up)}</p>
                                )}
                                {aiData.aiSummary.assessment_and_plan.disposition && aiData.aiSummary.assessment_and_plan.disposition !== 'N/A' && (
                                  <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}><span style={{ fontWeight: 600 }}>Disposition:</span> {str(aiData.aiSummary.assessment_and_plan.disposition)}</p>
                                )}
                              </div>
                            )}

                            {/* ICD-10 Diagnosis Codes */}
                            {aiData.diagnosisCodes && (aiData.diagnosisCodes.principal_diagnosis || aiData.diagnosisCodes.primary_diagnosis?.length > 0 || aiData.diagnosisCodes.secondary_diagnoses?.length > 0 || aiData.diagnosisCodes.reason_for_admit?.length > 0) && (
                              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, marginBottom: 16 }}>
                                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                                  <Layers style={{ width: 14, height: 14, color: "#3b82f6" }} /> ICD-10 Diagnosis Codes
                                </h4>
                                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                  {aiData.diagnosisCodes.principal_diagnosis && (
                                    <div>
                                      <p style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", marginBottom: 6 }}>Admit Code</p>
                                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: 10, background: "#f5f3ff", borderRadius: 8, border: "1px solid #e9d5ff" }}>
                                        <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#7c3aed", background: "#fff", padding: "2px 8px", borderRadius: 4, border: "1px solid #ddd6fe", flexShrink: 0 }}>{str(aiData.diagnosisCodes.principal_diagnosis.icd_10_code)}</span>
                                        <span style={{ fontSize: 13, color: "#475569" }}>{str(aiData.diagnosisCodes.principal_diagnosis.description)}</span>
                                      </div>
                                    </div>
                                  )}
                                  {aiData.diagnosisCodes.reason_for_admit?.length > 0 && (
                                    <div>
                                      <p style={{ fontSize: 11, fontWeight: 700, color: "#0891b2", marginBottom: 6 }}>Reason for Admit</p>
                                      {aiData.diagnosisCodes.reason_for_admit.map((dx, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: 10, background: "#ecfeff", borderRadius: 8, border: "1px solid #cffafe", marginBottom: 6 }}>
                                          <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#0891b2", background: "#fff", padding: "2px 8px", borderRadius: 4, border: "1px solid #a5f3fc", flexShrink: 0 }}>{str(dx.icd_10_code)}</span>
                                          <span style={{ fontSize: 13, color: "#475569" }}>{str(dx.description)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {aiData.diagnosisCodes.primary_diagnosis?.length > 0 && (
                                    <div>
                                      <p style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", marginBottom: 6 }}>Primary Diagnosis</p>
                                      {aiData.diagnosisCodes.primary_diagnosis.map((dx, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: 10, background: "#eff6ff", borderRadius: 8, border: "1px solid #dbeafe", marginBottom: 6 }}>
                                          <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#2563eb", background: "#fff", padding: "2px 8px", borderRadius: 4, border: "1px solid #bfdbfe", flexShrink: 0 }}>{str(dx.icd_10_code)}</span>
                                          <span style={{ fontSize: 13, color: "#475569" }}>{str(dx.description)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {aiData.diagnosisCodes.secondary_diagnoses?.length > 0 && (
                                    <div>
                                      <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>Secondary Diagnoses</p>
                                      {aiData.diagnosisCodes.secondary_diagnoses.map((dx, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: 10, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 6 }}>
                                          <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#64748b", background: "#fff", padding: "2px 8px", borderRadius: 4, border: "1px solid #e2e8f0", flexShrink: 0 }}>{str(dx.icd_10_code)}</span>
                                          <span style={{ fontSize: 13, color: "#475569" }}>{str(dx.description)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {aiData.diagnosisCodes.modifiers?.length > 0 && (
                                    <div>
                                      <p style={{ fontSize: 11, fontWeight: 700, color: "#db2777", marginBottom: 6 }}>Modifiers</p>
                                      {aiData.diagnosisCodes.modifiers.map((mod, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: 10, background: "#fdf2f8", borderRadius: 8, border: "1px solid #fbcfe8", marginBottom: 6 }}>
                                          <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#db2777", background: "#fff", padding: "2px 8px", borderRadius: 4, border: "1px solid #f9a8d4", flexShrink: 0 }}>{str(mod.modifier_code)}</span>
                                          <div>
                                            <span style={{ fontSize: 13, color: "#475569" }}>{str(mod.modifier_name)}</span>
                                            {mod.applies_to_code && <p style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Applies to: <span style={{ fontFamily: "monospace" }}>{str(mod.applies_to_code)}</span></p>}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Procedures (CPT Codes) */}
                            {aiData.procedures?.length > 0 && (
                              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, marginBottom: 16 }}>
                                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                                  <ClipboardPaste style={{ width: 14, height: 14, color: "#14b8a6" }} /> Procedures
                                </h4>
                                {aiData.procedures.map((proc, i) => (
                                  <div key={i} style={{ padding: 12, background: "#f0fdfa", borderRadius: 8, border: "1px solid #99f6e4", marginBottom: 8 }}>
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                                      <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: "#0d9488", background: "#fff", padding: "2px 8px", borderRadius: 4, border: "1px solid #99f6e4", flexShrink: 0 }}>{str(proc.cpt_code)}</span>
                                      <div>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{str(proc.procedure_name)}</p>
                                        {proc.description && <p style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{str(proc.description)}</p>}
                                      </div>
                                    </div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", marginTop: 8, fontSize: 11, color: "#64748b" }}>
                                      {proc.date && <span><span style={{ fontWeight: 600 }}>Date:</span> {str(proc.date)}</span>}
                                      {proc.provider && <span><span style={{ fontWeight: 600 }}>Provider:</span> {str(proc.provider)}</span>}
                                      {proc.confidence && <span><span style={{ fontWeight: 600 }}>Confidence:</span> {str(proc.confidence)}</span>}
                                    </div>
                                    {proc.findings?.length > 0 && (
                                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                                        {proc.findings.map((f, j) => (
                                          <span key={j} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 12, background: "#fff", color: "#0d9488", border: "1px solid #99f6e4" }}>{str(f)}</span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Medications */}
                            {(aiData.medications?.length > 0 || aiData.aiSummary.medications?.current?.length > 0) && (
                              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, marginBottom: 16 }}>
                                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>Medications</h4>
                                {aiData.medications?.length > 0 ? (
                                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    {aiData.medications.map((med, i) => (
                                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "2px 6px", borderRadius: 4, background: med.new_or_existing === 'new' ? '#dcfce7' : '#f1f5f9', color: med.new_or_existing === 'new' ? '#15803d' : '#64748b' }}>
                                          {str(med.new_or_existing === 'new' ? 'New' : 'Existing')}
                                        </span>
                                        <span style={{ fontWeight: 600, color: "#1e293b" }}>{str(med.name)}</span>
                                        <span style={{ color: "#64748b" }}>{str(med.dose)}</span>
                                        {med.route && <span style={{ fontSize: 11, color: "#94a3b8" }}>{str(med.route)}</span>}
                                        {med.frequency && <span style={{ fontSize: 11, color: "#94a3b8" }}>({str(med.frequency)})</span>}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                    {aiData.aiSummary.medications.current.map((med, i) => (
                                      <span key={i} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, background: "#eef2ff", border: "1px solid #c7d2fe", color: "#4338ca" }}>{str(med)}</span>
                                    ))}
                                  </div>
                                )}
                                {aiData.aiSummary.medications?.allergies?.length > 0 && (
                                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f1f5f9", display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: "#dc2626" }}>Allergies:</span>
                                    {aiData.aiSummary.medications.allergies.map((a, i) => (
                                      <span key={i} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}>{str(a)}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Timeline of Care */}
                            {aiData.aiSummary.timeline_of_care?.length > 0 && (
                              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, marginBottom: 16 }}>
                                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                                  <Clock style={{ width: 14, height: 14, color: "#f59e0b" }} /> Timeline of Care
                                </h4>
                                {aiData.aiSummary.timeline_of_care.map((event, i) => (
                                  <div key={i} style={{ display: "flex", gap: 12, position: "relative" }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b", marginTop: 6, flexShrink: 0 }} />
                                      {i < aiData.aiSummary.timeline_of_care.length - 1 && <div style={{ width: 2, flex: 1, background: "#fde68a", marginTop: 4 }} />}
                                    </div>
                                    <div style={{ paddingBottom: 12 }}>
                                      <p style={{ fontSize: 11, fontWeight: 700, color: "#b45309" }}>{str(event.time)}</p>
                                      <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{str(event.event)}</p>
                                      {event.description && <p style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{str(event.description)}</p>}
                                      {event.provider && <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{str(event.provider)}</p>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Clinical Alerts */}
                            {aiData.aiSummary.clinical_alerts?.length > 0 && (
                              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #fef3c7", padding: 20, marginBottom: 16 }}>
                                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#92400e", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                                  <AlertCircle style={{ width: 14, height: 14, color: "#d97706" }} /> Clinical Alerts
                                </h4>
                                {aiData.aiSummary.clinical_alerts.map((alert, i) => (
                                  <div key={i} style={{ padding: "8px 10px", background: "#fffbeb", borderRadius: 8, marginBottom: 6, border: "1px solid #fef3c7" }}>
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                                      {alert.severity && (
                                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", padding: "2px 6px", borderRadius: 4, flexShrink: 0, background: alert.severity === 'high' ? '#fef2f2' : alert.severity === 'medium' ? '#fffbeb' : '#f8fafc', color: alert.severity === 'high' ? '#dc2626' : alert.severity === 'medium' ? '#d97706' : '#64748b' }}>{str(alert.severity)}</span>
                                      )}
                                      <p style={{ fontSize: 13, color: "#92400e", fontWeight: 600 }}>{str(alert.alert)}</p>
                                    </div>
                                    {alert.action_required && (
                                      <p style={{ fontSize: 11, color: "#b45309", marginTop: 4 }}><span style={{ fontWeight: 600 }}>Action:</span> {str(alert.action_required)}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Diagnostic Results */}
                            {aiData.aiSummary.diagnostic_results && (aiData.aiSummary.diagnostic_results.labs?.length > 0 || aiData.aiSummary.diagnostic_results.imaging?.length > 0 || aiData.aiSummary.diagnostic_results.other_tests?.length > 0 || (aiData.aiSummary.diagnostic_results.ekg && aiData.aiSummary.diagnostic_results.ekg !== 'N/A')) && (
                              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, marginBottom: 16 }}>
                                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>Diagnostic Results</h4>
                                {aiData.aiSummary.diagnostic_results.ekg && aiData.aiSummary.diagnostic_results.ekg !== 'N/A' && (
                                  <p style={{ fontSize: 13, color: "#475569", marginBottom: 8 }}><span style={{ fontWeight: 600, color: "#64748b" }}>EKG:</span> {str(aiData.aiSummary.diagnostic_results.ekg)}</p>
                                )}
                                {aiData.aiSummary.diagnostic_results.labs?.length > 0 && (
                                  <div style={{ marginBottom: 8 }}>
                                    <p style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Labs</p>
                                    {aiData.aiSummary.diagnostic_results.labs.map((lab, i) => (
                                      <p key={i} style={{ fontSize: 13, color: "#475569", marginBottom: 2 }}>{str(typeof lab === 'string' ? lab : lab?.test ? `${lab.test}: ${lab.result || ''}` : JSON.stringify(lab))}</p>
                                    ))}
                                  </div>
                                )}
                                {aiData.aiSummary.diagnostic_results.imaging?.length > 0 && (
                                  <div style={{ marginBottom: 8 }}>
                                    <p style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Imaging</p>
                                    {aiData.aiSummary.diagnostic_results.imaging.map((img, i) => (
                                      <p key={i} style={{ fontSize: 13, color: "#475569", marginBottom: 2 }}>{str(typeof img === 'string' ? img : img?.test ? `${img.test}: ${img.result || ''}` : JSON.stringify(img))}</p>
                                    ))}
                                  </div>
                                )}
                                {aiData.aiSummary.diagnostic_results.other_tests?.length > 0 && (
                                  <div>
                                    <p style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Other Tests</p>
                                    {aiData.aiSummary.diagnostic_results.other_tests.map((test, i) => (
                                      <p key={i} style={{ fontSize: 13, color: "#475569", marginBottom: 2 }}>{str(typeof test === 'string' ? test : test?.test ? `${test.test}: ${test.result || ''}` : JSON.stringify(test))}</p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8" }}>
                            <Sparkles style={{ width: 40, height: 40, marginBottom: 12, opacity: 0.4 }} />
                            <p style={{ fontSize: 14, fontWeight: 500 }}>No AI summary available</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Right Panel (40%) ── */}
                <div style={{ width: "40%", display: "flex", flexDirection: "column", background: "#fff" }}>
                  {/* Header */}
                  <div style={{ padding: "14px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: 0 }}>ICD & CPT Codes</h3>
                      <p style={{ fontSize: 11, color: "#94a3b8", margin: "4px 0 0" }}>
                        {allCodes.length} codes &middot; {Object.keys(codeDecisions).length} reviewed
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => { setAddingCode(true); setAddingRule(false); }}
                        style={{
                          padding: "6px 12px", borderRadius: 8, border: "none",
                          background: "#f5f3ff", color: "#7c3aed",
                          fontSize: 12, fontWeight: 600, cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 5,
                          transition: "all 0.15s",
                        }}
                      >
                        <Plus style={{ width: 14, height: 14 }} /> Add Code
                      </button>
                      <button
                        onClick={() => { setAddingRule(true); setAddingCode(false); }}
                        style={{
                          padding: "6px 12px", borderRadius: 8, border: "none",
                          background: "#fef3c7", color: "#92400e",
                          fontSize: 12, fontWeight: 600, cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 5,
                          transition: "all 0.15s",
                        }}
                      >
                        <Plus style={{ width: 14, height: 14 }} /> Add Rule
                      </button>
                    </div>
                  </div>

                  {/* Code Badges Grid */}
                  <div style={{ padding: "10px 20px", overflowY: "auto", flex: 1 }}>
                    {/* Add Code Form */}
                    {addingCode && (
                      <div style={{ background: "#fdf4ff", borderRadius: 14, border: "1.5px solid #e879f9", padding: 18, marginBottom: 16, boxShadow: "0 4px 20px rgba(168, 85, 247, 0.08)" }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: "#86198f", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 24, height: 24, borderRadius: 7, background: "#f0abfc", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Plus style={{ width: 13, height: 13, color: "#fff" }} />
                          </div>
                          Add New Code
                        </h4>
                        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 10, fontWeight: 700, color: "#a855f7", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>Code Type</label>
                            <StyledDropdown
                              value={newCodeForm.type}
                              onChange={(val) => setNewCodeForm(prev => ({ ...prev, type: val }))}
                              options={[
                                { value: 'icd', label: 'ICD-10', dot: '#3b82f6' },
                                { value: 'cpt', label: 'CPT', dot: '#10b981' },
                              ]}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 10, fontWeight: 700, color: "#a855f7", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>Category</label>
                            <StyledDropdown
                              value={newCodeForm.category}
                              onChange={(val) => setNewCodeForm(prev => ({ ...prev, category: val }))}
                              options={[
                                { value: 'Admit Code', label: 'Admit Code', dot: '#7c3aed' },
                                { value: 'Primary', label: 'Primary', dot: '#d97706' },
                                { value: 'Secondary', label: 'Secondary', dot: '#64748b' },
                                { value: 'Reason for Admit', label: 'Reason for Admit', dot: '#0891b2' },
                                { value: 'E/M Level', label: 'E/M Level', dot: '#2563eb' },
                                { value: 'Procedure', label: 'Procedure', dot: '#059669' },
                              ]}
                            />
                          </div>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <label style={{ fontSize: 10, fontWeight: 700, color: "#a855f7", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                            Code <span style={{ color: "#e879f9" }}>*</span>
                          </label>
                          <input
                            type="text"
                            placeholder={newCodeForm.type === 'icd' ? "e.g. K63.5, Z12.11" : "e.g. 45385, 99213"}
                            value={newCodeForm.code}
                            onChange={(e) => setNewCodeForm(prev => ({ ...prev, code: e.target.value }))}
                            style={{
                              width: "100%", padding: "9px 12px", borderRadius: 10,
                              border: "1.5px solid #e9d5ff", background: "#fff",
                              fontSize: 13, fontWeight: 600, color: "#1e293b",
                              outline: "none", boxSizing: "border-box",
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#c084fc'}
                            onBlur={(e) => e.target.style.borderColor = '#e9d5ff'}
                          />
                        </div>
                        <div style={{ marginBottom: 14 }}>
                          <label style={{ fontSize: 10, fontWeight: 700, color: "#a855f7", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>Description</label>
                          <input
                            type="text"
                            placeholder="Enter code description..."
                            value={newCodeForm.description}
                            onChange={(e) => setNewCodeForm(prev => ({ ...prev, description: e.target.value }))}
                            style={{
                              width: "100%", padding: "9px 12px", borderRadius: 10,
                              border: "1.5px solid #e9d5ff", background: "#fff",
                              fontSize: 13, color: "#475569",
                              outline: "none", boxSizing: "border-box",
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#c084fc'}
                            onBlur={(e) => e.target.style.borderColor = '#e9d5ff'}
                          />
                        </div>
                        <div style={{ marginBottom: 14 }}>
                          <label style={{ fontSize: 10, fontWeight: 700, color: "#a855f7", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                            Reason for Adding <span style={{ color: "#e879f7" }}>*</span>
                          </label>
                          {(() => {
                            const opts = reasonOptionsFor(newCodeForm.category, 'add');
                            return (
                              <div style={{ marginBottom: 8 }}>
                                <StyledDropdown
                                  value={newCodeForm.reasonOptionId || ''}
                                  onChange={(val) => {
                                    const id = val === '' ? null : Number(val);
                                    const match = opts.find(o => o.id === id);
                                    setNewCodeForm(prev => ({ ...prev, reasonOptionId: id, reasonOptionLabel: match?.label || '' }));
                                  }}
                                  options={opts.map(o => ({ value: o.id, label: o.label }))}
                                  placeholder={opts.length ? 'Select a reason…' : 'No preset reasons — team lead can add in Settings'}
                                />
                              </div>
                            );
                          })()}
                          <textarea
                            placeholder="Explain why this code should be added (min 20 characters)"
                            value={newCodeForm.reason}
                            onChange={(e) => setNewCodeForm(prev => ({ ...prev, reason: e.target.value }))}
                            rows={2}
                            style={{
                              width: "100%", padding: "9px 12px", borderRadius: 10,
                              border: `1.5px solid ${(newCodeForm.reason || '').length >= 20 ? '#e9d5ff' : '#fca5a5'}`,
                              background: "#fff", fontSize: 13, color: "#475569",
                              resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#c084fc'}
                            onBlur={(e) => e.target.style.borderColor = (newCodeForm.reason || '').length >= 20 ? '#e9d5ff' : '#fca5a5'}
                          />
                          <span style={{ fontSize: 10, color: (newCodeForm.reason || '').length >= 20 ? '#64748b' : '#ef4444' }}>
                            {(newCodeForm.reason || '').length}/20 characters minimum
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={handleAddCode}
                            disabled={!newCodeForm.code.trim() || (newCodeForm.reason || '').length < 20}
                            style={{
                              flex: 1, padding: "9px 14px", borderRadius: 10, border: "none",
                              background: (newCodeForm.code.trim() && (newCodeForm.reason || '').length >= 20) ? "linear-gradient(135deg, #a855f7, #7c3aed)" : "#e9d5ff",
                              color: "#fff", fontSize: 12, fontWeight: 700,
                              cursor: (newCodeForm.code.trim() && (newCodeForm.reason || '').length >= 20) ? "pointer" : "not-allowed",
                              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                              boxShadow: (newCodeForm.code.trim() && (newCodeForm.reason || '').length >= 20) ? "0 2px 8px rgba(168, 85, 247, 0.3)" : "none",
                            }}
                          >
                            <Plus style={{ width: 14, height: 14 }} /> Add Code
                          </button>
                          <button
                            onClick={() => { setAddingCode(false); setNewCodeForm({ code: '', description: '', type: 'icd', category: 'Secondary' }); }}
                            style={{
                              padding: "9px 16px", borderRadius: 10,
                              border: "1.5px solid #e9d5ff", background: "#fff", color: "#86198f",
                              fontSize: 12, fontWeight: 600, cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Add Rule Form */}
                    {addingRule && (
                      <div style={{ background: "#fffbeb", borderRadius: 14, border: "1.5px solid #f59e0b", padding: 18, marginBottom: 16, boxShadow: "0 4px 20px rgba(245, 158, 11, 0.08)" }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: "#92400e", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 24, height: 24, borderRadius: 7, background: "#fcd34d", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Plus style={{ width: 14, height: 14, color: "#92400e" }} />
                          </div>
                          Add Coder Rule
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: "#92400e", display: "block", marginBottom: 4 }}>Rule Text</label>
                            <textarea
                              value={newRuleForm.rule_text}
                              onChange={(e) => setNewRuleForm(prev => ({ ...prev, rule_text: e.target.value }))}
                              placeholder="e.g. Always code sepsis (A41.9) as principal diagnosis when documented as reason for admission"
                              rows={3}
                              style={{
                                width: "100%", padding: "8px 10px", borderRadius: 8,
                                border: `1.5px solid ${newRuleForm.rule_text.length >= 10 ? '#f59e0b' : '#fca5a5'}`,
                                background: "#fff", fontSize: 12, color: "#475569", resize: "vertical",
                                outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                              }}
                            />
                            <span style={{ fontSize: 10, color: newRuleForm.rule_text.length >= 10 ? '#92400e' : '#ef4444' }}>
                              {newRuleForm.rule_text.length}/10 characters minimum
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: 10 }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: 11, fontWeight: 600, color: "#92400e", display: "block", marginBottom: 4 }}>Applies To</label>
                              <select
                                value={newRuleForm.applies_to}
                                onChange={(e) => setNewRuleForm(prev => ({ ...prev, applies_to: e.target.value }))}
                                style={{
                                  width: "100%", padding: "8px 10px", borderRadius: 8,
                                  border: "1.5px solid #f59e0b", background: "#fff",
                                  fontSize: 12, color: "#475569", outline: "none", boxSizing: "border-box",
                                }}
                              >
                                <option value="ALL">ALL</option>
                                <option value="ICD-CM">ICD-CM</option>
                                <option value="ICD-PCS">ICD-PCS</option>
                                <option value="CPT">CPT</option>
                              </select>
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: 11, fontWeight: 600, color: "#92400e", display: "block", marginBottom: 4 }}>Priority</label>
                              <select
                                value={newRuleForm.priority}
                                onChange={(e) => setNewRuleForm(prev => ({ ...prev, priority: e.target.value }))}
                                style={{
                                  width: "100%", padding: "8px 10px", borderRadius: 8,
                                  border: "1.5px solid #f59e0b", background: "#fff",
                                  fontSize: 12, color: "#475569", outline: "none", boxSizing: "border-box",
                                }}
                              >
                                <option value="NORMAL">NORMAL — similarity matched</option>
                                <option value="HIGH">HIGH — always injected</option>
                              </select>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                            <button
                              disabled={newRuleForm.rule_text.length < 10 || ruleSubmitting}
                              onClick={async () => {
                                setRuleSubmitting(true);
                                try {
                                  const response = await axios.post(`${MEDX_API_URL}/review/rules`, {
                                    rule_text: newRuleForm.rule_text,
                                    applies_to: newRuleForm.applies_to,
                                    priority: newRuleForm.priority,
                                  }, {
                                    headers: { ...(localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {}) },
                                  });
                                  if (response.data.success) {
                                    const rule = response.data.rule;
                                    setConfirmPopup({
                                      type: rule.qdrant_synced ? 'success' : 'warning',
                                      title: 'Rule Created',
                                      message: rule.qdrant_synced
                                        ? 'Coder rule has been created and synced to the AI pipeline. It will be applied to future coding predictions.'
                                        : 'Rule was created but NOT synced to Qdrant. It may not be picked up by the pipeline until sync completes.'
                                    });
                                    setNewRuleForm({ rule_text: '', applies_to: 'ALL', priority: 'NORMAL' });
                                    setAddingRule(false);
                                  } else {
                                    setConfirmPopup({ type: 'error', title: 'Rule Creation Failed', message: response.data.error || 'Unknown error' });
                                  }
                                } catch (err) {
                                  setConfirmPopup({ type: 'error', title: 'Rule Creation Failed', message: err.response?.data?.error || err.message });
                                } finally {
                                  setRuleSubmitting(false);
                                }
                              }}
                              style={{
                                flex: 1, padding: "9px 14px", borderRadius: 8, border: "none",
                                background: newRuleForm.rule_text.length >= 10 && !ruleSubmitting ? "linear-gradient(135deg, #f59e0b, #d97706)" : "#e5e7eb",
                                color: newRuleForm.rule_text.length >= 10 && !ruleSubmitting ? "#fff" : "#9ca3af",
                                fontSize: 12, fontWeight: 700, cursor: newRuleForm.rule_text.length >= 10 && !ruleSubmitting ? "pointer" : "not-allowed",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                boxShadow: newRuleForm.rule_text.length >= 10 && !ruleSubmitting ? "0 2px 8px rgba(245, 158, 11, 0.3)" : "none",
                              }}
                            >
                              {ruleSubmitting ? 'Submitting...' : 'Submit Rule'}
                            </button>
                            <button
                              onClick={() => { setAddingRule(false); setNewRuleForm({ rule_text: '', applies_to: 'ALL', priority: 'NORMAL' }); }}
                              style={{
                                padding: "9px 14px", borderRadius: 8, border: "1px solid #e2e8f0",
                                background: "#fff", color: "#64748b",
                                fontSize: 12, fontWeight: 600, cursor: "pointer",
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {allCodes.length === 0 && !addingCode ? (
                      <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
                        <p style={{ fontSize: 13 }}>No ICD codes available</p>
                      </div>
                    ) : allCodes.length > 0 ? (
                      <>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px", marginBottom: 10 }}>
                          {(() => {
                            const categoryOrder = ['Admit Code', 'Reason for Admit', 'Primary', 'Secondary', 'E/M Level', 'Procedure'];
                            const categoryColors = {
                              'Admit Code': { label: '#7c3aed', dot: '#8b5cf6' },
                              'Reason for Admit': { label: '#0891b2', dot: '#06b6d4' },
                              'Primary': { label: '#2563eb', dot: '#3b82f6' },
                              'Secondary': { label: '#64748b', dot: '#94a3b8' },
                              'E/M Level': { label: '#d97706', dot: '#f59e0b' },
                              'Procedure': { label: '#0d9488', dot: '#14b8a6' },
                            };
                            const grouped = {};
                            allCodes.forEach(code => {
                              const cat = code._isCustom ? 'Added by User' : (code._category || 'Other');
                              if (!grouped[cat]) grouped[cat] = [];
                              grouped[cat].push(code);
                            });
                            const sortedCategories = [
                              ...categoryOrder.filter(c => grouped[c]),
                              ...Object.keys(grouped).filter(c => !categoryOrder.includes(c)),
                            ];
                            return sortedCategories.map(category => {
                              const isWide = category === 'Secondary' || (grouped[category]?.length > 3);
                              return (
                                <div key={category} style={isWide ? { gridColumn: "1 / -1" } : {}}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                                    <span style={{
                                      width: 6, height: 6, borderRadius: "50%",
                                      background: categoryColors[category]?.dot || '#d946ef',
                                    }} />
                                    <span style={{
                                      fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5,
                                      color: categoryColors[category]?.label || '#86198f',
                                    }}>
                                      {category} ({grouped[category].length})
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, paddingLeft: 11 }}>
                                    {grouped[category].map((code) => {
                                      const style = getBadgeStyle(code);
                                      const decision = codeDecisions[code._key];
                                      const displayCode = decision?.editedCode || code._code;
                                      return (
                                        <button
                                          key={code._key}
                                          onClick={() => { setSelectedCode(code); setEditingCode(null); }}
                                          style={{
                                            display: "inline-flex", alignItems: "center", gap: 4,
                                            padding: "3px 8px", borderRadius: 6,
                                            border: code._isCustom ? `2px dashed #d946ef` : `1.5px solid ${style.border}`,
                                            background: style.bg, color: style.color,
                                            fontSize: 11, fontWeight: 600, cursor: "pointer",
                                            transition: "all 0.15s",
                                            outline: selectedCode?._key === code._key ? `2px solid #f59e0b` : "none",
                                            outlineOffset: 1,
                                            boxShadow: code._isCustom ? "0 0 0 1px rgba(217, 70, 239, 0.15)" : "none",
                                          }}
                                        >
                                          {code._isCustom && <Plus style={{ width: 10, height: 10 }} />}
                                          {getStatusIcon(code)}
                                          {displayCode}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>

                        {/* Legend */}
                        <div style={{ display: "flex", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                          {[
                            { label: "Accepted", bg: "#dcfce7", border: "#86efac" },
                            { label: "Rejected", bg: "#fef2f2", border: "#fca5a5" },
                            { label: "Edited", bg: "#dbeafe", border: "#93c5fd" },
                            { label: "Added", bg: "#fdf4ff", border: "#e879f9" },
                            { label: "Pending", bg: "#f8fafc", border: "#e2e8f0" },
                          ].map(item => (
                            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#94a3b8" }}>
                              <span style={{ width: 10, height: 10, borderRadius: 3, background: item.bg, border: `1px solid ${item.border}` }} />
                              {item.label}
                            </div>
                          ))}
                        </div>

                        {/* Selected Code Detail */}
                        {selectedCode && (
                          <div style={{
                            background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0",
                            padding: 12, marginTop: 2,
                          }}>
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                                <span style={{
                                  display: "inline-flex", alignItems: "center", gap: 6,
                                  fontSize: 10, fontWeight: 700, color: selectedCode._isCustom ? "#86198f" : "#f59e0b",
                                  textTransform: "uppercase", letterSpacing: 0.5,
                                }}>
                                  {selectedCode._category}
                                  {selectedCode._isCustom && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4, background: "#fdf4ff", border: "1px solid #e879f9" }}>Added</span>}
                                </span>
                                {selectedCode._isCustom && (
                                  <button
                                    onClick={() => handleDeleteCustomCode(selectedCode._key)}
                                    style={{
                                      padding: "3px 8px", borderRadius: 6, border: "none",
                                      background: "#fef2f2", color: "#dc2626",
                                      fontSize: 10, fontWeight: 600, cursor: "pointer",
                                      display: "flex", alignItems: "center", gap: 4,
                                    }}
                                  >
                                    <Trash2 style={{ width: 10, height: 10 }} /> Remove
                                  </button>
                                )}
                              </div>
                              <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>
                                {codeDecisions[selectedCode._key]?.editedCode || selectedCode._code}
                              </div>
                              <div style={{ fontSize: 13, color: "#475569", marginTop: 4, lineHeight: 1.5 }}>
                                {codeDecisions[selectedCode._key]?.editedDesc || selectedCode._desc || 'No description'}
                              </div>
                              {/* Procedure name (for CPT codes) */}
                              {selectedCode.procedure_name && (
                                <div style={{ fontSize: 12, color: "#0d9488", marginTop: 4 }}>
                                  {str(selectedCode.procedure_name)}
                                </div>
                              )}
                              {/* Procedure findings */}
                              {selectedCode.findings?.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                                  {selectedCode.findings.map((f, i) => (
                                    <span key={i} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: "#f0fdfa", border: "1px solid #99f6e4", color: "#0f766e" }}>
                                      {str(f)}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {/* Evidence */}
                              {selectedCode.evidence && (
                                <div style={{ marginTop: 8 }}>
                                  {(Array.isArray(selectedCode.evidence) ? selectedCode.evidence : [selectedCode.evidence]).map((ev, i) => (
                                    <div key={i} style={{ fontSize: 12, color: "#64748b", padding: "8px 10px", background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 6 }}>
                                      <span style={{ fontWeight: 600, color: "#94a3b8", fontSize: 10, textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                                        Evidence {Array.isArray(selectedCode.evidence) && selectedCode.evidence.length > 1 ? `#${i + 1}` : ''}
                                        {ev.document_name ? ` — ${ev.document_name}` : ''}
                                      </span>
                                      <span style={{ fontStyle: "italic", lineHeight: 1.5 }}>"{str(ev.exact_text || ev)}"</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {/* AI Reasoning */}
                              {selectedCode.ai_reasoning && (
                                <div style={{ fontSize: 12, color: "#64748b", marginTop: 6, padding: "8px 10px", background: "#fffbeb", borderRadius: 8, border: "1px solid #fef3c7" }}>
                                  <span style={{ fontWeight: 600, color: "#b45309", fontSize: 10, textTransform: "uppercase", display: "block", marginBottom: 4 }}>AI Reasoning</span>
                                  {str(selectedCode.ai_reasoning)}
                                </div>
                              )}
                              {/* Confidence */}
                              {selectedCode.confidence && (
                                <div style={{ marginTop: 8 }}>
                                  <span style={{
                                    display: "inline-block", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                                    background: selectedCode.confidence === 'high' ? '#dcfce7' : selectedCode.confidence === 'medium' ? '#fef3c7' : '#fef2f2',
                                    color: selectedCode.confidence === 'high' ? '#166534' : selectedCode.confidence === 'medium' ? '#92400e' : '#991b1b',
                                    textTransform: "uppercase", letterSpacing: 0.5,
                                  }}>
                                    {selectedCode.confidence} confidence
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            {selectedCode._isCustom ? (
                              <div style={{
                                display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
                                background: "#fdf4ff", borderRadius: 8, border: "1.5px dashed #d946ef",
                              }}>
                                <Plus style={{ width: 14, height: 14, color: "#a21caf" }} />
                                <span style={{ fontSize: 12, fontWeight: 600, color: "#86198f" }}>Manually added code</span>
                              </div>
                            ) : rejectingCode?._key === selectedCode._key ? (
                              /* Reject Reason Form */
                              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                <div style={{ padding: "10px 12px", background: "#fef2f2", borderRadius: 8, border: "1px solid #fecaca" }}>
                                  <p style={{ fontSize: 12, fontWeight: 600, color: "#991b1b", margin: "0 0 8px" }}>Why should this code be removed?</p>
                                  {(() => {
                                    const opts = reasonOptionsFor(selectedCode._category, 'reject');
                                    return (
                                      <ReasonDropdown
                                        theme="reject"
                                        value={rejectingCode.reasonOptionId || null}
                                        options={opts}
                                        placeholder="Select a reason…"
                                        emptyPlaceholder="No preset reasons — team lead can add in Settings"
                                        onChange={(id, label) => {
                                          setRejectingCode(prev => ({ ...prev, reasonOptionId: id, reasonOptionLabel: label }));
                                        }}
                                      />
                                    );
                                  })()}
                                  <textarea
                                    value={rejectingCode.reason}
                                    onChange={(e) => setRejectingCode(prev => ({ ...prev, reason: e.target.value }))}
                                    placeholder="Explain why this code is incorrect or unnecessary (min 20 characters)"
                                    rows={3}
                                    style={{
                                      width: "100%", padding: "8px 10px", borderRadius: 8,
                                      border: `1.5px solid ${rejectingCode.reason.length >= 20 ? '#fca5a5' : '#fecaca'}`,
                                      background: "#fff", fontSize: 12, color: "#475569", resize: "vertical",
                                      outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                                    }}
                                  />
                                  <span style={{ fontSize: 10, color: rejectingCode.reason.length >= 20 ? '#64748b' : '#ef4444', display: "block", marginTop: 4 }}>
                                    {rejectingCode.reason.length}/20 characters minimum
                                  </span>
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                  <button
                                    onClick={handleConfirmReject}
                                    disabled={rejectingCode.reason.length < 20}
                                    style={{
                                      flex: 1, padding: "8px 12px", borderRadius: 8, border: "none",
                                      background: rejectingCode.reason.length >= 20 ? "#dc2626" : "#e2e8f0",
                                      color: rejectingCode.reason.length >= 20 ? "#fff" : "#94a3b8",
                                      fontSize: 12, fontWeight: 600,
                                      cursor: rejectingCode.reason.length >= 20 ? "pointer" : "not-allowed",
                                      display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                                    }}
                                  >
                                    <X style={{ width: 14, height: 14 }} /> Confirm Reject
                                  </button>
                                  <button
                                    onClick={() => setRejectingCode(null)}
                                    style={{
                                      flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0",
                                      background: "#fff", color: "#64748b",
                                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                                      display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : editingCode?._key === selectedCode._key ? (
                              /* Inline Edit Form */
                              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                <div>
                                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Code</label>
                                  <input
                                    type="text"
                                    value={editingCode.editedCode}
                                    onChange={(e) => setEditingCode(prev => ({ ...prev, editedCode: e.target.value }))}
                                    style={{
                                      width: "100%", padding: "8px 10px", borderRadius: 8,
                                      border: "1.5px solid #93c5fd", background: "#fff",
                                      fontSize: 13, fontWeight: 600, color: "#1e293b",
                                      outline: "none", boxSizing: "border-box",
                                    }}
                                  />
                                </div>
                                <div>
                                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Description</label>
                                  <textarea
                                    value={editingCode.editedDesc}
                                    onChange={(e) => setEditingCode(prev => ({ ...prev, editedDesc: e.target.value }))}
                                    rows={2}
                                    style={{
                                      width: "100%", padding: "8px 10px", borderRadius: 8,
                                      border: "1.5px solid #93c5fd", background: "#fff",
                                      fontSize: 13, color: "#475569", resize: "vertical",
                                      outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                                    }}
                                  />
                                </div>
                                <div>
                                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>Reason for Edit</label>
                                  {(() => {
                                    const opts = reasonOptionsFor(selectedCode._category, 'edit');
                                    return (
                                      <ReasonDropdown
                                        theme="edit"
                                        value={editingCode.reasonOptionId || null}
                                        options={opts}
                                        placeholder="Select a reason…"
                                        emptyPlaceholder="No preset reasons — team lead can add in Settings"
                                        onChange={(id, label) => {
                                          setEditingCode(prev => ({ ...prev, reasonOptionId: id, reasonOptionLabel: label }));
                                        }}
                                      />
                                    );
                                  })()}
                                  <textarea
                                    value={editingCode.reason || ''}
                                    onChange={(e) => setEditingCode(prev => ({ ...prev, reason: e.target.value }))}
                                    placeholder="Explain why this code needs to be changed (min 20 characters)"
                                    rows={2}
                                    style={{
                                      width: "100%", padding: "8px 10px", borderRadius: 8,
                                      border: `1.5px solid ${(editingCode.reason || '').length >= 20 ? '#93c5fd' : '#fca5a5'}`,
                                      background: "#fff", fontSize: 12, color: "#475569", resize: "vertical",
                                      outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                                    }}
                                  />
                                  <span style={{ fontSize: 10, color: (editingCode.reason || '').length >= 20 ? '#64748b' : '#ef4444' }}>
                                    {(editingCode.reason || '').length}/20 characters minimum
                                  </span>
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                  <button
                                    onClick={handleSaveEdit}
                                    disabled={(editingCode.reason || '').length < 20}
                                    style={{
                                      flex: 1, padding: "8px 12px", borderRadius: 8, border: "none",
                                      background: (editingCode.reason || '').length >= 20 ? "#2563eb" : "#e2e8f0",
                                      color: (editingCode.reason || '').length >= 20 ? "#fff" : "#94a3b8",
                                      fontSize: 12, fontWeight: 600,
                                      cursor: (editingCode.reason || '').length >= 20 ? "pointer" : "not-allowed",
                                      display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                                    }}
                                  >
                                    <Save style={{ width: 14, height: 14 }} /> Save
                                  </button>
                                  <button
                                    onClick={() => setEditingCode(null)}
                                    style={{
                                      flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0",
                                      background: "#fff", color: "#64748b",
                                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                                      display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: "flex", gap: 8 }}>
                                <button
                                  onClick={() => handleAccept(selectedCode)}
                                  style={{
                                    flex: 1, padding: "8px 12px", borderRadius: 8, border: "none",
                                    background: codeDecisions[selectedCode._key]?.status === 'accepted' ? "#16a34a" : "#dcfce7",
                                    color: codeDecisions[selectedCode._key]?.status === 'accepted' ? "#fff" : "#166534",
                                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                                    transition: "all 0.15s",
                                  }}
                                >
                                  <Check style={{ width: 14, height: 14 }} /> Accept
                                </button>
                                <button
                                  onClick={() => handleStartReject(selectedCode)}
                                  style={{
                                    flex: 1, padding: "8px 12px", borderRadius: 8, border: "none",
                                    background: codeDecisions[selectedCode._key]?.status === 'rejected' ? "#dc2626" : "#fef2f2",
                                    color: codeDecisions[selectedCode._key]?.status === 'rejected' ? "#fff" : "#991b1b",
                                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                                    transition: "all 0.15s",
                                  }}
                                >
                                  <X style={{ width: 14, height: 14 }} /> Reject
                                </button>
                                <button
                                  onClick={() => handleStartEdit(selectedCode)}
                                  style={{
                                    flex: 1, padding: "8px 12px", borderRadius: 8, border: "none",
                                    background: codeDecisions[selectedCode._key]?.status === 'edited' ? "#2563eb" : "#dbeafe",
                                    color: codeDecisions[selectedCode._key]?.status === 'edited' ? "#fff" : "#1e40af",
                                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                                    transition: "all 0.15s",
                                  }}
                                >
                                  <Pencil style={{ width: 14, height: 14 }} /> Edit
                                </button>
                              </div>
                            )}

                            {/* Prev / Next Navigation */}
                            <div style={{
                              display: "flex", justifyContent: "space-between", alignItems: "center",
                              marginTop: 10, paddingTop: 8, borderTop: "1px solid #e2e8f0",
                            }}>
                              <button
                                onClick={goToPrev}
                                disabled={currentIdx <= 0}
                                style={{
                                  padding: "6px 14px", borderRadius: 8, border: "1px solid #e2e8f0",
                                  background: currentIdx <= 0 ? "#f8fafc" : "#fff",
                                  color: currentIdx <= 0 ? "#cbd5e1" : "#475569",
                                  fontSize: 12, fontWeight: 600, cursor: currentIdx <= 0 ? "not-allowed" : "pointer",
                                  display: "flex", alignItems: "center", gap: 5,
                                }}
                              >
                                <ChevronLeft style={{ width: 14, height: 14 }} /> Previous
                              </button>
                              <span style={{ fontSize: 11, color: "#94a3b8" }}>
                                {currentIdx + 1} / {allCodes.length}
                              </span>
                              <button
                                onClick={goToNext}
                                disabled={currentIdx >= allCodes.length - 1}
                                style={{
                                  padding: "6px 14px", borderRadius: 8, border: "1px solid #e2e8f0",
                                  background: currentIdx >= allCodes.length - 1 ? "#f8fafc" : "#fff",
                                  color: currentIdx >= allCodes.length - 1 ? "#cbd5e1" : "#475569",
                                  fontSize: 12, fontWeight: 600, cursor: currentIdx >= allCodes.length - 1 ? "not-allowed" : "pointer",
                                  display: "flex", alignItems: "center", gap: 5,
                                }}
                              >
                                Next <ChevronRight style={{ width: 14, height: 14 }} />
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {/* ── Review & Submit Popup ── */}
      {submitPopupOpen && (() => {
        const str = (val) => { if (val == null) return ''; if (typeof val === 'string') return val; return String(val); };
        const getCode = (item) => str(item?.icd_10_code || item?.code || item?.cpt_code || item?._code || '');
        const getDesc = (item) => str(item?.description || item?.finding || item?._desc || '');

        // Build final codes list (accepted + edited + custom, exclude rejected)
        const finalCodes = [];
        const dc = aiData?.diagnosisCodes;

        const addIfNotRejected = (item, category, key, type) => {
          const decision = codeDecisions[key];
          if (decision?.status === 'rejected') return;
          finalCodes.push({
            code: decision?.editedCode || getCode(item),
            description: decision?.editedDesc || getDesc(item),
            category,
            type,
            status: decision?.status || 'pending',
            isCustom: false,
          });
        };

        if (dc?.principal_diagnosis) addIfNotRejected(dc.principal_diagnosis, 'Admit Code', 'principal-0', 'icd');
        dc?.primary_diagnosis?.forEach((dx, i) => addIfNotRejected(dx, 'Primary', `primary-${i}`, 'icd'));
        dc?.secondary_diagnoses?.forEach((dx, i) => addIfNotRejected(dx, 'Secondary', `secondary-${i}`, 'icd'));
        dc?.reason_for_admit?.forEach((dx, i) => addIfNotRejected(dx, 'Reason for Admit', `admit-${i}`, 'icd'));
        dc?.ed_em_level?.forEach((em, i) => addIfNotRejected(em, 'E/M Level', `em-${i}`, 'icd'));
        aiData?.procedures?.forEach((proc, i) => addIfNotRejected(proc, 'Procedure', `proc-${i}`, 'cpt'));

        // Custom codes
        customCodes.forEach((cc) => {
          finalCodes.push({
            code: cc._code,
            description: cc._desc,
            category: cc._category,
            type: cc._type,
            status: 'added',
            isCustom: true,
          });
        });

        const statusLabel = (s) => {
          if (s === 'accepted') return { text: 'Accepted', bg: '#dcfce7', color: '#166534' };
          if (s === 'edited') return { text: 'Edited', bg: '#dbeafe', color: '#1e40af' };
          if (s === 'added') return { text: 'Added', bg: '#fdf4ff', color: '#86198f' };
          return { text: 'Pending', bg: '#f8fafc', color: '#94a3b8' };
        };

        return (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setSubmitPopupOpen(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-[600px] max-h-[80vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{
                padding: "16px 24px", background: "#1a1d23", borderRadius: "16px 16px 0 0",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: 0 }}>Review & Submit</h3>
                  <p style={{ color: "#94a3b8", fontSize: 11, margin: "4px 0 0" }}>
                    {finalCodes.length} codes will be submitted
                  </p>
                </div>
                <button
                  onClick={() => setSubmitPopupOpen(false)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, border: "none",
                    background: "rgba(255,255,255,0.1)", color: "#94a3b8", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>

              {/* Gold-dataset submission metadata */}
              <div style={{
                padding: "14px 24px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc",
                display: "flex", flexDirection: "column", gap: 12,
              }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                      Primary Specialty
                    </label>
                    <select
                      value={goldSpecialty || (chart?.Specialty ? (
                        /emerg/i.test(chart.Specialty) ? "EM" :
                        /cardio/i.test(chart.Specialty) ? "CARD" :
                        /gastro/i.test(chart.Specialty) ? "GI" :
                        /pulmon/i.test(chart.Specialty) ? "PULM" :
                        /oncol/i.test(chart.Specialty) ? "ONC" :
                        /neuro/i.test(chart.Specialty) ? "NEURO" :
                        /general\s*surg/i.test(chart.Specialty) ? "GS" :
                        /internal/i.test(chart.Specialty) ? "IM" : ""
                      ) : "")}
                      onChange={(e) => setGoldSpecialty(e.target.value)}
                      style={{
                        width: "100%", padding: "8px 10px", borderRadius: 8,
                        border: "1px solid #cbd5e1", background: "#fff", fontSize: 13, color: "#1e293b",
                      }}
                    >
                      <option value="">— Select specialty —</option>
                      <option value="EM">EM — Emergency Medicine</option>
                      <option value="CARD">CARD — Cardiology</option>
                      <option value="GI">GI — Gastroenterology</option>
                      <option value="IM">IM — Internal Medicine</option>
                      <option value="PULM">PULM — Pulmonology</option>
                      <option value="ONC">ONC — Oncology</option>
                      <option value="GS">GS — General Surgery</option>
                      <option value="NEURO">NEURO — Neurology</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                      Session Confidence
                      <span style={{ color: "#0ea5e9", marginLeft: 6, fontWeight: 800 }}>{sessionConfidence}/10</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={sessionConfidence}
                      onChange={(e) => setSessionConfidence(parseInt(e.target.value, 10))}
                      style={{ width: "100%", accentColor: "#0ea5e9", marginTop: 6 }}
                    />
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 10, color: "#94a3b8", lineHeight: 1.5 }}>
                  These values are used to weight the training records in the Gold Dataset. Specialty is injected into the SFT prompt; confidence multiplies into the per-record quality weight.
                </p>
              </div>

              {/* Code List */}
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
                {finalCodes.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
                    <p style={{ fontSize: 13 }}>No codes to submit</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {finalCodes.map((fc, i) => {
                      const sl = statusLabel(fc.status);
                      return (
                        <div key={i} style={{
                          display: "flex", alignItems: "flex-start", gap: 12,
                          padding: "12px 14px", borderRadius: 10,
                          background: fc.isCustom ? "#fdf4ff" : "#f8fafc",
                          border: fc.isCustom ? "1.5px dashed #d946ef" : "1px solid #e2e8f0",
                        }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{fc.code}</span>
                              <span style={{
                                fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                                background: fc.type === 'cpt' ? '#ecfdf5' : '#eff6ff',
                                color: fc.type === 'cpt' ? '#047857' : '#1d4ed8',
                                textTransform: "uppercase",
                              }}>
                                {fc.type === 'cpt' ? 'CPT' : 'ICD-10'}
                              </span>
                              <span style={{
                                fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 4,
                                background: sl.bg, color: sl.color, textTransform: "uppercase",
                              }}>
                                {sl.text}
                              </span>
                            </div>
                            <p style={{ fontSize: 12, color: "#475569", margin: 0, lineHeight: 1.5 }}>
                              {fc.description || 'No description'}
                            </p>
                            <span style={{ fontSize: 10, color: "#94a3b8", marginTop: 4, display: "inline-block" }}>
                              {fc.category}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{
                padding: "16px 24px", borderTop: "1px solid #e2e8f0",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <button
                  onClick={() => setSubmitPopupOpen(false)}
                  style={{
                    padding: "9px 20px", borderRadius: 8,
                    border: "1px solid #e2e8f0", background: "#fff", color: "#64748b",
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Back to Review
                </button>
                <button
                  onClick={async () => {
                    try {
                      // Build review actions from codeDecisions
                      const actions = [];
                      const dc = aiData?.diagnosisCodes;
                      const allSubmitCodes = [];

                      // Collect all AI codes with their keys and original data
                      if (dc?.principal_diagnosis) allSubmitCodes.push({ key: 'principal-0', data: dc.principal_diagnosis });
                      if (dc?.primary_diagnosis) dc.primary_diagnosis.forEach((dx, i) => allSubmitCodes.push({ key: `primary-${i}`, data: dx }));
                      if (dc?.secondary_diagnoses) dc.secondary_diagnoses.forEach((dx, i) => allSubmitCodes.push({ key: `secondary-${i}`, data: dx }));
                      if (dc?.reason_for_admit) dc.reason_for_admit.forEach((dx, i) => allSubmitCodes.push({ key: `admit-${i}`, data: dx }));
                      if (dc?.ed_em_level) dc.ed_em_level.forEach((em, i) => allSubmitCodes.push({ key: `em-${i}`, data: em }));
                      if (aiData?.procedures) aiData.procedures.forEach((proc, i) => allSubmitCodes.push({ key: `proc-${i}`, data: proc }));

                      // Fetch predicted_code_ids from the review API so we can reference them
                      const reviewId = aiData.chartNumber || aiData.sessionId || id;
                      let reviewCodesMap = {};
                      try {
                        const rcRes = await axios.get(`${MEDX_API_URL}/review/${reviewId}/codes`, {
                          headers: { ...(localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {}) },
                        });
                        if (rcRes.data.success && Array.isArray(rcRes.data.codes)) {
                          for (const rc of rcRes.data.codes) {
                            const k = (rc.icd_code || rc.code || '').replace(/\./g, '');
                            reviewCodesMap[k] = rc.id || rc.predicted_code_id;
                          }
                        }
                      } catch (e) {
                        console.warn('Could not fetch review codes, submitting without predicted_code_ids:', e.message);
                      }

                      for (const { key, data } of allSubmitCodes) {
                        const decision = codeDecisions[key];
                        const codeVal = (data?.icd_10_code || data?.code || data?.cpt_code || '').replace(/\./g, '');
                        const predictedCodeId = data?.predicted_code_id || reviewCodesMap[codeVal];
                        const origCode = data?.icd_10_code || data?.code || data?.cpt_code || '';
                        const origDesc = data?.description || data?.finding || data?.procedure_name || '';
                        const codeType = key.startsWith('proc') ? 'cpt' : (key.startsWith('primary') || key.startsWith('principal') ? 'primary' : 'secondary');
                        const seqPos = data?.sequence_pos;

                        if (!decision || decision.status === 'accepted') {
                          actions.push({ predicted_code_id: predictedCodeId || undefined, action: 'ACCEPT', correct_code: origCode, correct_description: origDesc, code_type: codeType, sequence_pos: seqPos });
                        } else if (decision.status === 'rejected') {
                          actions.push({
                            predicted_code_id: predictedCodeId || undefined,
                            action: 'DELETE',
                            reason: decision.reason,
                            reason_option_id: decision.reasonOptionId || null,
                            reason_option_label: decision.reasonOptionLabel || null,
                            correct_code: origCode,
                            correct_description: origDesc,
                            code_type: codeType,
                          });
                        } else if (decision.status === 'edited') {
                          actions.push({
                            predicted_code_id: predictedCodeId || undefined,
                            action: 'EDIT',
                            original_code: origCode,
                            correct_code: decision.editedCode,
                            correct_description: decision.editedDesc,
                            code_type: codeType,
                            sequence_pos: seqPos,
                            reason: decision.reason,
                            reason_option_id: decision.reasonOptionId || null,
                            reason_option_label: decision.reasonOptionLabel || null,
                          });
                        }
                      }

                      // Add custom codes
                      customCodes.forEach((cc) => {
                        const dec = codeDecisions[cc._key];
                        actions.push({
                          action: 'ADD',
                          correct_code: cc._code,
                          correct_description: cc._desc,
                          code_type: cc._type === 'cpt' ? 'cpt' : (cc._category === 'Primary' ? 'primary' : 'secondary'),
                          reason: cc._reason || dec?.reason || 'Manually added code by coder',
                          reason_option_id: cc._reasonOptionId || dec?.reasonOptionId || null,
                          reason_option_label: cc._reasonOptionLabel || dec?.reasonOptionLabel || null,
                        });
                      });

                      if (actions.length === 0) {
                        setConfirmPopup({ type: 'warning', title: 'No Actions', message: 'No review actions to submit. Please edit, reject, or add at least one code.' });
                        return;
                      }

                      const response = await axios.post(`${MEDX_API_URL}/review/${reviewId}/submit`, {
                        coder_id: localStorage.getItem('userId') || 'default-coder',
                        actions,
                      }, {
                        headers: {
                          ...(localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {}),
                        },
                      });

                      if (response.data.success) {
                        // ── Also submit to Valerion Gold Dataset API ──
                        // Builds code_annotations payload from the coder's decisions + AI data,
                        // and POSTs it to /api/gold-dataset/submit so the session feeds SFT/DPO training.
                        let goldResult = null;
                        let goldError = null;
                        try {
                          const toIcdDot = (c) => {
                            const s = (c || '').replace(/\./g, '').toUpperCase();
                            if (s.length > 3 && /^[A-Z]/.test(s)) return `${s.slice(0, 3)}.${s.slice(3)}`;
                            return s;
                          };
                          const mapCodeType = (key) => {
                            if (key.startsWith('principal')) return 'ADMIT CODE';
                            if (key.startsWith('primary')) return 'PRIMARY';
                            return 'SECONDARY';
                          };
                          const toAiConfidence = (data) => {
                            const raw = data?.ai_confidence ?? data?.confidence_score ?? data?.confidence;
                            if (typeof raw === 'number') return raw > 1 ? raw / 100 : raw;
                            if (typeof raw === 'string') {
                              const lower = raw.toLowerCase();
                              if (lower === 'high') return 0.9;
                              if (lower === 'medium') return 0.7;
                              if (lower === 'low') return 0.5;
                              const n = parseFloat(raw);
                              if (!isNaN(n)) return n > 1 ? n / 100 : n;
                            }
                            return 0.75;
                          };
                          const getAiReasoning = (data) => (
                            data?.ai_reasoning || data?.reasoning || data?.finding ||
                            data?.description || 'No reasoning provided by AI'
                          );

                          const specialtyCode = goldSpecialty || (chart?.Specialty ? (
                            /emerg/i.test(chart.Specialty) ? 'EM' :
                            /cardio/i.test(chart.Specialty) ? 'CARD' :
                            /gastro/i.test(chart.Specialty) ? 'GI' :
                            /pulmon/i.test(chart.Specialty) ? 'PULM' :
                            /oncol/i.test(chart.Specialty) ? 'ONC' :
                            /neuro/i.test(chart.Specialty) ? 'NEURO' :
                            /general\s*surg/i.test(chart.Specialty) ? 'GS' :
                            /internal/i.test(chart.Specialty) ? 'IM' : 'EM'
                          ) : 'EM');

                          const code_annotations = {};
                          for (const { key, data } of allSubmitCodes) {
                            const decision = codeDecisions[key];
                            const origCode = toIcdDot(data?.icd_10_code || data?.code || data?.cpt_code || '');
                            if (!origCode) continue;
                            const codeKey = origCode.replace(/\./g, '');
                            const origDesc = data?.description || data?.finding || data?.procedure_name || '';
                            const codeTypeLabel = mapCodeType(key);
                            const aiConfidence = toAiConfidence(data);
                            const aiReasoning = getAiReasoning(data);

                            // `timestamp` intentionally omitted — same upstream asyncpg
                            // string → datetime bug as session_started_at / submitted_at.
                            // Field is optional per gold-dataset-api.md.
                            const baseAnno = {
                              code: origCode,
                              description: origDesc,
                              code_type: codeTypeLabel,
                              ai_confidence: aiConfidence,
                              ai_reasoning: aiReasoning,
                              ai_reasoning_correct: decision?.status === 'accepted',
                              session_confidence: sessionConfidence,
                              specialty: specialtyCode,
                            };

                            const status = decision?.status || 'accepted';

                            if (status === 'accepted') {
                              const evidence = (decision?.reason || aiReasoning || origDesc || '').trim();
                              code_annotations[codeKey] = {
                                ...baseAnno,
                                action: 'accepted',
                                accept: {
                                  evidence_text: evidence.length >= 20
                                    ? evidence
                                    : `${origDesc} — documented in clinical note supporting this ICD-10 code assignment`,
                                },
                              };
                            } else if (status === 'rejected') {
                              const explanation = (decision?.reason || '').trim();
                              code_annotations[codeKey] = {
                                ...baseAnno,
                                ai_reasoning_correct: false,
                                action: 'rejected',
                                reject: {
                                  category: 'Concept wrong — not documented',
                                  is_hallucination: false,
                                  explanation: explanation.length >= 60
                                    ? explanation
                                    : `${explanation} — Coder rejected this code because it is not supported by the clinical documentation for this encounter.`.trim(),
                                },
                              };
                            } else if (status === 'edited') {
                              const newCode = toIcdDot(decision?.editedCode || origCode);
                              const justification = (decision?.reason || '').trim();
                              code_annotations[codeKey] = {
                                ...baseAnno,
                                ai_reasoning_correct: false,
                                action: 'edited',
                                edit: {
                                  original_code: origCode,
                                  original_desc: origDesc,
                                  new_code: newCode,
                                  new_desc: decision?.editedDesc || '',
                                  ai_error_reason: justification.length >= 30
                                    ? justification
                                    : `${justification} — AI selected an incorrect code for the documented clinical scenario.`.trim(),
                                  justification: justification.length >= 40
                                    ? justification
                                    : `${justification} — Per ICD-10-CM guidelines, the corrected code better reflects the documented clinical picture.`.trim(),
                                },
                              };
                            }
                          }

                          // Include coder-added custom codes as accepted entries
                          customCodes.forEach((cc) => {
                            const origCode = toIcdDot(cc._code);
                            if (!origCode) return;
                            const codeKey = origCode.replace(/\./g, '');
                            const evidence = (cc._reason || '').trim();
                            code_annotations[codeKey] = {
                              code: origCode,
                              description: cc._desc || '',
                              code_type: cc._category === 'Primary' ? 'PRIMARY' : 'SECONDARY',
                              ai_confidence: 0.5,
                              ai_reasoning: 'Code was not suggested by AI — added manually by coder.',
                              ai_reasoning_correct: false,
                              action: 'accepted',
                              session_confidence: sessionConfidence,
                              specialty: specialtyCode,
                              // timestamp intentionally omitted — see baseAnno note above
                              accept: {
                                evidence_text: evidence.length >= 20
                                  ? evidence
                                  : `${cc._desc || origCode} — documented in clinical note, added by coder as a missing code`,
                              },
                            };
                          });

                          const encounterId = aiData?.encounter_id || chart?.EncounterId || chart?.ChartNo || aiData?.chartNumber || `ENC-${reviewId}`;
                          const totalCodesCount = allSubmitCodes.length + customCodes.length;
                          const reviewedCount = Object.keys(codeDecisions).length + customCodes.length;

                          // NOTE: session_started_at and submitted_at are intentionally OMITTED.
                          // Both are optional per gold-dataset-api.md v2.1, and the upstream
                          // server at :9090 has a Python bug (asyncpg refusing str → datetime)
                          // that makes any string we send crash its INSERT at argument $22.
                          // Omitting lets the server fall back to its own default (datetime.now()).
                          const goldPayload = {
                            session_id: `SES-${Date.now()}`,
                            encounter_id: String(encounterId),
                            chart_id: String(chart?.ChartNo || reviewId || ''),
                            coder_id: localStorage.getItem('userId') || 'default-coder',
                            primary_specialty: specialtyCode,
                            session_confidence: sessionConfidence,
                            total_codes: totalCodesCount,
                            reviewed_codes: reviewedCount,
                            code_annotations,
                            schema_version: '2.1',
                            dataset_type: 'gold_annotation',
                            summary: {},
                            sft_records: [],
                            dpo_pairs: [],
                            qdrant: {},
                          };

                          // Routed through med-ai-b so the browser only talks to our backend.
                          // med-ai-b forwards the payload to http://216.48.183.225:9090/api/gold-dataset/submit.
                          const goldResp = await axios.post(
                            `${MEDX_API_URL}/review/gold-dataset/submit`,
                            goldPayload,
                            {
                              headers: {
                                'Content-Type': 'application/json',
                                ...(localStorage.getItem("token") ? { Authorization: `Bearer ${localStorage.getItem("token")}` } : {}),
                              },
                            }
                          );
                          goldResult = goldResp.data;
                        } catch (gErr) {
                          console.error('Gold dataset submit error:', gErr);
                          goldError = gErr.response?.data?.message || gErr.response?.data?.detail || gErr.message;
                        }

                        setSubmitPopupOpen(false);
                        setReviewPopupOpen(false);
                        // Reset review state so refetched data displays cleanly
                        setCodeDecisions({});
                        setCustomCodes([]);
                        const baseMsg = `${response.data.total_actions || actions.length} review action(s) submitted successfully.`;
                        const goldMsg = goldResult
                          ? ` Gold Dataset: ${goldResult.accepted_sft_records ?? 0} SFT / ${goldResult.accepted_dpo_pairs ?? 0} DPO records accepted.`
                          : goldError
                            ? ` (Gold Dataset sync failed: ${goldError})`
                            : '';
                        setConfirmPopup({
                          type: goldError ? 'warning' : 'success',
                          title: goldError ? 'Submitted (Gold Dataset Failed)' : 'Review Submitted',
                          message: baseMsg + goldMsg,
                        });
                        // Refetch chart data to get the updated final codes from the database
                        fetchAiData();

                        // Update chart info form fields with the final submitted codes
                        // (auto-fill only runs when aiStatus=ready, but after submit it's 'submitted')
                        {
                          const getCode = (item) => item?.icd_10_code || item?.code || item?.cpt_code || '';
                          // Compute final primary diagnosis from actions
                          const primaryAction = actions.find(a => a.code_type === 'primary' && a.action === 'EDIT');
                          const primaryAccept = actions.find(a => a.code_type === 'primary' && a.action === 'ACCEPT');
                          const newPrimary = primaryAction?.correct_code || primaryAccept?.correct_code
                            || getCode(dc?.primary_diagnosis?.[0]) || getCode(dc?.principal_diagnosis);
                          // Compute final procedure code
                          const procAction = actions.find(a => (a.code_type === 'cpt') && a.action === 'EDIT');
                          const procAccept = actions.find(a => (a.code_type === 'cpt') && a.action === 'ACCEPT');
                          const newProc = procAction?.correct_code || procAccept?.correct_code
                            || getCode(aiData?.procedures?.[0]);

                          setFormData(prev => {
                            const updates = {};
                            if (newPrimary) updates.primaryDiagnosis = newPrimary;
                            if (newProc) updates.procedureCode = newProc;
                            return Object.keys(updates).length > 0 ? { ...prev, ...updates } : prev;
                          });
                        }
                      } else {
                        setConfirmPopup({ type: 'error', title: 'Review Submission Failed', message: response.data.error || 'Unknown error' });
                      }
                    } catch (error) {
                      console.error('Review submit error:', error);
                      setConfirmPopup({ type: 'error', title: 'Review Submission Failed', message: error.response?.data?.error || error.message });
                    }
                  }}
                  disabled={finalCodes.length === 0}
                  style={{
                    padding: "9px 24px", borderRadius: 8, border: "none",
                    background: finalCodes.length > 0 ? "linear-gradient(135deg, #10b981, #059669)" : "#e2e8f0",
                    color: finalCodes.length > 0 ? "#fff" : "#94a3b8",
                    fontSize: 13, fontWeight: 700, cursor: finalCodes.length > 0 ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  <CheckCircle2 style={{ width: 15, height: 15 }} /> Final Submit
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Confirmation Popup ── */}
      {confirmPopup && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setConfirmPopup(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-[420px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              padding: "24px 28px 16px",
              display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%", marginBottom: 16,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: confirmPopup.type === 'success' ? '#dcfce7' : confirmPopup.type === 'error' ? '#fef2f2' : '#fffbeb',
              }}>
                {confirmPopup.type === 'success' ? (
                  <CheckCircle2 style={{ width: 28, height: 28, color: "#16a34a" }} />
                ) : confirmPopup.type === 'error' ? (
                  <AlertCircle style={{ width: 28, height: 28, color: "#dc2626" }} />
                ) : (
                  <AlertCircle style={{ width: 28, height: 28, color: "#d97706" }} />
                )}
              </div>
              <h3 style={{
                fontSize: 16, fontWeight: 700, margin: "0 0 8px",
                color: confirmPopup.type === 'success' ? '#166534' : confirmPopup.type === 'error' ? '#991b1b' : '#92400e',
              }}>
                {confirmPopup.title}
              </h3>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, margin: 0 }}>
                {confirmPopup.message}
              </p>
            </div>
            <div style={{ padding: "12px 28px 20px", display: "flex", justifyContent: "center" }}>
              <button
                onClick={() => setConfirmPopup(null)}
                style={{
                  padding: "9px 32px", borderRadius: 8, border: "none",
                  background: confirmPopup.type === 'success' ? '#16a34a' : confirmPopup.type === 'error' ? '#dc2626' : '#d97706',
                  color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
