import { useState, useCallback } from "react";

import { ActionCallback, FieldErrors } from "@/lib/create-safe-action";

interface UseActionOptions<TOutput> {
  onSuccess?: (data: TOutput) => void;
  onError?: (error: string) => void;
  onComplete?: () => void;
}

/**
 * Custom hook that executes an action and manages its state.
 *
 * @template TInput The type of the input parameter for the action.
 * @template TOutput The type of the output result from the action.
 * @param {ActionCallback<TInput, TOutput>} action The action to be executed.
 * @param {UseActionOptions<TOutput>} [options={}] The options for the hook.
 * @returns {{
 *   execute: (input: TInput) => Promise<void>,
 *   data: TOutput | undefined,
 *   error: string | undefined,
 *   fieldErrors: FieldErrors<TInput> | undefined,
 *   isLoading: boolean
 * }} The hook object with the execute function and the state variables.
 */
export const useAction = <TInput, TOutput>(
  action: ActionCallback<TInput, TOutput>,
  options: UseActionOptions<TOutput> = {}
) => {
  const [fieldErrors, setFieldErrors] = useState<
    FieldErrors<TInput> | undefined
  >(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [data, setData] = useState<TOutput | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const execute = useCallback(
    async (input: TInput) => {
      setIsLoading(true);

      try {
        const result = await action(input);

        if (!result) {
          return;
        }

        setFieldErrors(result.fieldErrors);

        if (result.error) {
          setError(result.error);
          options.onError?.(result.error);
        }

        if (result.data) {
          setData(result.data);
          options.onSuccess?.(result.data);
        }
      } finally {
        setIsLoading(false);
        options.onComplete?.();
      }
    },
    [action, options]
  );

  return {
    execute,
    data,
    error,
    fieldErrors,
    isLoading,
  };
};
