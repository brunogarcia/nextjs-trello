import { useState, useCallback } from "react";

import { ActionCallback, FieldErrors } from "@/lib/create-safe-action";

/**
 * Options for the useAction hook.
 */
interface UseActionOptions<TOutput> {
  /**
   * Callback function to be called when the action is successful.
   * @param data - The output data of the action.
   */
  onSuccess?: (data: TOutput) => void;

  /**
   * Callback function to be called when an error occurs during the action.
   * @param error - The error message.
   */
  onError?: (error: string) => void;

  /**
   * Callback function to be called when the action is completed, regardless of success or failure.
   */
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
): {
  execute: (input: TInput) => Promise<void>;
  data: TOutput | undefined;
  error: string | undefined;
  fieldErrors: FieldErrors<TInput> | undefined;
  isLoading: boolean;
} => {
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
