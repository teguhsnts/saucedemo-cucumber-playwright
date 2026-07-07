const { BasePage } = require('./basePage');

class NavBar extends BasePage {
  constructor(page) {
    super(page);

    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.getByText('Logout');
  }

  async logout() {
    await this.click(this.menuButton);
    await this.click(this.logoutLink);
  }
}

module.exports = { NavBar };