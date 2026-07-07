const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { LoginPage } = require('../pages/loginPage');
const { ProductsPage } = require('../pages/productsPage');

Given('user opens the saucedemo login page', async function () {
  this.loginPage = new LoginPage(this.page);
  await this.loginPage.goto();
});

When('user logs in with username {string} and password {string}', async function (username, password) {
  this.loginStartTime = Date.now();
  await this.loginPage.login(username, password);
  this.loginEndTime = Date.now();
  this.productsPage = new ProductsPage(this.page);
});

Then('user successfully lands on the products page', async function () {
  await expect(this.page).toHaveURL(/inventory\.html/);
  await expect(this.productsPage.pageTitle).toBeVisible();
  await expect(this.productsPage.pageTitle).toHaveText('Products');
});

Then('an error message {string} is displayed', async function (expectedMessage) {
  await expect(this.loginPage.errorMessage).toBeVisible();
  await expect(this.loginPage.errorMessage).toHaveText(expectedMessage);
});

Then('all product images should be unique', async function () {
  const srcList = await this.productsPage.getAllImageSources();
  const uniqueSrcList = new Set(srcList);
  expect(uniqueSrcList.size).toBe(srcList.length);
});

Then('the login process should complete within {int} seconds', async function (maxSeconds) {
  const durationMs = this.loginEndTime - this.loginStartTime;
  const durationSeconds = durationMs / 1000;

  console.log(`Login duration: ${durationSeconds.toFixed(2)}s`);
  expect(durationSeconds).toBeLessThanOrEqual(maxSeconds);
});

Then('all product images should have consistent size', async function () {
  const sizes = await this.productsPage.getAllImageSizes();
  const firstSize = sizes[0];

  const allSameSize = sizes.every(
    size => size.width === firstSize.width && size.height === firstSize.height
  );

  console.log('Ukuran gambar terdeteksi:', JSON.stringify(sizes));
  expect(allSameSize).toBe(true);
});