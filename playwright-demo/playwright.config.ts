import { defineConfig, devices } from '@playwright/test';

const ENVIRONMENT_URLS: Record<string, string> = {
  local:      'http://localhost:5173',
  qa:         process.env.QA_URL         || 'https://qa-katalian-bank.vercel.app',
  production: process.env.PROD_URL       || 'https://katalian-bank.vercel.app',
};

const ENV = (process.env.TEST_ENV as keyof typeof ENVIRONMENT_URLS) || 'local';
const BASE_URL = ENVIRONMENT_URLS[ENV];

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // ── Browser projects (run against TEST_ENV, default: local) ───────────
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
      },
    },
    {
      name: 'edge',
      use: { ...devices['Desktop Chrome'], channel: 'msedge' },
    },

    // ── Environment-scoped projects (chromium only) ───────────────────────
    {
      name: 'local',
      use: { ...devices['Desktop Chrome'], baseURL: ENVIRONMENT_URLS.local },
    },
    {
      name: 'qa',
      use: { ...devices['Desktop Chrome'], baseURL: ENVIRONMENT_URLS.qa },
    },
    {
      name: 'production',
      use: { ...devices['Desktop Chrome'], baseURL: ENVIRONMENT_URLS.production },
    },
  ],

  webServer: {
    command: './node_modules/.bin/vite --port 5173',
    cwd: '../',
    url: ENVIRONMENT_URLS.local,
    reuseExistingServer: true,
    timeout: 30000,
  },
});
