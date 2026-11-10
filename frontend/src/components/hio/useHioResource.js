import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

// Poll only while visible. Abort requests on tab changes and ignore stale responses.
export default function useHioResource(load, poll = false) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const controller = useRef(null);
  const sequence = useRef(0);
  const refresh = useCallback(async () => {
    controller.current?.abort();
    controller.current = new AbortController();
    const id = ++sequence.current;
    setRefreshing(true);
    setError(null);
    try {
      const result = await load(controller.current.signal);
      if (sequence.current === id) setData(result);
    } catch (failure) {
      if (sequence.current === id && failure.code !== 'ERR_CANCELED') {
        const status = failure.response?.status;
        setError(status === 401 ? 'Your session has expired. Sign out and sign in again.' :
          status === 403 ? 'This module is available to Health Information Officers only.' :
            failure.response?.data?.message || 'Unable to load data. Check your connection and try again.');
      }
    } finally {
      if (sequence.current === id) { setLoading(false); setRefreshing(false); }
    }
  }, [load]);
  useFocusEffect(useCallback(() => {
    setData(null);
    setLoading(true);
    refresh();
    const timer = poll ? setInterval(refresh, 30000) : null;
    return () => { clearInterval(timer); ++sequence.current; controller.current?.abort(); };
  }, [refresh, poll]));
  return { data, loading, refreshing, error, refresh };
}
