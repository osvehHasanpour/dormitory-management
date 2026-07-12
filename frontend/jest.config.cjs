/** @type {import("jest").Config} */
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  testMatch: ["<rootDir>/src/**/__tests__/**/*.test.ts?(x)"],
  transform: {
    "^.+\\.(t|j)sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "<rootDir>/src/test/styleMock.cjs",
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/src/test/fileMock.cjs",
    "^@media/(.*)$": "<rootDir>/src/test/fileMock.cjs",
  },
};
