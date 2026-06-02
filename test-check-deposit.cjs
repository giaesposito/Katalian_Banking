const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const FIXTURES = path.join(__dirname, 'tests/fixtures');
const SCREENSHOTS = path.join(__dirname, 'tests/screenshots');
const VIDEO_DIR = path.join(__dirname, 'tests/videos');

fs.mkdirSync(SCREENSHOTS, { recursive: true });
fs.mkdirSync(VIDEO_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, slowMo: 300 });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: VIDEO_DIR, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();

  const PASS = '✅';
  const FAIL = '❌';
  const results = [];
  let screenshotIdx = 0;

  async function snap(name) {
    const file = path.join(SCREENSHOTS, `${String(++screenshotIdx).padStart(2,'0')}-${name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`  📸 screenshot: ${path.basename(file)}`);
  }

  function log(label, passed, detail = '') {
    const icon = passed ? PASS : FAIL;
    console.log(`${icon} ${label}${detail ? ' — ' + detail : ''}`);
    results.push({ label, passed });
  }

  try {
    // ── Step 1: Load the app ──────────────────────────────────────────────────
    console.log('\n── Step 1: Navigate to app');
    await page.goto('https://katalian-banking.vercel.app');
    await page.waitForLoadState('networkidle').catch(() => {});
    await snap('landing');
    const bodyText = await page.textContent('body');
    const loaded = !bodyText?.includes('Host not in allowlist') && !bodyText?.includes('404');
    log('App loaded', loaded, page.url());

    if (!loaded) {
      console.log('Body:', bodyText?.slice(0, 200));
      throw new Error('App unreachable from this environment — see note below');
    }

    // ── Step 2: Login ─────────────────────────────────────────────────────────
    console.log('\n── Step 2: Login');
    await page.waitForTimeout(500);
    // Try common username input selectors
    for (const sel of ['input[name="username"]', 'input[type="text"]', 'input[placeholder*="ser"]', 'input:not([type="password"])']) {
      const el = page.locator(sel).first();
      if (await el.isVisible().catch(() => false)) {
        await el.fill('bankinguser123');
        break;
      }
    }
    await page.fill('input[type="password"]', 'notapassword@123');
    await snap('login-filled');
    await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
    await page.waitForTimeout(2000);
    await snap('after-login');

    const afterLoginUrl = page.url();
    const loggedIn = !afterLoginUrl.includes('login') && !afterLoginUrl.includes('signin');
    log('Login successful', loggedIn, afterLoginUrl);

    // ── Step 3: Navigate to Deposit ───────────────────────────────────────────
    console.log('\n── Step 3: Click Deposit');
    await page.waitForTimeout(1000);
    const depositBtn = page.locator('text=Deposit').first();
    await depositBtn.waitFor({ timeout: 8000 });
    await depositBtn.click();
    await page.waitForTimeout(1000);
    await snap('deposit-step1');
    log('Clicked Deposit nav', true);

    // ── Step 4: Select Check Deposit ──────────────────────────────────────────
    console.log('\n── Step 4: Select Check Deposit');
    let checkClicked = false;
    for (const sel of ['button:has-text("Check Deposit")', 'text=Check Deposit', 'button:has-text("Check")']) {
      const el = page.locator(sel).first();
      if (await el.isVisible().catch(() => false)) {
        await el.click();
        checkClicked = true;
        break;
      }
    }
    await page.waitForTimeout(500);
    await snap('check-deposit-selected');
    log('Selected Check Deposit', checkClicked);

    // ── Step 5: Enter $50 ─────────────────────────────────────────────────────
    console.log('\n── Step 5: Enter $50 amount');
    const amountInput = page.locator('input[type="number"], input[placeholder="0.00"], input#amount').first();
    await amountInput.waitFor({ timeout: 5000 });
    await amountInput.fill('50');
    const amountVal = await amountInput.inputValue();
    await snap('amount-entered');
    log('Entered amount $50', amountVal === '50', `value="${amountVal}"`);

    // ── Step 6: Continue to image upload ─────────────────────────────────────
    console.log('\n── Step 6: Continue to image upload step');
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(1200);
    await snap('check-upload-step');
    log('Navigated to check image upload step', true);

    // ── Step 7: Upload check front ────────────────────────────────────────────
    console.log('\n── Step 7: Upload check front');
    const frontInput = page.locator('input[type="file"]').first();
    await frontInput.waitFor({ timeout: 5000 });
    await frontInput.setInputFiles(path.join(FIXTURES, 'check_front.png'));
    await page.waitForTimeout(1000);
    await snap('check-front-uploaded');
    const frontVisible = await page.locator('img[alt="Front"]').isVisible().catch(() => false);
    log('Check front image uploaded & previewed', frontVisible);

    // ── Step 8: Upload check back ─────────────────────────────────────────────
    console.log('\n── Step 8: Upload check back');
    const backInput = page.locator('input[type="file"]').nth(1);
    await backInput.waitFor({ timeout: 5000 });
    await backInput.setInputFiles(path.join(FIXTURES, 'check_back.png'));
    await page.waitForTimeout(1000);
    await snap('check-back-uploaded');
    const backVisible = await page.locator('img[alt="Back"]').isVisible().catch(() => false);
    log('Check back image uploaded & previewed', backVisible);

    // ── Step 9: Continue to review ────────────────────────────────────────────
    console.log('\n── Step 9: Continue to Final Authorization');
    const continueBtn = page.locator('button:has-text("Continue")');
    await continueBtn.waitFor({ timeout: 5000 });
    const isDisabled = await continueBtn.isDisabled();
    log('Continue enabled after both uploads', !isDisabled);
    await continueBtn.click();
    await page.waitForTimeout(1000);
    await snap('review-screen');

    // ── Step 10: Validate review details ──────────────────────────────────────
    console.log('\n── Step 10: Validate review screen');
    const reviewText = await page.textContent('body');
    log('Review shows $50 amount',          !!reviewText?.includes('50'));
    log('Review shows Remote Image Capture', !!reviewText?.includes('Remote Image Capture'));
    log('Review shows Image Verification Passed', !!reviewText?.includes('Passed'));

    // ── Step 11: Authorize deposit ────────────────────────────────────────────
    console.log('\n── Step 11: Authorize Deposit');
    const authorizeBtn = page.locator('button:has-text("Authorize Deposit")');
    await authorizeBtn.waitFor({ timeout: 5000 });
    await authorizeBtn.click();
    await page.waitForTimeout(500);
    await snap('processing-spinner');
    log('Clicked Authorize Deposit', true);

    // Wait for processing spinner
    const spinnerAppeared = await page.locator('text=Processing Image Data').isVisible().catch(() => false);
    log('Processing spinner shown', spinnerAppeared);

    // ── Step 12: Confirm success screen ───────────────────────────────────────
    console.log('\n── Step 12: Wait for Deposit Confirmed');
    await page.waitForSelector('text=Deposit Confirmed', { timeout: 8000 });
    await snap('deposit-confirmed');
    const finalText = await page.textContent('body');
    log('Deposit Confirmed screen shown',       !!finalText?.includes('Deposit Confirmed'));
    log('Check clearing message shown',          !!finalText?.includes('clearing'));
    log('Return to Portfolio button present',    await page.locator('button:has-text("Return to Portfolio")').isVisible());

  } catch (err) {
    console.error(`\n${FAIL} Test error: ${err.message}`);
    if (err.message.includes('unreachable')) {
      console.log('\n⚠️  NOTE: katalian-banking.vercel.app blocks requests from this cloud IP.');
      console.log('   Run this test locally: node test-check-deposit.cjs');
    }
    await snap('error').catch(() => {});
  } finally {
    // Close context BEFORE reading video path (Playwright finalises on close)
    await context.close();
    await browser.close();

    const videos = fs.readdirSync(VIDEO_DIR).filter(f => f.endsWith('.webm'));
    if (videos.length) console.log(`\n🎥 Video saved: tests/videos/${videos[videos.length-1]}`);

    const shots = fs.readdirSync(SCREENSHOTS);
    console.log(`\n📸 ${shots.length} screenshots in tests/screenshots/`);

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`Test Summary: ${passed} passed, ${failed} failed`);
    if (failed) results.filter(r => !r.passed).forEach(r => console.log(`  ${FAIL} ${r.label}`));
  }
})();
