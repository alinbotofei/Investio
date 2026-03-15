import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Input from "./Input";

const meta = {
  title: "UI/Input",
  component: Input,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    hint: { control: "text" },
    error: { control: "text" },
    disabled: { control: "boolean" },
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search"],
    },
  },
  args: {
    placeholder: "Enter a value…",
    type: "text",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: "Search stocks…" },
};

export const WithLabel: Story = {
  args: { label: "Email address", placeholder: "you@example.com", type: "email" },
};

export const WithHint: Story = {
  args: {
    label: "Portfolio name",
    placeholder: "My Tech Portfolio",
    hint: "Give your portfolio a memorable name.",
  },
};

export const WithError: Story = {
  args: {
    label: "Password",
    placeholder: "Minimum 8 characters",
    type: "password",
    error: "Password must be at least 8 characters.",
    defaultValue: "abc",
  },
};

export const Disabled: Story = {
  args: {
    label: "Read-only field",
    placeholder: "Unavailable",
    disabled: true,
  },
};
