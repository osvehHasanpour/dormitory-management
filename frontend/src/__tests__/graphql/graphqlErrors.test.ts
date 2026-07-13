import { toPersianGraphqlError } from "../../utils/graphqlErrors";

describe("toPersianGraphqlError", () => {
  const originalOnLine = navigator.onLine;

  afterEach(() => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: originalOnLine,
    });
  });

  it("returns offline message when navigator is offline", () => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: false,
    });

    const result = toPersianGraphqlError(new TypeError("Failed to fetch"));

    expect(result.message).toBe(
      "اتصال اینترنت برقرار نیست. لطفاً اتصال خود را بررسی کنید.",
    );
  });

  it("translates failed to fetch when online", () => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: true,
    });

    const result = toPersianGraphqlError(new TypeError("Failed to fetch"));

    expect(result.message).toBe(
      "ارتباط با سرور برقرار نشد. لطفاً اتصال اینترنت را بررسی کنید.",
    );
  });

  it("keeps existing Persian error messages", () => {
    const original = new Error("درخواست مورد نظر یافت نشد.");
    const result = toPersianGraphqlError(original);

    expect(result.message).toBe("درخواست مورد نظر یافت نشد.");
  });
});
