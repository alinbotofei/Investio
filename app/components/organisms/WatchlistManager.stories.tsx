import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { Decorator } from "@storybook/nextjs-vite";
import WatchlistManager from "./WatchlistManager";
import { WatchlistProvider } from "@/app/contexts/WatchlistContext";

const withWatchlistProvider: Decorator = (Story) => (
  <WatchlistProvider>
    <Story />
  </WatchlistProvider>
);

const meta = {
  title: "Organisms/WatchlistManager",
  component: WatchlistManager,
  parameters: { layout: "padded" },
  decorators: [withWatchlistProvider],
} satisfies Meta<typeof WatchlistManager>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
