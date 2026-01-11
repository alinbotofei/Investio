import { NextRequest, NextResponse } from "next/server";
import { finnhubClient } from "@/lib/api/finnhub";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get("symbol");
    const category = searchParams.get("category") || "general";

    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 7);

    const toDate = to.toISOString().split("T")[0];
    const fromDate = from.toISOString().split("T")[0];

    let news;

    if (symbol) {
      news = await finnhubClient.getCompanyNews(symbol, fromDate, toDate);
    } else {
      news = await finnhubClient.getMarketNews(category);
    }

    const transformedNews = news.map((article) => ({
      id: article.id,
      headline: article.headline,
      summary: article.summary,
      source: article.source,
      url: article.url,
      image: article.image,
      datetime: article.datetime,
      category: article.category,
      related: article.related,
    }));

    return NextResponse.json(transformedNews);
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
