import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module"
      }
    },
    plugins: {
      "@typescript-eslint": ts
    },
    rules: {
      ...ts.configs["recommended"].rules,
      ...ts.configs["recommended-requiring-type-checking"].rules,
      ...ts.configs["strict"].rules,
      ...ts.configs["stylistic"].rules,
      "quotes": ["error", "double"],
      "@typescript-eslint/no-explicit-any": "off",
      "eqeqeq": ["error"],
      "semi": [ "error", "always" ]
    }
  }
];
