import "@testing-library/jest-dom";

import { TextDecoder, TextEncoder } from "node:util";

if (!globalThis.TextEncoder) {
  // @ts-expect-error - polyfill for jsdom environment
  globalThis.TextEncoder = TextEncoder;
}

if (!globalThis.TextDecoder) {
  // @ts-expect-error - polyfill for jsdom environment
  globalThis.TextDecoder = TextDecoder;
}
