Feature: Login SauceDemo

  @TC-01-Login @positive @smoke
  Scenario: Login with valid credentials
    Given user opens the saucedemo login page
    When user logs in with username "standard_user" and password "secret_sauce"
    Then user successfully lands on the products page

  @TC-02-Login  @negative
  Scenario: Login with wrong password
    Given user opens the saucedemo login page
    When user logs in with username "standard_user" and password "wrong_password"
    Then an error message "Epic sadface: Username and password do not match any user in this service" is displayed

  @TC_03_Login @negative
  Scenario: Login with empty username
    Given user opens the saucedemo login page
    When user logs in with username "" and password "secret_sauce"
    Then an error message "Epic sadface: Username is required" is displayed

  @TC-04-Login @negative
  Scenario: Login with empty password
    Given user opens the saucedemo login page
    When user logs in with username "standard_user" and password ""
    Then an error message "Epic sadface: Password is required" is displayed

  @TC-05-Login @negative
  Scenario: Login with locked out user
    Given user opens the saucedemo login page
    When user logs in with username "locked_out_user" and password "secret_sauce"
    Then an error message "Epic sadface: Sorry, this user has been locked out." is displayed