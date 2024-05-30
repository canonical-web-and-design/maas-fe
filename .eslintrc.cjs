const path = require("path");

module.exports = {
  root: true,
  plugins: ["unused-imports", "eslint-plugin-react-compiler", "prettier"],
  extends: [
    "react-app",
    "plugin:prettier/recommended",
    "plugin:storybook/recommended",
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: "module",
  },
  rules: {
    "react-compiler/react-compiler": "error",
    "prettier/prettier": "error",
  },
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      typescript: {
        alias: { "@": path.resolve(__dirname, "src") },
      },
    },
  },
  globals: {
    usabilla_live: false,
  },
  overrides: [
    {
      files: ["src/**/*.ts?(x)"],
      extends: [
        "prettier",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        "plugin:prettier/recommended", // Ensure this is last in the list.
      ],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 2018,
        sourceType: "module",
      },
      rules: {
        "prettier/prettier": "error",
        "@typescript-eslint/no-unused-vars": "off",
        "unused-imports/no-unused-imports": "error",
        "unused-imports/no-unused-vars": [
          "warn",
          {
            vars: "all",
            varsIgnorePattern: "^_",
            args: "after-used",
            ignoreRestSiblings: true,
            argsIgnorePattern: "^_",
          },
        ],
        "@typescript-eslint/consistent-type-imports": 2,
        "import/namespace": "off",
        "import/no-named-as-default": 0,
        "import/order": [
          "error",
          {
            pathGroups: [
              {
                pattern: "react",
                group: "external",
                position: "before",
              },
              {
                pattern: "~/app",
                group: "internal",
              },
            ],
            pathGroupsExcludedImportTypes: ["react"],
            "newlines-between": "always",
            alphabetize: {
              order: "asc",
            },
          },
        ],
        "no-console": "warn",
        "react/forbid-component-props": [
          "error",
          {
            forbid: [
              {
                propName: "data-test",
                message: "Use `data-testid` instead of `data-test` attribute",
              },
            ],
          },
        ],
        "react/forbid-dom-props": [
          "error",
          {
            forbid: [
              {
                propName: "data-test",
                message: "Use `data-testid` instead of `data-test` attribute",
              },
            ],
          },
        ],
        "react/jsx-sort-props": "error",
      },
      settings: {
        "import/resolver": {
          node: {
            paths: ["src"],
            extensions: [".js", ".jsx", ".ts", ".tsx"],
          },
        },
        react: {
          version: "detect",
        },
      },
    },
    {
      files: ["src/**/*.js?(x)"],
      rules: {
        "no-unused-vars": 2,
      },
    },
    {
      files: ["src/**/*.tsx"],
      rules: {
        "react/no-multi-comp": ["off"],
      },
    },
    {
      files: ["src/**/*.test.[jt]s?(x)"],
      extends: ["plugin:testing-library/react"],
      plugins: ["no-only-tests"],
      rules: {
        "no-only-tests/no-only-tests": "error",
        "testing-library/prefer-find-by": "off",
        "testing-library/prefer-explicit-assert": "error",
        "testing-library/prefer-user-event": [
          "error",
          {
            // Remove once sliders can be updated with user-event
            // https://github.com/testing-library/user-event/issues/871
            allowedMethods: ["change"],
          },
        ],
        "react/no-multi-comp": "off",
      },
    },
    {
      files: ["cypress/**/*.spec.[jt]s?(x)"],
      extends: ["plugin:cypress/recommended", "plugin:prettier/recommended"],
      plugins: ["cypress", "no-only-tests"],
      rules: {
        "no-only-tests/no-only-tests": "error",
        // vanilla framework often hides default inputs and displays styled ones instead
        // because of this we need to use use force option to allow interacting with hidden fields
        "cypress/no-force": "off",
        "prettier/prettier": "error",
      },
    },
    {
      files: ["tests/**/*.[jt]s?(x)"],
      extends: ["plugin:playwright/recommended"],
      rules: {
        // vanilla framework often hides default inputs and displays styled ones instead
        // because of this we need to use use force option to allow interacting with hidden fields
        "playwright/no-force-option": "off",
        "no-only-tests/no-only-tests": "error",
        "prettier/prettier": "error",
      },
    },
  ],
};
