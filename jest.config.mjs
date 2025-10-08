export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        isolatedModules: true,
        module: 'ESNext',
        target: 'ESNext'
      }
    }],
    '^.+\\.(js|jsx|mjs)$': ['babel-jest', {
      configFile: './babel.config.cjs'
    }]
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': '<rootDir>/src/test-utils/styleMock.js',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/test-utils/fileMock.js',
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^isows$': '<rootDir>/src/test-utils/isowsMock.js'
  },
  setupFilesAfterEnv: ['<rootDir>/src/test-utils/jest.setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/test-utils/**/*',
    '!src/**/__tests__/**/*',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.stories.tsx',
    '!src/types/**/*',
    '!src/mocks/**/*'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'mjs'],
  testPathIgnorePatterns: ['/node_modules/', '/test/', '/dist/', '/build/'],
  transformIgnorePatterns: [
    'node_modules/(?!(@supabase|@tanstack|lucide-react|viem|ethers|buffer|fp-ts|isows)/)'
  ],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  }
};