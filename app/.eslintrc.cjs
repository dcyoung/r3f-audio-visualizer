/** @type {import("eslint").Linter.Config} */
const config = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  ignorePatterns: [
    "**/.eslintrc.cjs",
    "**/*.config.js",
    "**/*.config.cjs",
    "dist",
    "pnpm-lock.yaml",
    "vite.config.ts",
  ],
  plugins: ["@typescript-eslint", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
  ],
  rules: {
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      { prefer: "type-imports", fixStyle: "separate-type-imports" },
    ],
    "@typescript-eslint/no-misused-promises": [
      2,
      { checksVoidReturn: { attributes: false } },
    ],
    "import/consistent-type-specifier-style": ["error", "prefer-inline"],
    "react/prop-types": "off",
    "jsx-a11y/click-events-have-key-events": "off",
    "jsx-a11y/no-static-element-interactions": "off",
    "jsx-a11y/heading-has-content": "off",
    "react/no-unknown-property": "off",
    "react/display-name": "off",
  },
  globals: {
    React: "writable",
  },
  settings: {
    "import/resolver": {
      typescript: {},
      alias: {
        map: [["@", "./src"]],
      },
    },
    react: {
      version: "detect",
    },
  },
  env: {
    browser: true,
  },
};

module.exports = config;
