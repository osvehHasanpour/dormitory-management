import {
  extractGraphqlFieldError,
  parseGraphqlFieldErrors,
} from "../../utils/graphqlFieldErrors";

describe("graphqlFieldErrors", () => {
  it("parses JSON string errors from GraphQL JSONString scalar", () => {
    const parsed = parseGraphqlFieldErrors(
      '{"permission":["این بخش فقط برای سرپرست یا مدیر در دسترس است."]}',
    );

    expect(parsed?.permission?.[0]).toBe(
      "این بخش فقط برای سرپرست یا مدیر در دسترس است.",
    );
  });

  it("does not treat JSON string errors as character arrays", () => {
    const message = extractGraphqlFieldError(
      "شما مجوز انجام این عملیات را ندارید.",
      '{"permission":["این بخش فقط برای سرپرست یا مدیر در دسترس است."]}',
    );

    expect(message).toBe("این بخش فقط برای سرپرست یا مدیر در دسترس است.");
    expect(message).not.toBe("{");
  });

  it("falls back to message when errors are empty", () => {
    expect(extractGraphqlFieldError("لیست دریافت نشد.", null)).toBe(
      "لیست دریافت نشد.",
    );
  });
});
