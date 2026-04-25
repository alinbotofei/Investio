import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Badge from "./Badge";

const meta = {
  title: "Atoms/Badge",
  component: Badge,
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: "select",
      options: ["stock", "crypto", "positive", "negative", "neutral"],
    },
  },
  args: {
    children: "AAPL",
    variant: "neutral",
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Stock: Story = {
  args: { variant: "stock", children: "AAPL" },
};

export const Crypto: Story = {
  args: { variant: "crypto", children: "BTC" },
};

export const Positive: Story = {
  args: { variant: "positive", children: "+2.4%" },
};

export const Negative: Story = {
  args: { variant: "negative", children: "-1.8%" },
};

export const Neutral: Story = {
  args: { variant: "neutral", children: "Pending" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="stock">AAPL</Badge>
      <Badge variant="crypto">BTC</Badge>
      <Badge variant="positive">+2.4%</Badge>
      <Badge variant="negative">-1.8%</Badge>
      <Badge variant="neutral">Pending</Badge>
    </div>
  ),
  parameters: { controls: { disable: true } },
};
