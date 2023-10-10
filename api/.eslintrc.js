/** @type {import("eslint").Linter.Config} */
const config = {
    root: true,
    parser: "@typescript-eslint/parser",
    ignorePatterns: [
        "dist/",
        "node_modules/",
        "notes/"
    ],
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      tsconfigRootDir: __dirname,
      project: [
        "./tsconfig.json",
      ],
    },
    env: {
        "browser": true,
        "es2021": true
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    overrides: [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    plugins: [
        "@typescript-eslint"
    ],
    rules: {
    }
}

module.exports = config;
