import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import com.kms.katalon.core.configuration.RunConfiguration
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

/**
 * TC_BT_005 - Invalid Amount: Negative Value
 *
 * Verifies that submitting a negative transfer amount is rejected
 * with a validation error.
 *
 * Preconditions:
 *   - User 'bankinguser123' is logged in
 *
 * Test Data:
 *   - Transfer amount: -100
 *
 * Expected Result:
 *   - Error message: 'Please enter a valid amount.'
 *   - Confirmation screen is not shown
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

// --- Step 4: Enter a negative amount ---
WebUI.clearText(findTestObject('Page_Transfer/input_Amount'))
WebUI.setText(findTestObject('Page_Transfer/input_Amount'), '-100')

// --- Step 5: Click Review Transfer ---
WebUI.click(findTestObject('Page_Transfer/button_ReviewTransfer'))

// --- Step 6: Verify validation error ---
WebUI.waitForElementVisible(findTestObject('Page_Transfer/text_ErrorMessage'), 10)
WebUI.verifyTextPresent('Please enter a valid amount.', false)
WebUI.verifyElementNotPresent(findTestObject('Page_Transfer/heading_ConfirmTransfer'), 3)

// --- Teardown ---
WebUI.closeBrowser()
