export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "jsdom",
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  roots: ["<rootDir>/src"],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)",
  ],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          jsx: "react-jsx",
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          isolatedModules: true,
          module: "ESNext",
          target: "ESNext",
        },
      },
    ],
    "^.+\\.(js|jsx|mjs)$": [
      "babel-jest",
      {
        configFile: "./babel.config.cjs",
      },
    ],
  },
  moduleNameMapper: {
    // Config and library mocks
    "^@/config/env$": "<rootDir>/src/test-utils/envMock.js",
    "^@/config/docs$": "<rootDir>/src/test-utils/docsMock.js",
    "^@/lib/supabase$": "<rootDir>/src/test-utils/supabaseMock.js",
    "^@/lib/sentry$": "<rootDir>/src/test-utils/sentryMock.js",
    "(.*)/config/env(\\.ts)?$": "<rootDir>/src/test-utils/envMock.js",
    "(.*)/config/docs(\\.ts)?$": "<rootDir>/src/test-utils/docsMock.js",
    "(.*)/lib/supabase(\\.ts)?$": "<rootDir>/src/test-utils/supabaseMock.js",
    "(.*)/lib/sentry(\\.ts)?$": "<rootDir>/src/test-utils/sentryMock.js",
    // Generic path mapping
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "<rootDir>/src/test-utils/styleMock.js",
    "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/src/test-utils/fileMock.js",
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^isows$": "<rootDir>/src/test-utils/isowsMock.js",
  },
  setupFiles: ["<rootDir>/src/test-utils/jest.env-setup.js"],
  setupFilesAfterEnv: ["<rootDir>/src/test-utils/jest.setup.ts"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.ts",
    "!src/test-utils/**/*",
    "!src/**/__tests__/**/*",
    "!src/**/*.test.{ts,tsx}",
    "!src/**/*.stories.tsx",
    "!src/types/**/*",
    "!src/mocks/**/*",
  ],
  coverageReporters: ["text", "lcov", "json", "html"],
  coverageDirectory: "coverage",
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node", "mjs"],
  testPathIgnorePatterns: ["/node_modules/", "/test/", "/dist/", "/build/"],
  transformIgnorePatterns: [
    "node_modules/(?!(@supabase|@tanstack|lucide-react|viem|ethers|buffer|fp-ts|isows)/)",
  ],
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  },
};
