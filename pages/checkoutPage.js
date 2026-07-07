const { BasePage } = require('./basePage');

class CheckoutPage extends BasePage {
  constructor(page) {
    super(page);

    // Step One - Informasi
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.postalCodeInput = page.getByPlaceholder('Zip/Postal Code');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.errorMessage = page.locator('[data-test="error"]');

    // Step Two - Overview
    this.finishButton = page.getByRole('button', { name: 'Finish' });
    this.totalLabel = page.locator('.summary_total_label');

    // Step Three - Complete
    this.completeHeader = page.locator('.complete-header');
  }

  async fillInformation(firstName, lastName, postalCode) {
    await this.fill(this.firstNameInput, firstName);
    await this.fill(this.lastNameInput, lastName);
    await this.fill(this.postalCodeInput, postalCode);
    await this.click(this.continueButton);
  }

  async finishOrder() {
    await this.click(this.finishButton);
  }

  async getTotalText() {
    return this.getText(this.totalLabel);
  }

  async getCompleteMessage() {
    return this.getText(this.completeHeader);
  }
}

module.exports = { CheckoutPage };