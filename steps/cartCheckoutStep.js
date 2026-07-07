const { When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { CartPage } = require('../pages/cartPage');
const { CheckoutPage } = require('../pages/checkoutPage');
const { NavBar } = require('../pages/navBar');

When('user adds {string} to the cart', async function (productName) {
  await this.productsPage.addProductToCart(productName);
});

When('user removes {string} from the cart', async function (productName) {
  await this.productsPage.removeProductFromCart(productName);
});

Then('the cart badge shows {string}', async function (expectedCount) {
  const count = await this.productsPage.getCartBadgeCount();
  expect(count.toString()).toBe(expectedCount);
});

When('user goes to the cart page', async function () {
  this.cartPage = new CartPage(this.page);
  await this.productsPage.goToCart();
});

When('user proceeds to checkout', async function () {
  this.checkoutPage = new CheckoutPage(this.page);
  await this.cartPage.checkout();
});

When('user fills checkout information {string} {string} {string}', async function (firstName, lastName, postalCode) {
  await this.checkoutPage.fillInformation(firstName, lastName, postalCode);
});

When('user finishes the order', async function () {
  await this.checkoutPage.finishOrder();
});

Then('the order completion message {string} is displayed', async function (expectedMessage) {
  const message = await this.checkoutPage.getCompleteMessage();
  expect(message).toBe(expectedMessage);
});

Then('a checkout error message {string} is displayed', async function (expectedMessage) {
  await expect(this.checkoutPage.errorMessage).toBeVisible();
  await expect(this.checkoutPage.errorMessage).toHaveText(expectedMessage);
});

When('user sorts products by {string}', async function (sortLabel) {
  const sortMap = {
    'Name (A to Z)': 'az',
    'Name (Z to A)': 'za',
    'Price (low to high)': 'lohi',
    'Price (high to low)': 'hilo'
  };
  await this.productsPage.sortBy(sortMap[sortLabel]);
});

Then('the products are sorted by price ascending', async function () {
  const prices = await this.productsPage.getAllPrices();
  const sortedPrices = [...prices].sort((a, b) => a - b);
  expect(prices).toEqual(sortedPrices);
});

When('user logs out', async function () {
  this.navBar = new NavBar(this.page);
  await this.navBar.logout();
});

Then('user is redirected to the login page', async function () {
  await expect(this.page).toHaveURL('https://www.saucedemo.com/');
});

Then('user should be able to finish the order without error', async function () {
  // error_user punya bug: tombol Finish kadang tidak berfungsi atau checkbox state salah
  // Kita verifikasi apakah proses checkout benar-benar bisa lanjut ke halaman overview
  await expect(this.checkoutPage.finishButton).toBeVisible();
  await expect(this.checkoutPage.finishButton).toBeEnabled();

  await this.checkoutPage.finishOrder();

  // Kalau bug muncul, halaman tidak akan pindah ke complete page
  await expect(this.page).toHaveURL(/checkout-complete/);
});