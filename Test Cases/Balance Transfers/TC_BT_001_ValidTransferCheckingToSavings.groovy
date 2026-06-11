import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import static com.kms.katalon.core.keyword.builtin.WebUIKeywords.*

import com.kms.katalon.core.annotation.SetUp
import com.kms.katalon.core.annotation.TearDown
import com.kms.katalon.core.configuration.RunConfiguration
import com.kms.katalon.core.model.FailureHandling
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI

/**
 * TC_BT_001 - Valid Transfer: Checking to Savings
 *
 * Verifies that a logged-in user can successfully transfer funds
 * from their Checking account to their Savings account.
 *
 * Preconditions:
 *   - User 'bankinguser123' is logged in
 *   - Checking account (...7890) has balance $5,345.54
 *   - Savings account (...1234) has balance $104,456.67
 *
 * Test Data:
 *   - Username: bankinguser123
 *   - Password: notapassword@123
 *   - Transfer amount: $500.00
 *   - From: Checking (...7890)
 *   - To: Savings (...1234)
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

// --- Step 4: Select From account (Checking ...7890) ---
WebUI.waitForElementVisible(findTestObject('Page_Transfer/select_FromAccount'), 10)
WebUI.selectOptionByValue(findTestObject('Page_Transfer/select_FromAccount'), 'acc1-1', false)

// --- Step 5: Select To account (Savings ...1234) ---
WebUI.waitForElementVisible(findTestObject('Page_Transfer/select_ToAccount'), 10)
WebUI.selectOptionByValue(findTestObject('Page_Transfer/select_ToAccount'), 'acc1-2', false)

// --- Step 6: Enter transfer amount ---
WebUI.waitForElementVisible(findTestObject('Page_Transfer/input_Amount'), 10)
WebUI.clearText(findTestObject('Page_Transfer/input_Amount'))
WebUI.setText(findTestObject('Page_Transfer/input_Amount'), '500.00')

// --- Step 7: Click Review Transfer ---
WebUI.click(findTestObject('Page_Transfer/button_ReviewTransfer'))

// --- Step 8: Verify confirmation screen ---
WebUI.waitForElementVisible(findTestObject('Page_Transfer/heading_ConfirmTransfer'), 10)
WebUI.verifyTextPresent('Confirm Your Transfer', false)
WebUI.verifyTextPresent('Checking (...7890)', false)
WebUI.verifyTextPresent('Savings (...1234)', false)
WebUI.verifyTextPresent('$500.00', false)

// --- Step 9: Confirm the transfer ---
WebUI.click(findTestObject('Page_Transfer/button_ConfirmTransfer'))

// --- Step 10: Verify redirect to Dashboard ---
WebUI.waitForElementVisible(findTestObject('Page_Dashboard/heading_Dashboard'), 10)
WebUI.verifyCurrentUrl(RunConfiguration.getProjectDir() + '/dashboard')

// --- Teardown ---
WebUI.closeBrowser()
