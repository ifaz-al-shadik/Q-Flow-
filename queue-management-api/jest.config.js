/** @type {import('jest').Config} */
const config = {
    testEnvironment: 'node',
    testMatch: ['**/src/tests/**/*.test.js'],
    testTimeout: 30000,
    verbose: true,
    forceExit: true,
    detectOpenHandles: true,
};

export default config;
