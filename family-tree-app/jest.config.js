module.exports = {
  preset: "jest-expo",
  setupFiles: ["./jest.setup.js"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-apps/.*|react-navigation|@react-navigation/.*|react-native-paper|react-native-vector-icons|@react-native-google-signin/.*)",
  ],
};
