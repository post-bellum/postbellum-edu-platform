import { test } from '@playwright/test';
import { RegistrationModal } from '../../fixtures/registrationModal';

test.describe('Teacher Registration Flow', () => {
  test('should complete teacher registration with email confirmation', async ({ page }) => {
    const registrationModal = new RegistrationModal(page);

    // Given user is on landing page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // When user click on login-register button
    await registrationModal.clickLoginRegisterButton();

    // And user click on switch to register button
    await registrationModal.clickSwitchToRegisterButton();

    // Then registration modal window step 1 "Create account" is shown
    await registrationModal.expectCreateAccountStepIsVisible();

    // When user fill teacher email to email input
    const teacherEmail = process.env.TEST_EMAIL as string;
    await registrationModal.fillTeacherEmail(teacherEmail);

    // And user fill teacher password to password input
    const teacherPassword = process.env.TEST_PASSWORD as string;
    await registrationModal.fillTeacherPassword(teacherPassword);

    // And user fill same teacher password to confirm password input
    await registrationModal.fillConfirmPassword(teacherPassword);

    // And user click to button sign up
    await registrationModal.clickSignUpButton();

    // Then registration modal window step 2 "Confirm email" is shown
    await registrationModal.expectConfirmEmailStepIsVisible();

    // When user fill valid 6 digit confirmation code from email to code input
    const confirmationCode = process.env.TEST_CONFIRMATION_CODE as string;
    await registrationModal.fillConfirmationCode(confirmationCode);

    // And user click to button confirm
    await registrationModal.clickConfirmButton();

    // Then registration modal window step 3 "Role selection" is shown
    await registrationModal.expectRoleSelectionStepIsVisible();

    // When user select option "I am teacher"
    await registrationModal.selectTeacherOption();

    // And user fill valid school name to school input
    const schoolName = '	Gymnázium bezpečnostně právní, s.r.o. ';
    await registrationModal.fillSchoolName(schoolName);

    // And user click to checkbox with policy agreement
    await registrationModal.clickTermsCheckbox();

    // And user click to button continue
    await registrationModal.clickContinueButton();

    // Then registration modal window with registration success screen is shown
    await registrationModal.expectRegistrationSuccessScreenIsVisible();

    // And user can see profile button in menu
    await registrationModal.expectProfileButtonInMenuIsVisible();
    //await expect(page.getByTestId('register-success-message')).toBeVisible(); TODO: add assertion for success message need to be implemented first
  });
});

