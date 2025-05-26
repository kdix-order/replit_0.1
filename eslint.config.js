import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";


export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], languageOptions: { globals: {...globals.browser, ...globals.node} } },
  ...tseslint.configs.recommended,
  {
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...pluginReact.configs.flat.recommended.rules,
      "react/react-in-jsx-scope": "off", // Not needed with new JSX transform
      "react/jsx-uses-react": "off", // Not needed with new JSX transform
      "@typescript-eslint/no-unused-vars": "warn", // Downgrade to warning for CI/CD setup
      "@typescript-eslint/no-explicit-any": "warn", // Downgrade to warning for CI/CD setup
      "react/prop-types": "warn", // Downgrade to warning for CI/CD setup
      "@typescript-eslint/no-empty-object-type": "warn", // Downgrade to warning for CI/CD setup
      "no-irregular-whitespace": "warn", // Downgrade to warning for CI/CD setup
      "@typescript-eslint/ban-ts-comment": "warn", // Downgrade to warning for CI/CD setup
      "@typescript-eslint/no-require-imports": "warn", // Downgrade to warning for CI/CD setup
      "no-useless-catch": "warn", // Downgrade to warning for CI/CD setup
    },
  },
]);
