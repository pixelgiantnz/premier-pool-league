/** @type {import('eslint').Linter.Config} */
const eslintConfig = [
  {
    ignores: ["convex/_generated/**", ".next/**", "node_modules/**"],
  },
];

export default eslintConfig;
