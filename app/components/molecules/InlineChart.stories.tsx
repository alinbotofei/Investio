import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import InlineChart from "./InlineChart";

const meta = {
  title: "Molecules/InlineChart",
  component: InlineChart,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof InlineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BarChart: Story = {
  args: {
    raw: JSON.stringify({
      type: "bar",
      title: "Analyst Price Targets",
      items: [
        { label: "Goldman", value: 210 },
        { label: "Morgan", value: 195 },
        { label: "JPMorgan", value: 220 },
        { label: "Citi", value: 185 },
      ],
    }),
  },
};

export const SparklinePositive: Story = {
  args: {
    raw: JSON.stringify({
      type: "sparkline",
      title: "AAPL — 7-day trend",
      sparkline: {
        values: [171, 173, 170, 175, 179, 182, 185],
      },
    }),
  },
};

export const SparklineNegative: Story = {
  args: {
    raw: JSON.stringify({
      type: "sparkline",
      title: "TSLA — 7-day trend",
      sparkline: {
        values: [260, 255, 248, 245, 240, 238, 232],
      },
    }),
  },
};

export const DonutChart: Story = {
  args: {
    raw: JSON.stringify({
      type: "donut",
      title: "Portfolio Allocation",
      items: [
        { label: "Equities", value: 55 },
        { label: "Crypto", value: 20 },
        { label: "ETFs", value: 15 },
        { label: "Cash", value: 10 },
      ],
    }),
  },
};

export const ComparisonChart: Story = {
  args: {
    raw: JSON.stringify({
      type: "comparison",
      title: "YTD Performance",
      items: [
        { label: "AAPL", value: 185, change: 12.4 },
        { label: "MSFT", value: 420, change: 8.7 },
        { label: "NVDA", value: 875, change: 45.2 },
        { label: "TSLA", value: 240, change: -18.3 },
      ],
    }),
  },
};

export const InvalidJson: Story = {
  name: "Invalid JSON → skeleton",
  args: {
    raw: "not valid json at all",
  },
};

export const InvalidType: Story = {
  name: "Unknown chart type → skeleton",
  args: {
    raw: JSON.stringify({ type: "unknown", items: [] }),
  },
};
