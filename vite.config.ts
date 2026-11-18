import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
  lint: {
    options: { typeAware: true, typeCheck: true },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  fmt: {
    printWidth: 100,
    ignorePatterns: ["**/*.md"],
  },
});
