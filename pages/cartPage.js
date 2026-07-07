const { BasePage } = require('./basePage');

class CartPage extends BasePage {
  constructor(page) {
    super(page);

    this.cartItems = page.locator('.cart_item');
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    this.continueShoppingButton = page.getByRole('button', { name: 'Continue Shopping' });
  }

  async getItemCount() {
    return this.cartItems.count();
  }

  async isProductInCart(productName) {
    const item = this.page.locator('.cart_item', { hasText: productName });
    return item.isVisible();
  }

  async checkout() {
    await this.click(this.checkoutButton);
  }
}

module.exports = { CartPage };