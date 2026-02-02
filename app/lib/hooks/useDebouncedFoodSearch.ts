import { useEffect, useState } from 'react';
import { FoodSearchService } from '../food/service';
import type { FoodSearchCriteria, FoodSearchResponse } from '../food/types';
import { useDebounce } from './useDebounce';

interface UseDebouncedFoodSearchOptions {
  delay?: number;
  enabled?: boolean;
  searchOptions?: Partial<Omit<FoodSearchCriteria, 'query'>>;
}

interface UseDebouncedFoodSearchResult {
  data: FoodSearchResponse | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to perform debounced food searches
 * Prevents excessive API calls while user is typing
 * @param query - Search query string
 * @param options - Configuration options
 * @returns Search results, loading state, and error
 */
export function useDebouncedFoodSearch(
  query: string,
  options: UseDebouncedFoodSearchOptions = {}
): UseDebouncedFoodSearchResult {
  const { delay = 500, enabled = true, searchOptions } = options;
  const debouncedQuery = useDebounce(query, delay);
  const [data, setData] = useState<FoodSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !debouncedQuery.trim()) {
      setData(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    FoodSearchService.searchFoods(debouncedQuery, searchOptions)
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to search foods'));
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, enabled, searchOptions]);

  return { data, loading, error };
}
