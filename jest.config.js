module.exports = {
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/__tests__/"
  ],
  coverageThreshold: {
    global: {
      branches: 91,
      functions: 97,
      lines: 96,
      statements: 96
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
