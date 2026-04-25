import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import InsiderSentimentBadge, { InsiderSentimentData } from "./InsiderSentimentBadge";

const meta = {
  title: "Organisms/InsiderSentimentBadge",
  component: InsiderSentimentBadge,
  parameters: { layout: "padded" },
} satisfies Meta<typeof InsiderSentimentBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

const makeData = (mspr: number, change: number): InsiderSentimentData[] => [
  { symbol: "AAPL", year: 2025, month: 3, change, mspr },
  { symbol: "AAPL", year: 2025, month: 2, change: change * 0.9, mspr: mspr * 0.8 },
  { symbol: "AAPL", year: 2025, month: 1, change: change * 1.1, mspr: mspr * 1.2 },
];

export const Bullish: Story = {
  args: { data: makeData(0.25, 150000) },
};

export const Bearish: Story = {
  args: { data: makeData(-0.18, -95000) },
};

export const Neutral: Story = {
  args: { data: makeData(0, 2000) },
};

export const Loading: Story = {
  args: { data: [], loading: true },
};

export const Empty: Story = {
  args: { data: [] },
};
