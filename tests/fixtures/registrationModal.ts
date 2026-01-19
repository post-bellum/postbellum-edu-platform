import { Page, expect } from '@playwright/test';

export class RegistrationModal {
  constructor(private page: Page) {}

  // Landing page actions
  async clickLoginRegisterButton(): Promise<void> {
    await this.page.getByTestId('login-register-button').click();
  }

  async clickSwitchToRegisterButton(): Promise<void> {
    await this.page.getByTestId('switch-to-register-button').click();
  }

  // Step 1: Create account
  async expectCreateAccountStepIsVisible(): Promise<void> {
    await expect(this.page.getByTestId('register-submit-button')).toBeVisible();
  }

  async fillTeacherEmail(email: string): Promise<void> {
    await this.page.getByTestId('register-email-input').fill(email);
  }

  async fillTeacherPassword(password: string): Promise<void> {
    await this.page.getByTestId('register-password-input').fill(password);
  }

  async fillConfirmPassword(password: string): Promise<void> {
    await this.page.getByTestId('register-confirm-password-input').fill(password);
  }

  async clickPolicyAgreementCheckbox(): Promise<void> {
    // Policy checkbox might not exist in step 1, so check if it exists first
    const checkbox = this.page.getByTestId('register-policy-checkbox');
    const count = await checkbox.count();
    if (count > 0) {
      await checkbox.check();
    }
  }

  async clickSignUpButton(): Promise<void> {
    await this.page.getByTestId('register-submit-button').click();
  }

  // Step 2: Confirm email
  async expectConfirmEmailStepIsVisible(): Promise<void> {
    await expect(this.page.getByTestId('otp-verify-button')).toBeVisible();
  }

  async fillConfirmationCode(code: string): Promise<void> {
    // Fill each OTP input field with corresponding digit
    for (let i = 0; i < 6; i++) {
      await this.page.getByTestId('otp-input').nth(i).fill(code[i]);
    }
  }

  async clickConfirmButton(): Promise<void> {
    await this.page.getByTestId('otp-verify-button').click();
  }

  // Step 3: Role selection
  async expectRoleSelectionStepIsVisible(): Promise<void> {
    await expect(this.page.getByTestId('teacher-radio-option')).toBeVisible();
  }

  async selectTeacherOption(): Promise<void> {
    await this.page.getByTestId('teacher-radio-option').click();
  }

  async fillSchoolName(schoolName: string): Promise<void> {
    await this.page.locator('#school-name').fill(schoolName);
  }

  async clickTermsCheckbox(): Promise<void> {
    await this.page.getByTestId('terms-checkbox').check();
  }

  async clickContinueButton(): Promise<void> {
    await this.page.getByTestId('complete-registration-submit-button').click();
  }

  // Success screen
  async expectRegistrationSuccessScreenIsVisible(): Promise<void> {
    await expect(this.page.getByTestId('edit-profile-button')).toBeVisible();
  }

  async expectProfileButtonInMenuIsVisible(): Promise<void> {
    await expect(this.page.locator('img[alt="Profile"]').first()).toBeVisible();
  }

  async expectLogoutButtonIsVisible(): Promise<void> {
    await expect(this.page.getByTestId('nav-logout-button')).toBeVisible();
  }
}

