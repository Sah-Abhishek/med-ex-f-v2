import { useEffect, useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  REASON_CATEGORIES,
  REASON_ACTIONS,
  listReasonOptions,
  createReasonOption,
  deleteReasonOption,
} from '../../services/reasonOptionsService';

const inputClasses =
  'w-full px-3 py-2 bg-white border border-[var(--color-border)] rounded-[var(--radius-md)] text-sm text-[var(--color-text)] placeholder-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-subtle)] transition-all duration-200';

const actionBadgeColors = {
  add: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  edit: 'bg-amber-50 text-amber-700 border-amber-100',
  reject: 'bg-red-50 text-red-700 border-red-100',
};

const ReasonOptionsSettings = () => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState(REASON_CATEGORIES[0].key);
  const [drafts, setDrafts] = useState({});
  const [submittingKey, setSubmittingKey] = useState(null);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const data = await listReasonOptions();
      setOptions(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load reason options');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const draftKey = (category, action) => `${category}__${action}`;

  const handleAdd = async (category, action) => {
    const key = draftKey(category, action);
    const label = (drafts[key] || '').trim();
    if (!label) return;
    try {
      setSubmittingKey(key);
      const created = await createReasonOption({ category, action, label });
      setOptions((prev) => [...prev, created]);
      setDrafts((prev) => ({ ...prev, [key]: '' }));
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add option');
    } finally {
      setSubmittingKey(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this option? It will no longer appear in dropdowns.')) return;
    try {
      await deleteReasonOption(id);
      setOptions((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete option');
    }
  };

  const filteredForAction = (action) =>
    options.filter((o) => o.category === activeCategory && o.action === action);

  return (
    <Card
      title="Reason Options"
      subtitle="Manage the dropdown reasons coders pick when adding, editing, or rejecting a code"
    >
      {error && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-[var(--radius-md)] bg-red-50 border border-red-100 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-5">
        {REASON_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              activeCategory === cat.key
                ? 'bg-violet-50 text-violet-700 border-violet-200'
                : 'bg-white text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner className="py-12" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {REASON_ACTIONS.map((act) => {
            const key = draftKey(activeCategory, act.key);
            const rows = filteredForAction(act.key);
            return (
              <div
                key={act.key}
                className="p-4 bg-[var(--color-surface-alt)] rounded-[var(--radius-lg)] border border-[var(--color-border-light)]"
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${actionBadgeColors[act.key]}`}
                  >
                    {act.label}
                  </span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">{rows.length} option{rows.length === 1 ? '' : 's'}</span>
                </div>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={drafts[key] || ''}
                    onChange={(e) => setDrafts((prev) => ({ ...prev, [key]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAdd(activeCategory, act.key);
                      }
                    }}
                    placeholder="Add new option…"
                    className={inputClasses}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleAdd(activeCategory, act.key)}
                    disabled={submittingKey === key || !(drafts[key] || '').trim()}
                  >
                    Add
                  </Button>
                </div>

                <div className="space-y-1.5">
                  {rows.length === 0 ? (
                    <p className="text-xs text-[var(--color-text-tertiary)] py-3 text-center">No options yet</p>
                  ) : (
                    rows.map((row) => (
                      <div
                        key={row.id}
                        className="flex items-center justify-between gap-2 px-3 py-2 bg-white rounded-md border border-[var(--color-border-light)]"
                      >
                        <span className="text-sm text-[var(--color-text)] break-words">{row.label}</span>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="flex-shrink-0 text-[var(--color-text-tertiary)] hover:text-[var(--color-danger)] transition"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default ReasonOptionsSettings;
