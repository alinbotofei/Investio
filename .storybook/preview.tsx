import type { Preview } from "@storybook/react";
import { SessionProvider } from "next-auth/react";
import "../app/globals.css";

const preview: Preview = {
  decorators: [
    (Story) => (
      <SessionProvider session={null}>
        <Story />
      </SessionProvider>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "#0f172a" }],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
  },
};

export default preview;
