export type AssetCategory = "stock" | "crypto" | "forex";

export interface WatchlistItem {
  symbol: string;
  name: string;
  category: AssetCategory;
  addedAt: number;
}

export interface BaseAssetData {
  symbol: string;
  name: string;
  category: AssetCategory;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume?: number;
}

export interface StockData extends BaseAssetData {
  category: "stock";
  marketCap?: number;
  logo?: string;
  pe?: number;
  eps?: number;
  beta?: number;
}

export interface CryptoData extends BaseAssetData {
  category: "crypto";
}

export interface ForexData extends BaseAssetData {
  category: "forex";
}

export interface AnalystRecommendation {
  period: string;
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
}

export interface InsiderSentiment {
  symbol: string;
  year: number;
  month: number;
  change: number;
  mspr: number;
}

export interface EarningsData {
  date: string;
  epsActual: number | null;
  epsEstimate: number | null;
  hour: string;
  quarter: number;
  revenueActual: number | null;
  revenueEstimate: number | null;
  symbol: string;
  year: number;
}
