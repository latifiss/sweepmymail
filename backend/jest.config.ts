import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(spec|test).ts'],
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/**/index.ts'],
}

export default config

