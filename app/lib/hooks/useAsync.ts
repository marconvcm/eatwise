import { useCallback, useEffect, useState } from "react";

type AsyncState<T> = {
  loading: boolean;
  error: Error | null;
  data: T | null;
};

type UseAsyncReturn<T> = AsyncState<T> & {
  execute: () => Promise<void>;
  reset: () => void;
};

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
): UseAsyncReturn<T> {
  const [state, setState] = useState<AsyncState<T>>({
    loading: immediate,
    error: null,
    data: null,
  });

  const execute = useCallback(async () => {
    setState({ loading: true, error: null, data: null });

    try {
      const result = await asyncFunction();
      setState({ loading: false, error: null, data: result });
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error : new Error(String(error)),
        data: null,
      });
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setState({ loading: false, error: null, data: null });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    ...state,
    execute,
    reset,
  };
}
