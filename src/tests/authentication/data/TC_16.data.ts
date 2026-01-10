export const TC16_Data = {
  testData: {
    url: "https://www.saucedemo.com/",
    username: "locked_out_user",
    password: "secret_sauce",
  },
  expectedResult: {
    expectedResult1: "Error: An error message is displayed indicating the user is locked out.",
    expectedResult2: "Navigation: User remains on the login page.",
    expectedResult3: "URL Check: URL does not contain /inventory.html.",
  },
};
