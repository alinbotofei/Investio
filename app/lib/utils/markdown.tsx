import InlineChart from "@/app/components/ui/InlineChart";

const SUPPORTED_CHART_TYPES = [
  "bar",
  "comparison",
  "pie",
  "donut",
  "sparkline",
  "allocation",
] as const;

function extractText(value: any): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map((item) => extractText(item)).join("");
  if (value?.props?.children) return extractText(value.props.children);
  return "";
}

function looksLikeChartJson(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return false;
  try {
    const parsed = JSON.parse(trimmed);
    const type = parsed?.type;
    return typeof type === "string" && SUPPORTED_CHART_TYPES.includes(type as any);
  } catch {
    return false;
  }
}

export const markdownComponents = {
  h1: ({ node, ...props }: any) => (
    <h1 className="text-2xl font-bold mb-3 mt-4 text-white" {...props} />
  ),
  h2: ({ node, ...props }: any) => (
    <h2 className="text-xl font-bold mb-3 mt-3 text-white" {...props} />
  ),
  h3: ({ node, ...props }: any) => (
    <h3 className="text-lg font-semibold mb-2 mt-2 text-slate-200" {...props} />
  ),
  p: ({ node, children, ...props }: any) => {
    const rawText = extractText(children).trim();
    if (looksLikeChartJson(rawText)) {
      return <InlineChart raw={rawText} />;
    }
    return (
      <p className="mb-3 leading-relaxed text-slate-100" {...props}>
        {children}
      </p>
    );
  },
  ul: ({ node, ...props }: any) => (
    <ul
      className="list-disc list-outside mb-3 space-y-2 ml-6 marker:text-slate-400"
      {...props}
    />
  ),
  ol: ({ node, ...props }: any) => (
    <ol
      className="list-decimal list-outside mb-3 space-y-2 ml-6 marker:text-slate-400"
      {...props}
    />
  ),
  li: ({ node, ...props }: any) => (
    <li className="leading-relaxed text-slate-100" {...props} />
  ),
  strong: ({ node, ...props }: any) => (
    <strong className="font-bold text-white" {...props} />
  ),
  em: ({ node, ...props }: any) => (
    <em className="italic text-slate-200" {...props} />
  ),
  code: ({ node, className, children, ...props }: any) => {
    const isInline = !className;
    if (!isInline) {
      const raw = String(children).replace(/\n$/, "").trim();
      if (
        className === "language-chart" ||
        (raw.startsWith("{") && raw.includes('"type":'))
      ) {
        return <InlineChart raw={raw} />;
      }
      return null;
    }
    return (
      <code
        className="bg-slate-950/70 px-2 py-1 rounded text-cyan-400 text-sm font-mono border border-slate-700/50"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }: any) => {
    const childArr = Array.isArray(children) ? children : [children];
    const hasChart = childArr.some(
      (c: any) => c?.type?.name === "InlineChart" || c?.props?.raw !== undefined
    );
    if (hasChart) return <>{children}</>;
    return null;
  },
  table: ({ node, ...props }: any) => (
    <div className="overflow-x-auto my-4">
      <table
        className="w-full border-collapse rounded-lg overflow-hidden"
        {...props}
      />
    </div>
  ),
  thead: ({ node, ...props }: any) => (
    <thead className="bg-slate-700/50" {...props} />
  ),
  th: ({ node, ...props }: any) => (
    <th
      className="border border-slate-600 px-4 py-2 text-left font-semibold text-slate-200"
      {...props}
    />
  ),
  td: ({ node, ...props }: any) => (
    <td
      className="border border-slate-700/50 px-4 py-2 text-slate-100"
      {...props}
    />
  ),
  blockquote: ({ node, ...props }: any) => (
    <blockquote
      className="border-l-4 border-slate-500 pl-4 italic my-3 text-slate-300 bg-slate-900/50 py-2 rounded-r"
      {...props}
    />
  ),
  a: ({ node, ...props }: any) => (
    <a
      className="text-cyan-400 hover:text-cyan-300 underline decoration-cyan-400/30 hover:decoration-cyan-300/50 transition-colors"
      {...props}
    />
  ),
};
