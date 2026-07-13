export type GraphqlFieldErrors =
  | Record<string, string[]>
  | string
  | null
  | undefined;

export function parseGraphqlFieldErrors(
  errors: GraphqlFieldErrors,
): Record<string, string[]> | null {
  if (errors == null) {
    return null;
  }

  if (typeof errors === "string") {
    const trimmed = errors.trim();
    if (!trimmed) {
      return null;
    }

    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, string[]>;
      }
    } catch {
      return null;
    }

    return null;
  }

  return errors;
}

export function extractGraphqlFieldError(
  message: string,
  errors: GraphqlFieldErrors,
): string {
  const parsedErrors = parseGraphqlFieldErrors(errors);

  if (parsedErrors) {
    for (const messages of Object.values(parsedErrors)) {
      if (Array.isArray(messages) && messages[0]?.trim()) {
        return messages[0];
      }
    }
  }

  return message?.trim() || "خطای GraphQL رخ داد.";
}
