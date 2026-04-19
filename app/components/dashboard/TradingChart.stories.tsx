import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import TradingChart from "./TradingChart";

const meta = {
  title: "Dashboard/TradingChart",
  component: TradingChart,
  parameters: { layout: "fullscreen" },
  args: { symbol: "AAPL", category: "stock", height: 400 },
  argTypes: {
    category: { control: "select", options: ["stock", "crypto"] },
    height: { control: { type: "number", min: 200, max: 800 } },
  },
} satisfies Meta<typeof TradingChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Stock: Story = {};

export const Crypto: Story = {
  args: { symbol: "BTC", category: "crypto" },
};

export const Tall: Story = {
  args: { symbol: "GOOGL", height: 600 },
};
