const { BasePage } = require('./basePage');

class ProductsPage extends BasePage {
  constructor(page) {
    super(page);

    this.pageTitle = page.getByText('Products', { exact: true });
    this.cartIcon = page.locator('.shopping_cart_link');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.inventoryItems = page.locator('.inventory_item');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.itemPrices = page.locator('.inventory_item_price');
    this.itemNames = page.locator('.inventory_item_name');
    this.itemImages = page.locator('.inventory_item_img img');
  }

  async isLoaded() {
    return this.isVisible(this.pageTitle);
  }

  async addProductToCart(productName) {
    const safeName = productName.toLowerCase().replace(/\s+/g, '-');
    const addButton = this.page.locator(`[data-test="add-to-cart-${safeName}"]`);
    await this.click(addButton);
  }

  async removeProductFromCart(productName) {
    const safeName = productName.toLowerCase().replace(/\s+/g, '-');
    const removeButton = this.page.locator(`[data-test="remove-${safeName}"]`);
    await this.click(removeButton);
  }

  async getCartBadgeCount() {
    const isVisible = await this.isVisible(this.cartBadge);
    if (!isVisible) return 0;
    const text = await this.getText(this.cartBadge);
    return parseInt(text, 10);
  }

  async goToCart() {
    await this.click(this.cartIcon);
  }

  async sortBy(optionValue) {
    await this.sortDropdown.selectOption(optionValue);
  }

  async getAllPrices() {
    const prices = await this.itemPrices.allTextContents();
    return prices.map(p => parseFloat(p.replace('$', '')));
  }

  async getAllProductNames() {
    return this.itemNames.allTextContents();
  }

  async getAllImageSources() {
    const count = await this.itemImages.count();
    const sources = [];
    for (let i = 0; i < count; i++) {
      sources.push(await this.itemImages.nth(i).getAttribute('src'));
    }
    return sources;
  }

  async getAllImageSizes() {
    const count = await this.itemImages.count();
    const sizes = [];
    for (let i = 0; i < count; i++) {
      const box = await this.itemImages.nth(i).boundingBox();
      sizes.push({ width: Math.round(box.width), height: Math.round(box.height) });
    }
    return sizes;
  }
}

module.exports = { ProductsPage };