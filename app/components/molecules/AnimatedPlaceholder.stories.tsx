import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import AnimatedPlaceholder from "./AnimatedPlaceholder";

const meta = {
  title: "Molecules/AnimatedPlaceholder",
  component: AnimatedPlaceholder,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof AnimatedPlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

const PLACEHOLDERS = [
  "Search for AAPL...",
  "Ask about market trends...",
  "Try TSLA or BTC/USD...",
];

export const Default: Story = {
  args: {
    placeholders: PLACEHOLDERS,
  },
};

export const FastTyping: Story = {
  args: {
    placeholders: PLACEHOLDERS,
    typingSpeed: 20,
    deletingSpeed: 10,
    pauseAfterTyping: 1000,
  },
};

export const SlowTyping: Story = {
  args: {
    placeholders: PLACEHOLDERS,
    typingSpeed: 100,
    deletingSpeed: 50,
    pauseAfterTyping: 3000,
  },
};

export const SinglePhrase: Story = {
  args: {
    placeholders: ["This message types and loops forever..."],
  },
};
