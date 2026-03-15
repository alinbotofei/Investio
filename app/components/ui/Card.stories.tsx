import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Card from "./Card";
import Text from "./Text";
import Badge from "./Badge";

const meta = {
  title: "UI/Card",
  component: Card,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    title: { control: "text" },
    elevated: { control: "boolean" },
  },
  args: {
    elevated: false,
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <Text variant="body" className="text-slate-300">
        Card body content goes here.
      </Text>
    ),
  },
};

export const WithTitle: Story = {
  args: {
    title: "Market Summary",
    children: (
      <Text variant="body" className="text-slate-300">
        S&P 500 is up 0.8% today on strong earnings reports from the tech sector.
      </Text>
    ),
  },
};

export const Elevated: Story = {
  args: {
    title: "Featured Stock",
    elevated: true,
    children: (
      <div className="flex items-center justify-between">
        <Text variant="h3" className="text-white">AAPL</Text>
        <Badge variant="positive">+2.4%</Badge>
      </div>
    ),
  },
};

export const StockCard: Story = {
  args: { elevated: true, children: null },
  render: () => (
    <Card elevated>
      <div className="flex items-start justify-between mb-3">
        <div>
          <Text variant="h3" className="text-white">NVDA</Text>
          <Text variant="caption">NVIDIA Corporation</Text>
        </div>
        <Badge variant="stock">Stock</Badge>
      </div>
      <Text variant="h2" className="text-cyan-300">$875.40</Text>
      <Badge variant="positive">+3.12%</Badge>
    </Card>
  ),
  parameters: { controls: { disable: true } },
};
