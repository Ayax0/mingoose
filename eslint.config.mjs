import unjs from "eslint-config-unjs";

export default unjs({
  ignores: [
    // ignore paths
  ],
  rules: {
    // rule overrides
    "unicorn/prefer-top-level-await": "off",
    "unicorn/no-array-callback-reference": "off",
    "unicorn/no-array-method-this-argument": "off",
    "unicorn/filename-case": ["error", { case: "camelCase" }],
  },
  markdown: {
    rules: {
      // markdown rule overrides
    },
  },
});
