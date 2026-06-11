import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import com.kms.katalon.core.configuration.RunConfiguration
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

/**
 * TC_BT_003 - Insufficient Funds Error
 *
 * Verifies that the application displays an error when the user attempts
 * to transfer more than the available balance in the From account.
 *
 * Preconditions:
 *   - User 'bankinguser123' is logged in
 *   - Checking account (...7890) has balance $5,345.54
 *
 * Test Data:
 *   - Username: bankinguser123
 *   - Password: notapassword@123
 *   - Transfer amount: $9,999.99 (exceeds Checking balance)
 *   - From: Checking (...7890)
 *   - To: Savings (...1234)
 *
 * Expected Result:
 *   - Error message: 'Insufficient funds for this transfer.'
 *   - User remains on the Transfer Funds form (no confirmation screen)
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

// --- Step 3: Select From account (Checking ...7890) ---
WebUI.waitForElementVisible(findTestObject('Page_Transfer/select_FromAccount'), 10)
WebUI.selectOptionByValue(findTestObject('Page_Transfer/select_FromAccount'), 'acc1-1', false)

// --- Step 4: Select To account (Savings ...1234) ---
WebUI.selectOptionByValue(findTestObject('Page_Transfer/select_ToAccount'), 'acc1-2', false)

// --- Step 5: Enter amount exceeding Checking balance ---
WebUI.clearText(findTestObject('Page_Transfer/input_Amount'))
WebUI.setText(findTestObject('Page_Transfer/input_Amount'), '9999.99')

// --- Step 6: Click Review Transfer ---
WebUI.click(findTestObject('Page_Transfer/button_ReviewTransfer'))

// --- Step 7: Verify error message is displayed ---
WebUI.waitForElementVisible(findTestObject('Page_Transfer/text_ErrorMessage'), 10)
WebUI.verifyTextPresent('Insufficient funds for this transfer.', false)

// --- Step 8: Verify still on Transfer Funds form (not confirmation) ---
WebUI.verifyElementNotPresent(findTestObject('Page_Transfer/heading_ConfirmTransfer'), 3)
WebUI.verifyTextPresent('Transfer Funds', false)

// --- Teardown ---
WebUI.closeBrowser()
