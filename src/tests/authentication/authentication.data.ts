// Shared test data for SauceDemo authentication module

export const sauceDemoUrl = "https://www.saucedemo.com/";
export const lockedOutUser = {
  username: "locked_out_user",
  password: "secret_sauce",
};

export const standardUser = {
  username: "standard_user",
  password: "secret_sauce",
};

export const emptyUser = {
  username: "",
  password: "secret_sauce",
};

export const inventoryItems = [
  // Add inventory items here if needed
];

export const selectors = {
  usernameField: "#user-name",
  passwordField: "#password",
  loginButton: "#login-button",
  menuButton: "#react-burger-menu-btn",
  logoutLink: "#logout_sidebar_link",
  errorMessages: {
    lockedOut: "[data-test=\"error\"]",
    emptyUsername: "[data-test=\"error\"]",
    // Add other error messages here if needed
  },
};

export const expectedHeaders = {
  welcomeHeader: "Welcome Back",
  swagLabsHeader: "Swag Labs",
};

export const urls = {
  dashboard: "/dashboard",
  login: "/login",
  inventory: "/inventory.html",
};

export const expectedResults = {
  emptyUsername: {
    errorMessage: "Epic sadface: Username is required",
    navigation: "User remains on the login page",
  },
};
