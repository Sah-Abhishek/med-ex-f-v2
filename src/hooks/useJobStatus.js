import { useEffect, useRef, useState, useCallback } from 'react';
import { MEDX_WS_URL } from '../utils/constants';

export function useJobStatus(jobId) {
  const [status, setStatus] = useState(null);
  const [phase, setPhase] = useState(null);
  const [message, setMessage] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const retriesRef = useRef(0);
  const maxRetries = 5;

  const connect = useCallback(() => {
    if (!jobId) return;

    const ws = new WebSocket(MEDX_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      retriesRef.current = 0;
      ws.send(JSON.stringify({ type: 'subscribe', jobId }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'status_update') {
          setStatus(data.status);
          setPhase(data.phase);
          setMessage(data.message);
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      // Reconnect with backoff unless job is terminal
      if (retriesRef.current < maxRetries) {
        const delay = Math.min(1000 * 2 ** retriesRef.current, 10000);
        retriesRef.current++;
        setTimeout(connect, delay);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [jobId]);

  useEffect(() => {
    if (!jobId) {
      setStatus(null);
      setPhase(null);
      setMessage(null);
      return;
    }

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [jobId, connect]);

  // Stop reconnecting once job reaches terminal state
  useEffect(() => {
    if (status === 'completed' || status === 'failed') {
      retriesRef.current = maxRetries; // prevent further reconnections
    }
  }, [status]);

  return { status, phase, message, isConnected };
}
