import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import TickerCard from "../../dashboard/_components/TickerCard";

const meta = {
  title: "Organisms/TickerCard",
  component: TickerCard,
  parameters: { layout: "padded" },
  args: {
    onAddToWatchlist: () => {},
    inWatchlist: false,
  },
} satisfies Meta<typeof TickerCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StockPositive: Story = {
  args: {
    quote: { symbol: "AAPL", price: 189.3, change: 2.15, changePercent: 1.15 },
    category: "stock",
  },
};

export const StockNegative: Story = {
  args: {
    quote: { symbol: "META", price: 472.1, change: -8.4, changePercent: -1.75 },
    category: "stock",
  },
};

export const CryptoPositive: Story = {
  args: {
    quote: { symbol: "BTCUSDT", price: 67450.0, change: 1230.5, changePercent: 1.86 },
    category: "crypto",
  },
};

export const CryptoNegative: Story = {
  args: {
    quote: { symbol: "ETHUSDT", price: 3210.5, change: -95.2, changePercent: -2.88 },
    category: "crypto",
  },
};

export const InWatchlist: Story = {
  args: {
    quote: { symbol: "TSLA", price: 248.0, change: 5.6, changePercent: 2.31 },
    category: "stock",
    inWatchlist: true,
  },
};
