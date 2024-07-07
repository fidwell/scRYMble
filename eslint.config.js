import stylisticJs from "@stylistic/eslint-plugin-js";
import stylisticTs from "@stylistic/eslint-plugin-ts";
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
      "@typescript-eslint": ts,
      "@stylistic/js": stylisticJs,
      "@stylistic/ts": stylisticTs
    },
    rules: {
      ...ts.configs["recommended"].rules,
      ...ts.configs["recommended-requiring-type-checking"].rules,
      ...ts.configs["strict"].rules,
      ...ts.configs["stylistic"].rules,
      "quotes": ["error", "double"],
      "@typescript-eslint/no-explicit-any": "off",
      "eqeqeq": ["error"],
      "@stylistic/ts/semi": ["error", "always"],
      "@stylistic/ts/brace-style": ["error"],
      "@stylistic/ts/no-extra-parens": ["error"],
      "@stylistic/ts/indent": ["error", 2],
      "@stylistic/js/no-trailing-spaces": ["error"]
    }
  }
];
