import type { Config } from "jest"

const config: Config = {
  preset: "ts-jest",
  verbose: true,
  automock: false,
  testEnvironment: "node",
  testMatch: ["<rootDir>/**/*.test.ts"],
}

export default config
