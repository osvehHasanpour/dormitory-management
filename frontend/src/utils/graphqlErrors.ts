const ENGLISH_NETWORK_PATTERNS = [
  /^failed to fetch$/i,
  /^networkerror/i,
  /^network request failed$/i,
  /^load failed$/i,
  /^the internet connection appears to be offline$/i,
];

export function toPersianGraphqlError(error: unknown): Error {
  if (error instanceof Error) {
    if (
      typeof navigator !== "undefined" &&
      navigator.onLine === false
    ) {
      return new Error(
        "اتصال اینترنت برقرار نیست. لطفاً اتصال خود را بررسی کنید.",
      );
    }

    if (ENGLISH_NETWORK_PATTERNS.some((pattern) => pattern.test(error.message))) {
      return new Error(
        "ارتباط با سرور برقرار نشد. لطفاً اتصال اینترنت را بررسی کنید.",
      );
    }

    return error;
  }

  return new Error("خطای غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.");
}
