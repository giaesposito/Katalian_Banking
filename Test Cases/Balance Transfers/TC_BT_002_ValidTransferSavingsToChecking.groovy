import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import com.kms.katalon.core.configuration.RunConfiguration
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

/**
 * TC_BT_002 - Valid Transfer: Savings to Checking
 *
 * Verifies that a logged-in user can successfully transfer funds
 * from their Savings account to their Checking account.
 *
 * Preconditions:
 *   - User 'bankinguser123' is logged in
 *   - Savings account (...1234) has sufficient balance
 *
 * Test Data:
 *   - Username: bankinguser123
 *   - Password: notapassword@123
 *   - Transfer amount: $1,000.00
 *   - From: Savings (...1234)
 *   - To: Checking (...7890)
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

// --- Step 3: Select From account (Savings ...1234) ---
WebUI.waitForElementVisible(findTestObject('Page_Transfer/select_FromAccount'), 10)
WebUI.selectOptionByValue(findTestObject('Page_Transfer/select_FromAccount'), 'acc1-2', false)

// --- Step 4: Verify To account auto-swaps to Checking ---
WebUI.verifyOptionSelectedByValue(findTestObject('Page_Transfer/select_ToAccount'), 'acc1-1', false)

// --- Step 5: Enter transfer amount ---
WebUI.clearText(findTestObject('Page_Transfer/input_Amount'))
WebUI.setText(findTestObject('Page_Transfer/input_Amount'), '1000.00')

// --- Step 6: Click Review Transfer ---
WebUI.click(findTestObject('Page_Transfer/button_ReviewTransfer'))

// --- Step 7: Verify confirmation screen details ---
WebUI.waitForElementVisible(findTestObject('Page_Transfer/heading_ConfirmTransfer'), 10)
WebUI.verifyTextPresent('Confirm Your Transfer', false)
WebUI.verifyTextPresent('Savings (...1234)', false)
WebUI.verifyTextPresent('Checking (...7890)', false)
WebUI.verifyTextPresent('$1,000.00', false)

// --- Step 8: Confirm the transfer ---
WebUI.click(findTestObject('Page_Transfer/button_ConfirmTransfer'))

// --- Step 9: Verify redirect to Dashboard ---
WebUI.waitForElementVisible(findTestObject('Page_Dashboard/heading_Dashboard'), 10)
WebUI.verifyCurrentUrl(RunConfiguration.getProjectDir() + '/dashboard')

// --- Teardown ---
WebUI.closeBrowser()
