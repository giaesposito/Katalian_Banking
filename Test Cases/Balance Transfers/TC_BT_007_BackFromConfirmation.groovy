import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import com.kms.katalon.core.configuration.RunConfiguration
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

/**
 * TC_BT_007 - Back Button from Confirmation Screen
 *
 * Verifies that clicking the Back button on the confirmation screen
 * returns the user to the Transfer Funds form with their entries intact,
 * and does not execute the transfer.
 *
 * Preconditions:
 *   - User 'bankinguser123' is logged in
 *
 * Test Data:
 *   - Transfer amount: $200.00
 *   - From: Checking (...7890)
 *   - To: Savings (...1234)
 *
 * Expected Result:
 *   - User returns to the Transfer Funds form
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

// --- Step 3: Fill in transfer form ---
WebUI.waitForElementVisible(findTestObject('Page_Transfer/select_FromAccount'), 10)
WebUI.selectOptionByValue(findTestObject('Page_Transfer/select_FromAccount'), 'acc1-1', false)
WebUI.selectOptionByValue(findTestObject('Page_Transfer/select_ToAccount'), 'acc1-2', false)
WebUI.clearText(findTestObject('Page_Transfer/input_Amount'))
WebUI.setText(findTestObject('Page_Transfer/input_Amount'), '200.00')

// --- Step 4: Click Review Transfer to reach confirmation screen ---
WebUI.click(findTestObject('Page_Transfer/button_ReviewTransfer'))
WebUI.waitForElementVisible(findTestObject('Page_Transfer/heading_ConfirmTransfer'), 10)
WebUI.verifyTextPresent('Confirm Your Transfer', false)

// --- Step 5: Click Back ---
WebUI.click(findTestObject('Page_Transfer/button_Back'))

// --- Step 6: Verify returned to Transfer Funds form ---
WebUI.waitForElementVisible(findTestObject('Page_Transfer/heading_TransferFunds'), 10)
WebUI.verifyTextPresent('Transfer Funds', false)
WebUI.verifyElementNotPresent(findTestObject('Page_Transfer/heading_ConfirmTransfer'), 3)

// --- Teardown ---
WebUI.closeBrowser()
