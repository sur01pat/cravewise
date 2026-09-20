import { useState, useCallback } from 'react';
import { ApiCallError } from '../utils/apiClient';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * useAsync — thin hook wrapping an async function with loading/error state.
 *
 * Usage:
 *   const { data, loading, error, run } = useAsync(apiRecommend);
 *   ...
 *   <Button onPress={() => run('toast and coffee')} />
 */
export function useAsync<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
): AsyncState<TResult> & { run: (...args: TArgs) => Promise<void> } {
  const [state, setState] = useState<AsyncState<TResult>>({
    data: null,
    loading: false,
    error: null,
  });

  const run = useCallback(
    async (...args: TArgs): Promise<void> => {
      setState({ data: null, loading: true, error: null });
      try {
        const result = await fn(...args);
        setState({ data: result, loading: false, error: null });
      } catch (err) {
        const message =
          err instanceof ApiCallError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Something went wrong. Please try again.';
        setState({ data: null, loading: false, error: message });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fn],
  );

  return { ...state, run };
}
