import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: ["public/docs/**"],
  },
  {
    rules: {
      // Relax rules for existing codebase patterns
      "react/no-unescaped-entities": "warn",
      "@next/next/no-img-element": "off",
      // React 19 rules - downgrade to warnings until codebase is updated
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
    },
  },
];

export default eslintConfig;
