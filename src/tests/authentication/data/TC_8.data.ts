export const TC8_Data = {
  testData: {
    url: "https://www.saucedemo.com/",
    username: "standard_user",
    password: "secret_sauce",
    expectedHeader: "Swag Labs",
    expectedPageHeader: "Products",
    expectedUrlContains: "/inventory.html"
  },
  expectedResult: {
    expectedResult1: "URL Check: Verify the URL contains /inventory.html.",
    expectedResult2: "Visibility: Verify the \"Products\" header is visible.",
    expectedResult3: "Visibility: Verify at least one inventory item is visible.",
    expectedResult4: "Header: Verify the \"Swag Labs\" header is visible (top-left)."
  }
};
