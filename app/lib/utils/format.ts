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
