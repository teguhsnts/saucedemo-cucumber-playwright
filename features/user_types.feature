Feature: Login dengan berbagai jenis user SauceDemo

  @TC12 @positive
  Scenario Outline: Login dengan user yang bisa berhasil masuk
    Given user opens the saucedemo login page
    When user logs in with username "<username>" and password "secret_sauce"
    Then user successfully lands on the products page

    Examples:
      | username                 |
      | standard_user            |
      | problem_user             |
      | performance_glitch_user  |
      | error_user               |
      | visual_user              |

  @TC13 @negative
  Scenario: Login gagal dengan user yang di-lock
    Given user opens the saucedemo login page
    When user logs in with username "locked_out_user" and password "secret_sauce"
    Then an error message "Epic sadface: Sorry, this user has been locked out." is displayed

  @TC14 @bug
  Scenario: Mendeteksi bug gambar produk pada problem_user
    Given user opens the saucedemo login page
    When user logs in with username "problem_user" and password "secret_sauce"
    Then all product images should be unique

  @TC15 @bug
  Scenario: Mendeteksi bug checkout gagal pada error_user
    Given user opens the saucedemo login page
    When user logs in with username "error_user" and password "secret_sauce"
    And user adds "Sauce Labs Backpack" to the cart
    And user goes to the cart page
    And user proceeds to checkout
    And user fills checkout information "John" "Doe" "12345"
    Then user should be able to finish the order without error

  @TC16 @bug
  Scenario: Mendeteksi bug sorting tidak berfungsi pada problem_user
    Given user opens the saucedemo login page
    When user logs in with username "problem_user" and password "secret_sauce"
    And user sorts products by "Price (low to high)"
    Then the products are sorted by price ascending

@TC17 @bug
  Scenario: Mendeteksi bug loading lambat pada performance_glitch_user
    Given user opens the saucedemo login page
    When user logs in with username "performance_glitch_user" and password "secret_sauce"
    Then the login process should complete within 5 seconds

  @TC18 @bug
  Scenario: Mendeteksi bug tampilan visual pada visual_user
    Given user opens the saucedemo login page
    When user logs in with username "visual_user" and password "secret_sauce"
    Then all product images should have consistent size