import { defineConfig, devices } from '@playwright/test';

// Use the pre-installed Chromium binary (network policy blocks downloading new ones)
const CHROMIUM_EXECUTABLE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    screenshot: 'only-on-failure',
    video: 'on',
    trace: 'retain-on-failure',
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'production',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://katalian-banking.vercel.app',
        launchOptions: { executablePath: CHROMIUM_EXECUTABLE },
      },
    },
    {
      name: 'qa',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://katalian-banking-qa.vercel.app',
        launchOptions: { executablePath: CHROMIUM_EXECUTABLE },
      },
    },
    {
      // For running locally when network access to Vercel is restricted
      name: 'local',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:5173',
        launchOptions: { executablePath: CHROMIUM_EXECUTABLE },
      },
    },
  ],
});
