import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'production',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://katalian-banking.vercel.app',
      },
    },
    {
      name: 'qa',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://katalian-banking-qa.vercel.app',
      },
    },
  ],
});
