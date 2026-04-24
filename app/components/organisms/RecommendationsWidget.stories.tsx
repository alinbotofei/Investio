import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import RecommendationsWidget from "./RecommendationsWidget";

const meta = {
  title: "Organisms/RecommendationsWidget",
  component: RecommendationsWidget,
  parameters: { layout: "padded" },
  args: { loading: false },
} satisfies Meta<typeof RecommendationsWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

const strongBuyData = [
  { period: "2024-03-01", strongBuy: 18, buy: 10, hold: 4, sell: 1, strongSell: 0 },
];

const mixedData = [
  { period: "2024-03-01", strongBuy: 5, buy: 8, hold: 12, sell: 5, strongSell: 2 },
];

const sellData = [
  { period: "2024-03-01", strongBuy: 1, buy: 2, hold: 6, sell: 10, strongSell: 8 },
];

export const Loading: Story = {
  args: { data: [], loading: true },
};

export const Empty: Story = {
  args: { data: [] },
};

export const StrongBuy: Story = {
  args: { data: strongBuyData },
};

export const Mixed: Story = {
  args: { data: mixedData },
};

export const Sell: Story = {
  args: { data: sellData },
};
