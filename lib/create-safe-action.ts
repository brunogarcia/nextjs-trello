import { z } from "zod";

export type FieldErrors<T> = {
  [K in keyof T]?: string[];
};

export type ActionState<TInput, TOutput> = {
  data?: TOutput;
  error?: string | null;
  fieldErrors?: FieldErrors<TInput>;
};

export type ActionCallback<Input, Output> = (
  data: Input
) => Promise<ActionState<Input, Output>>;

export const createSafeAction = <TInput, TOutput>(
  schema: z.Schema<TInput>,
  handler: ActionCallback<TInput, TOutput>
) => {
  return async (data: TInput) => {
    const validationResult = schema.safeParse(data);
    if (!validationResult.success) {
      return {
        fieldErrors: validationResult.error.flatten()
          .fieldErrors as FieldErrors<TInput>,
      };
    }

    return handler(validationResult.data);
  };
};
