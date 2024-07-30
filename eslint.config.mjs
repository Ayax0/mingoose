import unjs from "eslint-config-unjs";

export default unjs({
  ignores: [
    // ignore paths
  ],
  rules: {
    // rule overrides
    "unicorn/prefer-top-level-await": "off",
  },
  markdown: {
    rules: {
      // markdown rule overrides
    },
  },
});
