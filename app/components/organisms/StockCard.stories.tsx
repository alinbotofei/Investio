import { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { Decorator } from "@storybook/nextjs-vite";
import StockCard from "./StockCard";

const meta = {
  title: "Organisms/StockCard",
  component: StockCard,
  parameters: { layout: "padded" },
  args: { symbol: "AAPL" },
} satisfies Meta<typeof StockCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockStock = {
  symbol: "AAPL",
  name: "Apple Inc.",
  price: 189.3,
  change: 2.15,
  changePercent: 1.15,
  high: 191.05,
  low: 186.8,
  open: 187.4,
  previousClose: 187.15,
};

const withFetch = (impl: () => Promise<Response>): Decorator =>
  function WithFetch(Story) {
    useEffect(() => {
      const orig = globalThis.fetch;
      globalThis.fetch = impl;
      return () => { globalThis.fetch = orig; };
    }, []);
    return <Story />;
  };

export const Loading: Story = {
  decorators: [
    withFetch(() => new Promise(() => {})),
  ],
};

export const LoadedPositive: Story = {
  decorators: [
    withFetch(() =>
      Promise.resolve(new Response(JSON.stringify(mockStock), { status: 200 }))
    ),
  ],
};

export const LoadedNegative: Story = {
  args: { symbol: "META" },
  decorators: [
    withFetch(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({ ...mockStock, symbol: "META", name: "Meta Platforms Inc.", price: 472.1, change: -8.4, changePercent: -1.75, high: 481.5, low: 469.2 }),
          { status: 200 }
        )
      )
    ),
  ],
};

export const Error: Story = {
  decorators: [
    withFetch(() => Promise.resolve(new Response(null, { status: 500 }))),
  ],
};
