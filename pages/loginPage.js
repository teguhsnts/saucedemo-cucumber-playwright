// const { BasePage } = require('./basePage');

// class LoginPage extends BasePage {
//   constructor(page) {
//     super(page);

//     this.usernameInput = page.getByPlaceholder('Username');
//     this.passwordInput = page.getByPlaceholder('Password');
//     this.loginButton = page.getByRole('button', { name: 'Login' });
//     this.errorMessage = page.locator('[data-test="error"]');
//   }

//   async goto() {
//     await super.goto('https://www.saucedemo.com');
//   }

//   async login(username, password) {
//     await this.fill(this.usernameInput, username);
//     await this.fill(this.passwordInput, password);
//     await this.click(this.loginButton);
//   }

//   async getErrorMessage() {
//     return this.getText(this.errorMessage);
//   }

//   async isErrorVisible() {
//     return this.isVisible(this.errorMessage);
//   }
// }

// module.exports = { LoginPage };

class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.locator('[data-test="error"]');
  }

  async goto() {
    const url = process.env.BASE_URL || 'https://www.saucedemo.com';
    await super.goto(url);
  }

  async login(username, password) {
    await this.fill(this.usernameInput, username);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
  }
}

module.exports = { LoginPage };