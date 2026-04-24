import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Text from "./Text";

const meta = {
  title: "Atoms/Text",
  component: Text,
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: "select",
      options: ["h1", "h2", "h3", "body", "caption"],
    },
    as: { control: "text" },
  },
  args: {
    children: "The quick brown fox",
    variant: "body",
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Heading1: Story = {
  args: { variant: "h1", children: "Market Overview" },
};

export const Heading2: Story = {
  args: { variant: "h2", children: "Top Movers Today" },
};

export const Heading3: Story = {
  args: { variant: "h3", children: "Portfolio Summary" },
};

export const Body: Story = {
  args: {
    variant: "body",
    children:
      "Apple Inc. reported quarterly earnings that surpassed analyst expectations, driven by strong iPhone sales and continued growth in its services segment.",
  },
};

export const Caption: Story = {
  args: { variant: "caption", children: "Last updated 2 minutes ago" },
};

export const TypographyScale: Story = {
  render: () => (
    <div className="flex flex-col gap-4 text-white max-w-lg">
      <Text variant="h1">Heading 1</Text>
      <Text variant="h2">Heading 2</Text>
      <Text variant="h3">Heading 3</Text>
      <Text variant="body">Body — standard paragraph text used throughout the app for content.</Text>
      <Text variant="caption">Caption — secondary, de-emphasised metadata.</Text>
    </div>
  ),
  parameters: { controls: { disable: true } },
};
