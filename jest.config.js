module.exports = {
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/__tests__/"
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    }
  },
  setupFiles: [
    "core-js"
  ],
  testEnvironment: "jsdom",
  testMatch: [
    "**/*.spec.ts",
    "**/*.spec.tsx"
  ],
  moduleFileExtensions: [
    "js",
    "ts",
    "tsx"
  ],
  setupFilesAfterEnv: [
    "./jest-setup.ts"
  ],
  testURL: "http://example.org/resources/5"
};
