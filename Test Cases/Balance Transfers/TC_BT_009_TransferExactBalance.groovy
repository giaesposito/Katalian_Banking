import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import com.kms.katalon.core.configuration.RunConfiguration
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

/**
 * TC_BT_009 - Transfer Exact Account Balance (Boundary)
 *
 * Verifies that a user can transfer the full balance of the From account
 * (boundary value). The transfer should succeed and the confirmation screen
 * should display the exact amount.
 *
 * Preconditions:
 *   - User 'bankinguser123' is logged in
 *   - Checking account (...7890) has balance $5,345.54
 *
 * Test Data:
 *   - Transfer amount: $5,345.54 (exact Checking balance)
 *   - From: Checking (...7890)
 *   - To: Savings (...1234)
 *
 * Expected Result:
 *   - Confirmation screen shows $5,345.54
 *   - Transfer succeeds and user is redirected to Dashboard
 */

// --- Setup ---
WebUI.openBrowser('')
WebUI.navigateToUrl(RunConfiguration.getProjectDir() + '/index.html')

// --- Step 1: Log in ---
WebUI.waitForElementVisible(findTestObject('Page_Login/input_Username'), 10)
WebUI.setText(findTestObject('Page_Login/input_Username'), 'bankinguser123')
WebUI.setText(findTestObject('Page_Login/input_Password'), 'notapassword@123')
WebUI.click(findTestObject('Page_Login/button_SignIn'))

// --- Step 2: Navigate to Transfer page ---
WebUI.waitForElementVisible(findTestObject('Page_Dashboard/button_Transfer'), 10)
WebUI.click(findTestObject('Page_Dashboard/button_Transfer'))

// --- Step 3: Select accounts ---
WebUI.waitForElementVisible(findTestObject('Page_Transfer/select_FromAccount'), 10)
WebUI.selectOptionByValue(findTestObject('Page_Transfer/select_FromAccount'), 'acc1-1', false)
WebUI.selectOptionByValue(findTestObject('Page_Transfer/select_ToAccount'), 'acc1-2', false)

// --- Step 4: Enter exact Checking balance ---
WebUI.clearText(findTestObject('Page_Transfer/input_Amount'))
WebUI.setText(findTestObject('Page_Transfer/input_Amount'), '5345.54')

// --- Step 5: Click Review Transfer ---
WebUI.click(findTestObject('Page_Transfer/button_ReviewTransfer'))

// --- Step 6: Verify confirmation screen shows exact amount ---
WebUI.waitForElementVisible(findTestObject('Page_Transfer/heading_ConfirmTransfer'), 10)
WebUI.verifyTextPresent('Confirm Your Transfer', false)
WebUI.verifyTextPresent('$5,345.54', false)

// --- Step 7: Confirm the transfer ---
WebUI.click(findTestObject('Page_Transfer/button_ConfirmTransfer'))

// --- Step 8: Verify redirect to Dashboard ---
WebUI.waitForElementVisible(findTestObject('Page_Dashboard/heading_Dashboard'), 10)
WebUI.verifyCurrentUrl(RunConfiguration.getProjectDir() + '/dashboard')

// --- Teardown ---
WebUI.closeBrowser()
