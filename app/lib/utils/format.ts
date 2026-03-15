export const formatNumber = (num: number, suffix = "") => {
  if (!num) return "N/A";
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T${suffix}`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B${suffix}`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M${suffix}`;
  return `${num.toFixed(2)}${suffix}`;
};

export const formatPrice = (price: number | undefined, decimals = 2) => {
  if (!price) return "N/A";
  return `$${price.toFixed(decimals)}`;
};

export const formatPercent = (value: number | undefined, decimals = 2) => {
  if (value === undefined || value === null) return "N/A";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
};

export const formatVolume = (volume: number | undefined) => {
  if (!volume) return "N/A";
  if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
  if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
  if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
  return volume.toString();
};

export const formatDate = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const isPositive = (value: number) => value >= 0;

export function formatTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
