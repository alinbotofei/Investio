
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ChatWidget from "./ChatWidget";

const meta = {
  title: "Organisms/ChatWidget",
  component: ChatWidget,
  parameters: { layout: "padded" },
  argTypes: {
    context: { control: "text" },
    placeholder: { control: "text" },
    compact: { control: "boolean" },
    navigateOnSend: { control: "boolean" },
  },
} satisfies Meta<typeof ChatWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { context: "AAPL" },
};

export const Compact: Story = {
  args: { context: "TSLA", compact: true },
};

export const CustomPlaceholder: Story = {
  args: { context: "BTC", placeholder: "Ask about Bitcoin..." },
};

export const NoNavigation: Story = {
  args: { context: "GOOGL", navigateOnSend: false },
};
