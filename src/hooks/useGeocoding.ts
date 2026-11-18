import { useState, useCallback, useRef, useEffect } from 'react';
import type { GeoLocation } from '@/domain/types';
import { searchLocations } from '@/services/geocoding';
import { debounce } from '@/utils/debounce';
import { GEOCODING_DEBOUNCE_MS } from '@/config/constants';

interface UseGeocodingReturn {
  readonly results: readonly GeoLocation[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly search: (query: string) => void;
  readonly clear: () => void;
}

/**
 * Hook for debounced geocoding search.
 * Aborts previous requests when a new search is triggered.
 */
export function useGeocoding(): UseGeocodingReturn {
  const [results, setResults] = useState<readonly GeoLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const doSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);

    const result = await searchLocations(query, controller.signal);

    if (controller.signal.aborted) return;

    if (result.ok) {
      setResults(result.value);
    } else {
      setError(result.error.message);
    }

    setLoading(false);
  }, []);

  const debouncedSearch = useRef(debounce(doSearch, GEOCODING_DEBOUNCE_MS));

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
      debouncedSearch.current.cancel();
    };
  }, []);

  const search = useCallback(
    (query: string) => {
      debouncedSearch.current(query);
    },
    [],
  );

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return { results, loading, error, search, clear };
}
