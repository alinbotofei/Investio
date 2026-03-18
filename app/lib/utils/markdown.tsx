import type { Components } from "react-markdown";
import type { ReactNode } from "react";
import InlineChart from "@/app/components/ui/InlineChart";

const SUPPORTED_CHART_TYPES = [
  "bar",
  "comparison",
  "pie",
  "donut",
  "sparkline",
  "allocation",
] as const;

type ChartType = (typeof SUPPORTED_CHART_TYPES)[number];

function extractText(value: ReactNode): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(extractText).join("");
  if (value !== null && typeof value === "object" && "props" in value) {
    const el = value as { props?: { children?: ReactNode } };
    return extractText(el.props?.children);
  }
  return "";
}

function looksLikeChartJson(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return false;
  try {
    const parsed = JSON.parse(trimmed) as { type?: unknown };
    const type = parsed?.type;
    return typeof type === "string" && SUPPORTED_CHART_TYPES.includes(type as ChartType);
  } catch {
    return false;
  }
}

export const markdownComponents: Components = {
  h1: ({ node: _node, ...props }) => (
    <h1 className="text-2xl font-bold mb-3 mt-4 text-slate-100" {...props} />
  ),
  h2: ({ node: _node, ...props }) => (
    <h2 className="text-xl font-bold mb-3 mt-3 text-slate-100" {...props} />
  ),
  h3: ({ node: _node, ...props }) => (
    <h3 className="text-lg font-semibold mb-2 mt-2 text-slate-300" {...props} />
  ),
  p: ({ node: _node, children, ...props }) => {
    const rawText = extractText(children as ReactNode).trim();
    if (looksLikeChartJson(rawText)) {
      return <InlineChart raw={rawText} />;
    }
    if (rawText.startsWith("{")) {
      return null;
    }
    return (
      <p className="mb-3 leading-relaxed text-slate-300" {...props}>
        {children}
      </p>
    );
  },
  ul: ({ node: _node, ...props }) => (
    <ul
      className="list-disc list-outside mb-3 space-y-2 ml-6 marker:text-slate-400"
      {...props}
    />
  ),
  ol: ({ node: _node, ...props }) => (
    <ol
      className="list-decimal list-outside mb-3 space-y-2 ml-6 marker:text-slate-400"
      {...props}
    />
  ),
  li: ({ node: _node, ...props }) => (
    <li className="leading-relaxed text-slate-300" {...props} />
  ),
  strong: ({ node: _node, ...props }) => (
    <strong className="font-semibold text-slate-100" {...props} />
  ),
  em: ({ node: _node, ...props }) => (
    <em className="italic text-slate-400" {...props} />
  ),
  code: ({ node: _node, className, children, ...props }) => {
    const isInline = !className;
    if (!isInline) {
      const raw = String(children).replace(/\n$/, "").trim();
      if (
        className === "language-chart" ||
        (raw.startsWith("{") && raw.includes('"type":'))
      ) {
        return <InlineChart raw={raw} />;
      }
      return (
        <code className="block bg-slate-950/60 rounded-lg p-3 my-2 text-sky-300 text-sm font-mono overflow-x-auto border border-slate-700/40 leading-relaxed">
          {children}
        </code>
      );
    }
    return (
      <code
        className="bg-slate-950/70 px-2 py-1 rounded text-sky-400 text-sm font-mono border border-slate-700/50"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => {
    const childArr = Array.isArray(children) ? children : [children];
    const hasChart = childArr.some((c) => {
      if (!c || typeof c !== "object" || !("type" in c)) return false;
      const el = c as { type: unknown; props?: { raw?: string } };
      return el.type === InlineChart || el.props?.raw !== undefined;
    });
    if (hasChart) return <>{children}</>;
    return (
      <pre className="bg-slate-950/60 rounded-lg p-3 my-2 overflow-x-auto border border-slate-700/40">
        {children}
      </pre>
    );
  },
  table: ({ node: _node, ...props }) => (
    <div className="overflow-x-auto mt-2 mb-4 rounded-lg border border-slate-700/60">
      <table
        className="w-full border-collapse text-sm m-0"
        {...props}
      />
    </div>
  ),
  thead: ({ node: _node, ...props }) => (
    <thead className="bg-slate-800/80" {...props} />
  ),
  th: ({ node: _node, ...props }) => (
    <th
      className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-700/80"
      {...props}
    />
  ),
  tbody: ({ node: _node, ...props }) => (
    <tbody {...props} />
  ),
  tr: ({ node: _node, ...props }) => (
    <tr className="border-b border-slate-700/40 last:border-0 transition-colors hover:bg-slate-700/10" {...props} />
  ),
  td: ({ node: _node, ...props }) => (
    <td
      className="px-4 py-2.5 text-slate-300"
      {...props}
    />
  ),
  blockquote: ({ node: _node, ...props }) => (
    <blockquote
      className="border-l-4 border-slate-500 pl-4 italic my-3 text-slate-300 bg-slate-900/50 py-2 rounded-r"
      {...props}
    />
  ),
  a: ({ node: _node, href, children, ...props }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sky-400 hover:text-sky-300 underline decoration-sky-400/30 hover:decoration-sky-300/50 transition-colors"
      {...props}
    >
      {children}
    </a>
  ),
};
