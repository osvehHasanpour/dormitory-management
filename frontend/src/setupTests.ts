import "@testing-library/jest-dom";

import { TextDecoder, TextEncoder } from "node:util";

if (!globalThis.TextEncoder) {
  globalThis.TextEncoder = TextEncoder;
}

if (!globalThis.TextDecoder) {
  globalThis.TextDecoder = TextDecoder;
}