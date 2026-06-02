import { defineConfig, devices } from '@playwright/test';

const ENVIRONMENT_URLS: Record<string, string> = {
  local:      'http://localhost:5173',
  qa:         process.env.QA_URL         || 'https://qa-katalian-bank.vercel.app',
  production: process.env.PROD_URL       || 'https://katalian-bank.vercel.app',
};

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'local',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: ENVIRONMENT_URLS.local,
      },
    },
    {
      name: 'qa',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: ENVIRONMENT_URLS.qa,
      },
    },
    {
      name: 'production',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: ENVIRONMENT_URLS.production,
      },
    },
  ],

  // Dev server is only started when running the 'local' project
  webServer: {
    command: 'npm run dev',
    cwd: '../',
    url: ENVIRONMENT_URLS.local,
    reuseExistingServer: true,
    timeout: 30000,
  },
});
