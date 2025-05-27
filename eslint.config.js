import js from "@eslint/js";
import globals from "globals";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import pluginReact from "eslint-plugin-react";

export default [
  { 
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], 
    plugins: { js }, 
    linterOptions: { reportUnusedDisableDirectives: true } 
  },
  js.configs.recommended,
  { 
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], 
    languageOptions: { globals: {...globals.browser, ...globals.node} } 
  },
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": tseslint
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
      }
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "no-unused-vars": "warn"
    }
  },
  {
    files: ["**/*.{jsx,tsx}"],
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off", // Not needed with new JSX transform
      "react/jsx-uses-react": "off", // Not needed with new JSX transform
      "react/prop-types": "warn", // Downgrade to warning for CI/CD setup
      "no-irregular-whitespace": "warn", // Downgrade to warning for CI/CD setup
      "no-useless-catch": "warn" // Downgrade to warning for CI/CD setup
    },
  }
];
