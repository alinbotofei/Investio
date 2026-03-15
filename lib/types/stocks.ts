export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume?: number;
  marketCap?: number;
  logo?: string;
}

export interface NewsItem {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image?: string;
  datetime: number;
  category: string;
  related?: string;
}

export interface StockDetails extends Stock {
  industry?: string;
  exchange?: string;
  country?: string;
  website?: string;
  ipo?: string;
  beta?: number;
  peRatio?: number;
  eps?: number;
  week52High?: number;
  week52Low?: number;
  recommendation?: SentimentData;
}

export interface SentimentData {
  buy: number;
  hold: number;
  sell: number;
  strongBuy: number;
  strongSell: number;
  period: string;
  signal: "buy" | "hold" | "sell";
}

export interface ChartData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  addedAt: number;
}
