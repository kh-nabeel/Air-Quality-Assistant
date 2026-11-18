import { useState, useEffect, useCallback, useRef } from 'react';
import type { AqiData, HourlyAqiData, Result } from '@/domain/types';
import { fetchAirQuality } from '@/services/airQuality';

interface UseAirQualityReturn {
  readonly data: AqiData | null;
  readonly hourly: readonly HourlyAqiData[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly refetch: () => void;
}

/**
 * Hook for fetching and caching air quality data.
 * Automatically aborts requests on unmount or coordinate change.
 */
export function useAirQuality(lat: number | null, lng: number | null): UseAirQualityReturn {
  const [data, setData] = useState<AqiData | null>(null);
  const [hourly, setHourly] = useState<readonly HourlyAqiData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (lat === null || lng === null) return;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    const result: Result<{ current: AqiData; hourly: HourlyAqiData[] }> = await fetchAirQuality(
      lat,
      lng,
      controller.signal,
    );

    if (controller.signal.aborted) return;

    if (result.ok) {
      setData(result.value.current);
      setHourly(result.value.hourly);
    } else {
      setError(result.error.message);
    }

    setLoading(false);
  }, [lat, lng]);

  useEffect(() => {
    fetchData();
    return () => controllerRef.current?.abort();
  }, [fetchData]);

  return { data, hourly, loading, error, refetch: fetchData };
}
