import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { Decorator } from "@storybook/nextjs-vite";
import AssetExplorer from "./AssetExplorer";
import { WatchlistProvider } from "@/app/contexts/WatchlistContext";

const withWatchlistProvider: Decorator = (Story) => (
  <WatchlistProvider>
    <Story />
  </WatchlistProvider>
);

const meta = {
  title: "Dashboard/AssetExplorer",
  component: AssetExplorer,
  parameters: { layout: "padded" },
  decorators: [withWatchlistProvider],
} satisfies Meta<typeof AssetExplorer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
