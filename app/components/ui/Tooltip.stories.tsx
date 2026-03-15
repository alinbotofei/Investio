import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Tooltip from "./Tooltip";
import Button from "./Button";

const meta = {
  title: "UI/Tooltip",
  component: Tooltip,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="p-16">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    content: { control: "text" },
    placement: {
      control: "select",
      options: ["top", "bottom"],
    },
  },
  args: {
    content: "Tooltip content",
    placement: "top",
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Top: Story = {
  args: {
    content: "Add to watchlist",
    placement: "top",
    children: <Button variant="secondary">Hover me</Button>,
  },
};

export const Bottom: Story = {
  args: {
    content: "Opens in a new tab",
    placement: "bottom",
    children: <Button variant="ghost">Hover me</Button>,
  },
};

export const IconTrigger: Story = {
  args: {
    content: "More information",
    placement: "top",
    children: (
      <button className="text-slate-400 hover:text-white transition-colors p-1 rounded-md">
        <span className="material-symbols-rounded text-[18px]">info</span>
      </button>
    ),
  },
};
