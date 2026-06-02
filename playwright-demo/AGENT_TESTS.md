# KB-15 Security Actions – Playwright Agent Test Scenarios

Run these by opening a Claude Code session from the `playwright-demo/` directory.
The `.mcp.json` will load the Playwright MCP server automatically.
Paste each scenario block as a prompt and Claude will execute it using browser tools.

---

## Setup (run once before all scenarios)

```
Navigate to http://localhost:5173/login.
Fill the "Secure ID" field with "bankinguser123".
Fill the "Access Code" field with "notapassword@123".
Click the "Enter Vault Access" button.
Wait for the page to navigate to /dashboard.
Take a screenshot and confirm the dashboard is visible.
```

---

## SCENARIO 1 – Report Stolen Asset (no state change)

```
Navigate to http://localhost:5173/security/report.

VERIFY:
- Page shows "Security Protocol" header
- Subheader shows "Incident Management"
- "Asset Compromise Report" heading is visible
- "Affected Facility" dropdown is present with all user accounts listed
- "Incident Narrative" textarea is present with placeholder text
- "Authorize Asset Freeze" button is DISABLED

Fill the "Incident Narrative" textarea with "Lost physical card at airport".

VERIFY:
- "Authorize Asset Freeze" button is now ENABLED

Click "Authorize Asset Freeze".

VERIFY (Step 2):
- Page shows "Confirm Asset Freeze" heading
- Lock icon (🔒) is visible
- Message includes the selected account type
- "THIS WILL BLOCK ALL INCOMING AND OUTGOING ELECTRONIC AUTHORIZATIONS" is visible

Click "Execute Freeze Protocol".

VERIFY (Processing):
- Loading spinner is visible
- Text "Provisioning Asset Block" is visible
- Subheader shows "Establishing Block"
- Close (X) button is NOT visible

Wait for processing to complete (up to 5 seconds).

VERIFY (Step 3 – Success):
- "Asset Frozen" heading is visible
- Message about fraud prevention squad contacting within 15 minutes is visible
- Subheader shows "Operation Complete"
- Close (X) button is NOT visible

Click "Back to Portfolio".

VERIFY (Dashboard):
- Page navigates to /dashboard
- NO "Frozen" badge appears on any account card
- Accounts look identical to before the report flow (report is simulation only)

Take a screenshot.
```

---

## SCENARIO 2 – Freeze All Cards: correct accounts frozen

```
Navigate to http://localhost:5173/security/freeze-all.

VERIFY (Step 1):
- Page shows "Security Protocol" header
- Subheader shows "Cryo-Freeze Protocol"
- Snowflake icon (❄️) is visible
- "Cryo-Freeze Cards" heading is visible
- "Affected Facilities:" label is visible
- Badges shown: Checking, Credit Card
- Savings badge is NOT shown
- "Authorize Cryo-Freeze" button is enabled

Click "Authorize Cryo-Freeze".

VERIFY (Processing):
- Loading spinner is visible
- "Deep-Freezing Card Facilities" text is visible
- "Validating security signatures and notifying central bank..." is visible
- Close (X) button is NOT visible

Wait for processing to complete (up to 5 seconds).

VERIFY (Step 3 – Success):
- Snowflake icon (❄️) is visible
- "Facilities Suspended" heading is visible
- Message about deep-freeze status is visible
- Subheader shows "Operation Complete"

Click "Back to Portfolio".

VERIFY (Dashboard – Scenario 2 & 3):
- Checking account card shows a "Frozen" badge
- Credit Card account card shows a "Frozen" badge
- Savings account card does NOT show a "Frozen" badge
- Checking and Credit Card cards are NOT clickable (clicking them does not navigate)

Take a screenshot of the dashboard showing frozen accounts.
```

---

## SCENARIO 3 – Cancel Freeze-All (no state change)

```
Navigate to http://localhost:5173/security/freeze-all.

VERIFY:
- "Cryo-Freeze Cards" step 1 is shown

Click "Cancel Protocol".

VERIFY:
- Page navigates to /dashboard
- NO "Frozen" badge appears on any account card
- All accounts remain in their original state

Take a screenshot.
```

---

## SCENARIO 4 – Nuclear Lockdown: user locked and logged out

```
Navigate to http://localhost:5173/security/lockdown.

VERIFY (Step 1):
- "Security Protocol" header is visible
- Subheader shows "Critical Action Needed"
- Radiation icon (☢️) is visible with pulsing animation
- "Nuclear Lockdown" heading is visible
- Warning text about terminating all sessions is visible
- "THIS ACTION IS IRREVERSIBLE VIA WEB INTERFACE." is visible in red

Click "Initiate Global Lockdown".

VERIFY (Step 2):
- Warning icon (⚠️) is visible with spinning border animation
- "Final Warning" heading is visible
- "Global ledger freeze will commence upon confirmation." is visible
- Progress bar is at approximately 66%

Click "CONFIRM GLOBAL FREEZE".

VERIFY (Processing):
- Loading spinner is visible
- "Terminating All Sessions" text is visible
- "Validating security signatures and notifying central bank..." is visible
- Close (X) button is NOT visible

Wait for processing to complete (up to 5 seconds).

VERIFY (Step 3 – System Locked):
- Lock icon (🔒) is visible in a red container
- "System Locked" heading is visible
- "All digital facilities have been severed. You will be logged out in 3 seconds." is visible
- A progress bar countdown animation is visible
- Close (X) button is NOT visible

Wait up to 7 seconds for auto-logout.

VERIFY:
- Page redirects to /login

Take a screenshot of the login page.
```

---

## SCENARIO 5 – Locked user cannot log in with regular password

```
(Run immediately after Scenario 4, or start fresh on the login page)

Navigate to http://localhost:5173/login.
Fill "Secure ID" with "bankinguser123".
Fill "Access Code" with "notapassword@123".
Click "Enter Vault Access".
Wait up to 3 seconds.

VERIFY:
- Error message "Account locked for security reasons." is visible
- Page remains on /login
- User is NOT redirected to /dashboard

Take a screenshot.
```

---

## SCENARIO 6 – Report flow: Cancel navigates to /contact

```
Navigate to http://localhost:5173/security/report.

VERIFY:
- Step 1 "Asset Compromise Report" is shown

Click the "Cancel" button.

VERIFY:
- Page navigates to /contact
- No account state has changed

Take a screenshot.
```

---

## SCENARIO 7 – Lockdown back navigation does not trigger lockdown

```
Navigate to http://localhost:5173/security/lockdown.

Click "Initiate Global Lockdown".

VERIFY:
- Step 2 "Final Warning" is shown
- Progress bar is at approximately 66%

Click "Back to Safety".

VERIFY:
- Page returns to Step 1 ("Nuclear Lockdown" heading is visible)
- "Final Warning" is no longer visible
- User is still authenticated

Navigate to http://localhost:5173/dashboard.

VERIFY:
- Dashboard loads successfully (user was NOT logged out)
- No accounts are frozen

Take a screenshot.
```

---

## COMMON UI – Progress bar and close button

```
Navigate to http://localhost:5173/security/report.

VERIFY:
- Progress bar is visible at the top of the container at ~33% width
- "Security Protocol" header is visible
- Close (X) button is visible

Fill the textarea with "test".
Click "Authorize Asset Freeze".

VERIFY:
- Progress bar advances to ~66% width
- Close (X) button is still visible on step 2

Click "Execute Freeze Protocol".

VERIFY (during processing):
- Close (X) button is NOT visible
- Progress bar is still present

Wait for success screen.

VERIFY (success):
- Close (X) button is NOT visible
- Subheader shows "Operation Complete"

Take a screenshot.
```

---

## COMMON UI – Close button navigates to /contact

```
Navigate to http://localhost:5173/security/freeze-all.
Click the close (X) button (top-right of the card).

VERIFY:
- Page navigates to /contact

Navigate to http://localhost:5173/security/lockdown.
Click the close (X) button.

VERIFY:
- Page navigates to /contact
```
