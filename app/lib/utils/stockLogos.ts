const STOCK_GRADIENTS: Record<
  string,
  { from: string; to: string; text: string }
> = {
  AAPL: { from: "#000000", to: "#434343", text: "#FFFFFF" },
  MSFT: { from: "#00A4EF", to: "#0078D4", text: "#FFFFFF" },
  GOOGL: { from: "#4285F4", to: "#34A853", text: "#FFFFFF" },
  AMZN: { from: "#FF9900", to: "#146EB4", text: "#FFFFFF" },
  NVDA: { from: "#76B900", to: "#00873C", text: "#FFFFFF" },
  TSLA: { from: "#E82127", to: "#CC0000", text: "#FFFFFF" },
  META: { from: "#0866FF", to: "#0081FB", text: "#FFFFFF" },
  JPM: { from: "#0070CD", to: "#004A8F", text: "#FFFFFF" },
};

export function getStockGradient(symbol: string) {
  return (
    STOCK_GRADIENTS[symbol] || {
      from: "#6366f1",
      to: "#8b5cf6",
      text: "#FFFFFF",
    }
  );
}
