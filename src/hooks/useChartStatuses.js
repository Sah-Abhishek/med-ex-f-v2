import { useEffect, useRef, useState } from 'react';
import { MEDX_WS_URL } from '../utils/constants';

const POLL_INTERVAL = 10000; // 10 seconds

/**
 * Hook that subscribes to real-time chart AI status updates via WebSocket,
 * with a polling fallback that re-fetches statuses every 10s.
 *
 * @param {string[]} sessionIds - Array of chart session IDs to watch
 * @param {Function} fetchStatuses - Async function that returns { [sessionId]: aiStatus }
 * @returns {Object} statusMap - { [sessionId]: aiStatus }
 */
export function useChartStatuses(sessionIds, fetchStatuses) {
  const [statusMap, setStatusMap] = useState({});
  const wsRef = useRef(null);
  const retriesRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const maxRetries = 5;
  const sessionIdsRef = useRef(sessionIds);
  sessionIdsRef.current = sessionIds;

  // Derive a stable key so effects re-run when the set of IDs changes
  const sessionKey = sessionIds?.length > 0 ? sessionIds.map(String).sort().join(',') : '';

  // ── Polling fallback ──────────────────────────────────────────────
  useEffect(() => {
    if (!sessionKey || !fetchStatuses) return;

    let cancelled = false;

    const poll = async () => {
      try {
        const data = await fetchStatuses();
        if (!cancelled && data) {
          setStatusMap(prev => {
            const merged = { ...prev };
            for (const [key, value] of Object.entries(data)) {
              merged[String(key)] = value;
            }
            return merged;
          });
        }
      } catch {
        // ignore polling errors
      }
    };

    // Fetch immediately on mount / sessionKey change
    poll();

    const interval = setInterval(poll, POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [sessionKey, fetchStatuses]);

  // ── WebSocket (instant updates when available) ────────────────────
  useEffect(() => {
    if (!sessionKey) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      setStatusMap({});
      return;
    }

    retriesRef.current = 0;

    function connect() {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      console.log('[useChartStatuses] Connecting WebSocket to', MEDX_WS_URL);
      const ws = new WebSocket(MEDX_WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[useChartStatuses] WebSocket OPEN — subscribing to', sessionIdsRef.current.length, 'charts');
        retriesRef.current = 0;
        ws.send(JSON.stringify({
          type: 'subscribe_charts',
          sessionIds: sessionIdsRef.current.map(String)
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'chart_status_update' && data.sessionId) {
            console.log('[useChartStatuses] WS update:', data.sessionId, '→', data.aiStatus);
            setStatusMap(prev => ({ ...prev, [String(data.sessionId)]: data.aiStatus }));
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = (e) => {
        console.log('[useChartStatuses] WebSocket CLOSED, code:', e.code);
        if (wsRef.current === ws && retriesRef.current < maxRetries) {
          const delay = Math.min(1000 * 2 ** retriesRef.current, 10000);
          retriesRef.current++;
          reconnectTimerRef.current = setTimeout(connect, delay);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [sessionKey]);

  // Re-subscribe when sessionIds change but WS is already open
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === 1 && sessionIds?.length > 0) {
      wsRef.current.send(JSON.stringify({ type: 'unsubscribe_charts' }));
      wsRef.current.send(JSON.stringify({
        type: 'subscribe_charts',
        sessionIds: sessionIds.map(String)
      }));
    }
  }, [sessionIds]);

  return statusMap;
}
