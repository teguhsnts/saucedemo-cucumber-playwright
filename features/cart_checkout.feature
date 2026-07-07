Feature: Cart and Checkout SauceDemo

  Background:
    Given user opens the saucedemo login page
    When user logs in with username "standard_user" and password "secret_sauce"

  @TC06 @positive
  Scenario: Menambahkan produk ke cart
    When user adds "Sauce Labs Backpack" to the cart
    Then the cart badge shows "1"

  @TC07 @positive
  Scenario: Menghapus produk dari cart
    When user adds "Sauce Labs Backpack" to the cart
    And user removes "Sauce Labs Backpack" from the cart
    Then the cart badge shows "0"

  @TC08 @positive
  Scenario: Checkout dengan data valid sampai selesai
    When user adds "Sauce Labs Backpack" to the cart
    And user goes to the cart page
    And user proceeds to checkout
    And user fills checkout information "John" "Doe" "12345"
    And user finishes the order
    Then the order completion message "Thank you for your order!" is displayed

  @TC09 @negative
  Scenario: Checkout gagal karena first name kosong
    When user adds "Sauce Labs Backpack" to the cart
    And user goes to the cart page
    And user proceeds to checkout
    And user fills checkout information "" "Doe" "12345"
    Then a checkout error message "Error: First Name is required" is displayed

  @TC10 @positive
  Scenario: Mengurutkan produk dari harga rendah ke tinggi
    When user sorts products by "Price (low to high)"
    Then the products are sorted by price ascending

  @TC11 @positive
  Scenario: Logout dari aplikasi
    When user logs out
    Then user is redirected to the login page