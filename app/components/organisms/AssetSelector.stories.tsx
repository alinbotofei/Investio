import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import AssetSelector from "./AssetSelector";
import { AssetCategory } from "@/lib/types/assets";

const meta = {
  title: "Organisms/AssetSelector",
  component: AssetSelector,
  parameters: { layout: "padded" },
} satisfies Meta<typeof AssetSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

const assets = [
  { symbol: "AAPL", name: "Apple Inc.", category: "stock" as AssetCategory },
  { symbol: "GOOGL", name: "Alphabet Inc.", category: "stock" as AssetCategory },
  { symbol: "MSFT", name: "Microsoft Corporation", category: "stock" as AssetCategory },
  { symbol: "TSLA", name: "Tesla Inc.", category: "stock" as AssetCategory },
  { symbol: "BTC", name: "Bitcoin", category: "crypto" as AssetCategory },
  { symbol: "ETH", name: "Ethereum", category: "crypto" as AssetCategory },
];

export const Default: Story = {
  args: { selectedSymbol: "AAPL", availableAssets: assets, onSelect: () => {} },
};

export const CryptoSelected: Story = {
  args: { selectedSymbol: "BTC", availableAssets: assets, onSelect: () => {} },
};

export const Empty: Story = {
  args: { selectedSymbol: "", availableAssets: [], onSelect: () => {} },
};
