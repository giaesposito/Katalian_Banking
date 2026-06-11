import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import com.kms.katalon.core.configuration.RunConfiguration
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

/**
 * TC_BT_008 - Account Auto-Swap on Duplicate Selection
 *
 * Verifies that when a user selects the same account in both the From
 * and To dropdowns, the application automatically swaps the accounts
 * to prevent a same-account transfer.
 *
 * Preconditions:
 *   - User 'bankinguser123' is logged in (has both Checking and Savings accounts)
 *
 * Test Data:
 *   - Initial From: Checking (...7890) [acc1-1]
 *   - Initial To: Savings (...1234) [acc1-2]
 *   - Action: Change To → Checking (...7890) [acc1-1] (same as From)
 *
 * Expected Result:
 *   - From account auto-swaps to Savings (...1234)
 *   - To account is set to Checking (...7890)
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

// --- Step 3: Set initial selection (From=Checking, To=Savings) ---
WebUI.waitForElementVisible(findTestObject('Page_Transfer/select_FromAccount'), 10)
WebUI.selectOptionByValue(findTestObject('Page_Transfer/select_FromAccount'), 'acc1-1', false)
WebUI.selectOptionByValue(findTestObject('Page_Transfer/select_ToAccount'), 'acc1-2', false)

// --- Step 4: Change To account to same as From (Checking) ---
WebUI.selectOptionByValue(findTestObject('Page_Transfer/select_ToAccount'), 'acc1-1', false)

// --- Step 5: Verify From auto-swapped to Savings ---
WebUI.verifyOptionSelectedByValue(findTestObject('Page_Transfer/select_FromAccount'), 'acc1-2', false)

// --- Step 6: Verify To is now Checking ---
WebUI.verifyOptionSelectedByValue(findTestObject('Page_Transfer/select_ToAccount'), 'acc1-1', false)

// --- Teardown ---
WebUI.closeBrowser()
