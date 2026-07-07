class BasePage {
  constructor(page) {
    this.page = page;
  }

  async goto(url) {
    await this.page.goto(url);
  }

  async getTitle() {
    return this.page.title();
  }

  async getCurrentUrl() {
    return this.page.url();
  }

  async waitForVisible(locator, timeout = 10000) {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async click(locator) {
    await this.waitForVisible(locator);
    await locator.click();
  }

  async fill(locator, text) {
    await this.waitForVisible(locator);
    await locator.fill(text);
  }

  async getText(locator) {
    await this.waitForVisible(locator);
    return locator.textContent();
  }

  async isVisible(locator) {
    return locator.isVisible();
  }
}

module.exports = { BasePage };