import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import com.kms.katalon.core.configuration.RunConfiguration
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

/**
 * TC_BT_006 - Cancel Transfer from Form
 *
 * Verifies that clicking the Cancel button on the Transfer Funds form
 * navigates the user back to the Dashboard without executing a transfer.
 *
 * Preconditions:
 *   - User 'bankinguser123' is logged in
 *
 * Expected Result:
 *   - User is redirected to the Dashboard
 *   - No transfer is executed
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

// --- Step 3: Verify Transfer page loads ---
WebUI.waitForElementVisible(findTestObject('Page_Transfer/heading_TransferFunds'), 10)
WebUI.verifyTextPresent('Transfer Funds', false)

// --- Step 4: Enter partial transfer details ---
WebUI.selectOptionByValue(findTestObject('Page_Transfer/select_FromAccount'), 'acc1-1', false)
WebUI.selectOptionByValue(findTestObject('Page_Transfer/select_ToAccount'), 'acc1-2', false)
WebUI.setText(findTestObject('Page_Transfer/input_Amount'), '250.00')

// --- Step 5: Click Cancel ---
WebUI.click(findTestObject('Page_Transfer/button_Cancel'))

// --- Step 6: Verify redirect to Dashboard ---
WebUI.waitForElementVisible(findTestObject('Page_Dashboard/heading_Dashboard'), 10)
WebUI.verifyCurrentUrl(RunConfiguration.getProjectDir() + '/dashboard')

// --- Teardown ---
WebUI.closeBrowser()
