import { useState, useEffect, useCallback } from 'react';
import { forecastApi } from '../services/forecastApi';
import { DEMO_DATA } from '../services/demoFallbackData';

export function useForecastData() {
  const [metrics, setMetrics] = useState(null);
  const [dailySummary, setDailySummary] = useState([]);
  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);
  const [isDemoData, setIsDemoData] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const loadDemoData = useCallback(() => {
    setMetrics(DEMO_DATA.metrics);
    setDailySummary(DEMO_DATA.dailySummary);
    setComparisons(DEMO_DATA.comparisons);
    setIsDemoData(true);
    setError(null);
    setLoading(false);
    setLastRefreshed(new Date());
  }, []);

  const performFetch = useCallback(async () => {
    try {
      const [metricsRes, dailyRes, comparisonsRes] = await Promise.all([
        forecastApi.getMetrics(),
        forecastApi.getDailySummary(),
        forecastApi.getComparisons({ limit: 1000 }),
      ]);

      setMetrics(metricsRes);
      setDailySummary(dailyRes.items || []);
      setComparisons(comparisonsRes.items || []);
      setBackendConnected(true);
      setIsDemoData(false);
      setError(null);
      setLastRefreshed(new Date());
      setLoading(false);
    } catch (err) {
      setBackendConnected(false);
      const baseUrl = forecastApi.getBaseUrl();
      const message = `Unable to connect to FastAPI backend at ${baseUrl}. (${err.message || 'Network error'})`;
      setError(message);
      setMetrics(DEMO_DATA.metrics);
      setDailySummary(DEMO_DATA.dailySummary);
      setComparisons(DEMO_DATA.comparisons);
      setIsDemoData(true);
      setLoading(false);
      console.warn('Backend connection failed:', message);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function initialLoad() {
      try {
        const [metricsRes, dailyRes, comparisonsRes] = await Promise.all([
          forecastApi.getMetrics(),
          forecastApi.getDailySummary(),
          forecastApi.getComparisons({ limit: 1000 }),
        ]);

        if (!ignore) {
          setMetrics(metricsRes);
          setDailySummary(dailyRes.items || []);
          setComparisons(comparisonsRes.items || []);
          setBackendConnected(true);
          setIsDemoData(false);
          setError(null);
          setLastRefreshed(new Date());
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setBackendConnected(false);
          const baseUrl = forecastApi.getBaseUrl();
          setError(`Unable to connect to FastAPI backend at ${baseUrl}. (${err.message})`);
          setMetrics(DEMO_DATA.metrics);
          setDailySummary(DEMO_DATA.dailySummary);
          setComparisons(DEMO_DATA.comparisons);
          setIsDemoData(true);
          setLoading(false);
        }
      }
    }

    initialLoad();

    return () => {
      ignore = true;
    };
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    return performFetch();
  }, [performFetch]);

  return {
    metrics,
    dailySummary,
    comparisons,
    loading,
    error,
    backendConnected,
    isDemoData,
    lastRefreshed,
    refresh,
    loadDemoData,
  };
}
