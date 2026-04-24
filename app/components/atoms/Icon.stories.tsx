import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Icon from "./Icon";

const meta = {
  title: "Atoms/Icon",
  component: Icon,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    name: { control: "text" },
    className: { control: "text" },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { name: "home" },
};

export const Sizes: Story = {
  args: { name: "star" },
  render: () => (
    <div className="flex items-center gap-4">
      <Icon name="star" className="text-[16px] text-slate-300" />
      <Icon name="star" className="text-[24px] text-slate-300" />
      <Icon name="star" className="text-[32px] text-slate-300" />
      <Icon name="star" className="text-[48px] text-slate-300" />
    </div>
  ),
};

export const CommonIcons: Story = {
  args: { name: "home" },
  render: () => (
    <div className="flex flex-wrap gap-4 p-4">
      {["home", "search", "add", "close", "arrow_back", "settings", "person", "notifications", "trending_up", "trending_down"].map(
        (name) => (
          <div key={name} className="flex flex-col items-center gap-1">
            <Icon name={name} className="text-[24px] text-slate-200" />
            <span className="text-[10px] text-slate-500">{name}</span>
          </div>
        )
      )}
    </div>
  ),
};
