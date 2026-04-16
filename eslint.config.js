import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      "no-unused-vars": "off",
    },
  },
  {
    files: ["src/features/**/components/**/*.jsx", "src/pages/**/*.jsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@shared/lib/axiosInstance", "@shared/lib/config"],
              message:
                "Components should not import axiosInstance or config directly. Use the domain service instead.",
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", ".vite-cache/**"],
  },
];
