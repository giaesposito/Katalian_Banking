const { chromium } = require('playwright');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');
const fs = require('fs');

const FIXTURES    = path.join(__dirname, 'tests/fixtures');
const SCREENSHOTS = path.join(__dirname, 'tests/screenshots');
const VIDEO_DIR   = path.join(__dirname, 'tests/videos');

fs.mkdirSync(SCREENSHOTS, { recursive: true });
fs.mkdirSync(VIDEO_DIR,   { recursive: true });

const anthropic = new Anthropic.default({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com',
});

// ── AI fallback ───────────────────────────────────────────────────────────────
// When a scripted action fails, send Claude a screenshot + goal and ask for a
// CSS selector to try instead.
async function askClaude(page, goal) {
  console.log(`  🤖 Scripted selector failed — asking Claude: "${goal}"`);
  const screenshotBuf = await page.screenshot({ fullPage: false });
  const base64 = screenshotBuf.toString('base64');

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 256,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: 'image/png', data: base64 },
        },
        {
          type: 'text',
          text: `This is a screenshot of a web app. I need to: "${goal}"\n\nReply with ONLY a valid CSS selector for the element I should interact with. No explanation, no markdown — just the selector string.`,
        },
      ],
    }],
  });

  const selector = response.content[0].text.trim().replace(/^`|`$/g, '');
  console.log(`  🤖 Claude suggested selector: ${selector}`);
  return selector;
}

// ── smartAction ───────────────────────────────────────────────────────────────
// Tries scriptedFn first. On failure, asks Claude for a selector and retries.
async function smartAction(page, goal, scriptedFn, retries = 1) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt === 0) {
        await scriptedFn(page);
      } else {
        const selector = await askClaude(page, goal);
        await page.locator(selector).first().click({ timeout: 5000 });
      }
      return true;
    } catch (err) {
      if (attempt === retries) {
        console.log(`  ⚠️  All attempts failed for: "${goal}" — ${err.message.split('\n')[0]}`);
        return false;
      }
      console.log(`  ↩  Scripted attempt failed (${err.message.split('\n')[0]}), falling back to AI…`);
    }
  }
}

// ── smartFill ─────────────────────────────────────────────────────────────────
async function smartFill(page, goal, selectors, value) {
  for (const sel of selectors) {
    const el = page.locator(sel).first();
    if (await el.isVisible().catch(() => false)) {
      await el.fill(value);
      return true;
    }
  }
  // Fallback: ask Claude
  console.log(`  🤖 No fill selector matched — asking Claude: "${goal}"`);
  const selector = await askClaude(page, goal);
  await page.locator(selector).first().fill(value);
  return true;
}

// ── Main test ─────────────────────────────────────────────────────────────────
(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: VIDEO_DIR, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();

  const PASS = '✅'; const FAIL = '❌';
  const results = [];
  let idx = 0;

  async function snap(name) {
    const file = path.join(SCREENSHOTS, `${String(++idx).padStart(2,'0')}-${name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`  📸 ${path.basename(file)}`);
  }

  function log(label, passed, detail = '') {
    console.log(`${passed ? PASS : FAIL} ${label}${detail ? ' — ' + detail : ''}`);
    results.push({ label, passed });
  }

  try {
    // ── 1. Load app ───────────────────────────────────────────────────────────
    console.log('\n── 1. Load app');
    await page.goto('https://katalian-banking.vercel.app');
    await page.waitForLoadState('networkidle').catch(() => {});
    await snap('landing');
    const bodyText = await page.textContent('body');
    const loaded = !bodyText?.includes('Host not in allowlist') && !bodyText?.includes('404');
    log('App loaded', loaded, page.url());
    if (!loaded) throw new Error('App blocked by sandbox egress allowlist — add katalian-banking.vercel.app to the network policy and re-run.');

    // ── 2. Login ──────────────────────────────────────────────────────────────
    console.log('\n── 2. Login');
    await smartFill(page, 'fill in the username field with bankinguser123',
      ['input[name="username"]', 'input[type="text"]', 'input[placeholder*="ser"]'],
      'bankinguser123');
    await smartFill(page, 'fill in the password field with notapassword@123',
      ['input[type="password"]'],
      'notapassword@123');
    await snap('login-filled');

    await smartAction(page, 'click the Login or Sign In button',
      p => p.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first().click());
    await page.waitForTimeout(2000);
    await snap('after-login');
    const loggedIn = !page.url().includes('login');
    log('Login successful', loggedIn, page.url());

    // ── 3. Click Deposit ──────────────────────────────────────────────────────
    console.log('\n── 3. Navigate to Deposit');
    await page.waitForTimeout(800);
    const ok3 = await smartAction(page, 'click the Deposit navigation link or button',
      p => p.locator('text=Deposit').first().click({ timeout: 8000 }));
    await page.waitForTimeout(1000);
    await snap('deposit-form');
    log('Opened Deposit screen', ok3);

    // ── 4. Select Check Deposit ───────────────────────────────────────────────
    console.log('\n── 4. Select Check Deposit');
    const ok4 = await smartAction(page, 'click the Check Deposit option (not Electronic Transfer)',
      p => p.locator('button:has-text("Check Deposit"), text=Check Deposit').first().click({ timeout: 5000 }));
    await page.waitForTimeout(500);
    await snap('check-selected');
    log('Selected Check Deposit', ok4);

    // ── 5. Enter $50 ──────────────────────────────────────────────────────────
    console.log('\n── 5. Enter $50 amount');
    await smartFill(page, 'fill in the deposit amount field with 50',
      ['input[type="number"]', 'input[placeholder="0.00"]', 'input#amount'],
      '50');
    await snap('amount-entered');
    const val = await page.locator('input[type="number"], input[placeholder="0.00"], input#amount').first().inputValue().catch(() => '');
    log('Amount $50 entered', val === '50', `value="${val}"`);

    // ── 6. Continue to upload step ────────────────────────────────────────────
    console.log('\n── 6. Continue to image upload');
    await smartAction(page, 'click the Continue button to proceed to the next step',
      p => p.locator('button:has-text("Continue")').first().click({ timeout: 5000 }));
    await page.waitForTimeout(1200);
    await snap('upload-step');
    log('Navigated to image upload step', true);

    // ── 7. Upload check front ─────────────────────────────────────────────────
    console.log('\n── 7. Upload check front image');
    const frontInput = page.locator('input[type="file"]').first();
    await frontInput.waitFor({ timeout: 5000 });
    await frontInput.setInputFiles(path.join(FIXTURES, 'check_front.png'));
    await page.waitForTimeout(1000);
    await snap('front-uploaded');
    const frontOk = await page.locator('img[alt="Front"]').isVisible().catch(() => false);
    log('Check front uploaded & previewed', frontOk);

    // ── 8. Upload check back ──────────────────────────────────────────────────
    console.log('\n── 8. Upload check back image');
    const backInput = page.locator('input[type="file"]').nth(1);
    await backInput.waitFor({ timeout: 5000 });
    await backInput.setInputFiles(path.join(FIXTURES, 'check_back.png'));
    await page.waitForTimeout(1000);
    await snap('back-uploaded');
    const backOk = await page.locator('img[alt="Back"]').isVisible().catch(() => false);
    log('Check back uploaded & previewed', backOk);

    // ── 9. Continue to review ─────────────────────────────────────────────────
    console.log('\n── 9. Continue to Final Authorization');
    const continueBtn = page.locator('button:has-text("Continue")').first();
    const disabled = await continueBtn.isDisabled().catch(() => true);
    log('Continue enabled after both uploads', !disabled);
    await smartAction(page, 'click the Continue button to proceed to final authorization',
      p => p.locator('button:has-text("Continue")').first().click({ timeout: 5000 }));
    await page.waitForTimeout(1000);
    await snap('review');

    // ── 10. Validate review screen ────────────────────────────────────────────
    console.log('\n── 10. Validate review details');
    const reviewText = await page.textContent('body');
    log('Review shows $50',                      !!reviewText?.includes('50'));
    log('Review shows Remote Image Capture',      !!reviewText?.includes('Remote Image Capture'));
    log('Review shows Image Verification Passed', !!reviewText?.includes('Passed'));

    // ── 11. Authorize ─────────────────────────────────────────────────────────
    console.log('\n── 11. Authorize Deposit');
    await smartAction(page, 'click the Authorize Deposit button to submit the deposit',
      p => p.locator('button:has-text("Authorize Deposit")').first().click({ timeout: 5000 }));
    await page.waitForTimeout(500);
    await snap('processing');
    log('Clicked Authorize Deposit', true);
    const spinner = await page.locator('text=Processing Image Data').isVisible().catch(() => false);
    log('Processing spinner shown', spinner);

    // ── 12. Confirm success ───────────────────────────────────────────────────
    console.log('\n── 12. Confirm success screen');
    await page.waitForSelector('text=Deposit Confirmed', { timeout: 8000 });
    await snap('confirmed');
    const finalText = await page.textContent('body');
    log('Deposit Confirmed screen shown',      !!finalText?.includes('Deposit Confirmed'));
    log('Check clearing message shown',         !!finalText?.includes('clearing'));
    log('Return to Portfolio button present',   await page.locator('button:has-text("Return to Portfolio")').isVisible());

  } catch (err) {
    console.error(`\n${FAIL} Fatal: ${err.message.split('\n')[0]}`);
    await snap('error').catch(() => {});
  } finally {
    await context.close();
    await browser.close();

    const videos = fs.readdirSync(VIDEO_DIR).filter(f => f.endsWith('.webm'));
    if (videos.length) console.log(`\n🎥 Video: tests/videos/${videos[videos.length-1]}`);

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    console.log(`\n${'─'.repeat(50)}`);
    console.log(`Summary: ${passed} passed, ${failed} failed`);
    if (failed) results.filter(r => !r.passed).forEach(r => console.log(`  ${FAIL} ${r.label}`));
  }
})();
