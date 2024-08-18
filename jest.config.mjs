/** @type {import("jest").Config} */
const config = {
  coverageProvider: "v8",
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["./jest.setup.js"],
  moduleFileExtensions: ["ts", "tsx", "js", "json", "node"]
};

export default config;
