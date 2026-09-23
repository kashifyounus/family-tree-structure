const path = require("path");

module.exports = {
  preset: "jest-expo",
  setupFiles: ["./jest.setup.js"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  // Babel helpers for `../shared/*` resolve from the repo root, not this package.
  moduleNameMapper: {
    "^@babel/runtime/(.*)$": path.join(
      __dirname,
      "node_modules/@babel/runtime/$1",
    ),
  },
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-apps/.*|react-navigation|@react-navigation/.*|react-native-paper|react-native-vector-icons|@react-native-google-signin/.*)",
  ],
};
