import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import GlobalSearch from "./GlobalSearch";

const meta = {
  title: "Molecules/GlobalSearch",
  component: GlobalSearch,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Debounced search input with keyboard navigation. Fetches results from /api/search — requires a running Next.js server for live results.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof GlobalSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InHeader: Story = {
  decorators: [
    (Story) => (
      <div className="w-[480px] bg-slate-900 p-4 rounded-xl">
        <Story />
      </div>
    ),
  ],
};
