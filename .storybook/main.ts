import type { StorybookConfig } from "@storybook/nextjs-vite" with { "resolution-mode": "import" };

const config: StorybookConfig = {
  stories: [
    "../app/components/**/*.stories.tsx",
    "../app/components/**/*.stories.mdx",
  ],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@chromatic-com/storybook",
  ],
  framework: "@storybook/nextjs-vite",
  staticDirs: ["../public"],
};

export default config;