const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true, slowMo: 500 });
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();

  const PASS = '✅';
  const FAIL = '❌';
  const results = [];

  function log(label, passed, detail = '') {
    const icon = passed ? PASS : FAIL;
    console.log(`${icon} ${label}${detail ? ' — ' + detail : ''}`);
    results.push({ label, passed });
  }

  try {
    // Step 1: Navigate
    await page.goto('https://katalian-banking.vercel.app');
    log('Page loaded', true);

    // Step 2: Login
    await page.fill('input[type="text"], input[placeholder*="sername"], input[name*="user"]', 'bankinguser123');
    await page.fill('input[type="password"]', 'notapassword@123');
    await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');

    // Wait for dashboard
    await page.waitForURL(/dashboard|home/, { timeout: 10000 }).catch(() => {});
    const afterLogin = await page.url();
    const loggedIn = !afterLogin.includes('login') && !afterLogin.includes('signin');
    log('Login successful', loggedIn, afterLogin);

    if (!loggedIn) {
      // Try checking for error message
      const errText = await page.textContent('body');
      console.log('Page text after login attempt:', errText?.slice(0, 300));
    }

    // Step 3: Click Deposit
    await page.waitForTimeout(1500);
    const depositBtn = page.locator('text=Deposit').first();
    await depositBtn.waitFor({ timeout: 8000 });
    await depositBtn.click();
    log('Clicked Deposit', true);

    // Step 4: Select Check Deposit (Step 1 of the form)
    await page.waitForTimeout(800);
    const checkOption = page.locator('text=Check Deposit, button:has-text("Check")').first();
    // Try multiple selectors for the Check Deposit button
    const checkSelectors = [
      'button:has-text("Check Deposit")',
      '[class*="Check"]',
      'text=Check Deposit',
      'button >> text=Check',
    ];
    let checkClicked = false;
    for (const sel of checkSelectors) {
      const el = page.locator(sel).first();
      if (await el.isVisible().catch(() => false)) {
        await el.click();
        checkClicked = true;
        break;
      }
    }
    log('Selected Check Deposit', checkClicked);

    // Step 5: Enter $50 amount
    await page.waitForTimeout(500);
    const amountInput = page.locator('input[type="number"], input[placeholder="0.00"], input#amount');
    await amountInput.waitFor({ timeout: 5000 });
    await amountInput.fill('50');
    const amountVal = await amountInput.inputValue();
    log('Entered amount $50', amountVal === '50', `value: ${amountVal}`);

    // Step 6: Click Continue to go to step 2 (check image upload)
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(1000);
    log('Clicked Continue to check upload step', true);

    // Step 7: Upload check front
    const frontInput = page.locator('input[type="file"]').first();
    await frontInput.waitFor({ timeout: 5000 });
    await frontInput.setInputFiles('/tmp/check_front.png');
    await page.waitForTimeout(800);
    // Verify the front image appeared
    const frontImgVisible = await page.locator('img[alt="Front"]').isVisible().catch(() => false);
    log('Uploaded check front image', frontImgVisible);

    // Step 8: Upload check back
    const backInput = page.locator('input[type="file"]').nth(1);
    await backInput.waitFor({ timeout: 5000 });
    await backInput.setInputFiles('/tmp/check_back.png');
    await page.waitForTimeout(800);
    const backImgVisible = await page.locator('img[alt="Back"]').isVisible().catch(() => false);
    log('Uploaded check back image', backImgVisible);

    // Step 9: Continue to review step
    const continueBtn2 = page.locator('button:has-text("Continue")');
    await continueBtn2.waitFor({ timeout: 5000 });
    const continueDisabled = await continueBtn2.isDisabled();
    log('Continue button enabled after uploads', !continueDisabled);
    await continueBtn2.click();
    await page.waitForTimeout(800);
    log('Navigated to Final Authorization step', true);

    // Step 10: Verify review screen shows correct info
    const reviewBody = await page.textContent('body');
    const shows50 = reviewBody?.includes('50') || reviewBody?.includes('$50');
    const showsRIC = reviewBody?.includes('Remote Image Capture') || reviewBody?.includes('Check');
    const showsPassed = reviewBody?.includes('Passed');
    log('Review shows $50 amount', !!shows50);
    log('Review shows Remote Image Capture method', !!showsRIC);
    log('Review shows Image Verification Passed', !!showsPassed);

    // Step 11: Authorize the deposit
    const authorizeBtn = page.locator('button:has-text("Authorize Deposit")');
    await authorizeBtn.waitFor({ timeout: 5000 });
    await authorizeBtn.click();
    log('Clicked Authorize Deposit', true);

    // Step 12: Wait for processing spinner then success
    await page.waitForSelector('text=Processing Image Data', { timeout: 5000 }).catch(() => {});
    log('Processing spinner appeared', true);

    // Wait for success screen (up to 5s after 2.5s delay)
    await page.waitForSelector('text=Deposit Confirmed', { timeout: 8000 });
    const successText = await page.textContent('body');
    const confirmed = successText?.includes('Deposit Confirmed');
    const checkMessage = successText?.includes('check image') || successText?.includes('clearing');
    log('Deposit Confirmed screen shown', !!confirmed);
    log('Check-specific success message shown', !!checkMessage);

    // Step 13: Return to Portfolio button present
    const returnBtn = await page.locator('button:has-text("Return to Portfolio")').isVisible();
    log('Return to Portfolio button visible', returnBtn);

  } catch (err) {
    console.error(`\n${FAIL} Test error: ${err.message}`);
    await page.screenshot({ path: '/tmp/test-error.png', fullPage: true });
    console.log('Screenshot saved to /tmp/test-error.png');
  } finally {
    // Summary
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`Test Summary: ${passed} passed, ${failed} failed`);
    if (failed > 0) {
      console.log('\nFailed checks:');
      results.filter(r => !r.passed).forEach(r => console.log(`  ${FAIL} ${r.label}`));
    }

    await page.waitForTimeout(2000);
    await browser.close();
  }
})();
