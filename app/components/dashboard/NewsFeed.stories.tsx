import { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { Decorator } from "@storybook/nextjs-vite";
import NewsFeed from "./NewsFeed";

const meta = {
  title: "Dashboard/NewsFeed",
  component: NewsFeed,
  parameters: { layout: "padded" },
} satisfies Meta<typeof NewsFeed>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockNews = [
  {
    id: 1,
    headline: "Fed Signals Pause in Rate Hikes as Inflation Cools",
    summary: "Federal Reserve officials indicated they may hold rates steady at their next meeting as recent data shows inflation continuing to moderate.",
    url: "#",
    datetime: Math.floor(Date.now() / 1000) - 3600,
    source: "Reuters",
  },
  {
    id: 2,
    headline: "Apple Reports Record Q1 Earnings, Beats Revenue Estimates",
    summary: "Apple Inc. posted better-than-expected quarterly results driven by strong services growth and resilient iPhone demand in key markets.",
    url: "#",
    datetime: Math.floor(Date.now() / 1000) - 7200,
    source: "Bloomberg",
  },
  {
    id: 3,
    headline: "S&P 500 Closes at All-Time High Amid Tech Rally",
    summary: "The S&P 500 index reached a new all-time high as technology stocks surged following a series of strong earnings reports.",
    url: "#",
    datetime: Math.floor(Date.now() / 1000) - 14400,
    source: "CNBC",
  },
];

const withFetch = (impl: () => Promise<Response>): Decorator =>
  (Story) => {
    const orig = global.fetch;
    global.fetch = impl;
    useEffect(() => () => { global.fetch = orig; }, []);
    return <Story />;
  };

export const Loading: Story = {
  decorators: [withFetch(() => new Promise(() => {}))],
};

export const WithNews: Story = {
  decorators: [
    withFetch(() =>
      Promise.resolve(new Response(JSON.stringify(mockNews), { status: 200 }))
    ),
  ],
};

export const StockNews: Story = {
  args: { symbol: "AAPL" },
  decorators: [
    withFetch(() =>
      Promise.resolve(new Response(JSON.stringify(mockNews.slice(0, 2)), { status: 200 }))
    ),
  ],
};

export const Empty: Story = {
  decorators: [
    withFetch(() =>
      Promise.resolve(new Response(JSON.stringify([]), { status: 200 }))
    ),
  ],
};

export const FetchError: Story = {
  decorators: [
    withFetch(() => Promise.resolve(new Response(null, { status: 500 }))),
  ],
};
