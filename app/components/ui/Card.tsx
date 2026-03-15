import Text from "./Text";

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  /** Visual weight of the card */
  elevated?: boolean;
}

export default function Card({ title, children, className = "", elevated = false }: CardProps) {
  const base = elevated
    ? "rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-md"
    : "rounded-2xl bg-slate-900/60 border border-slate-700/50 shadow-sm";

  return (
    <div className={`${base} p-4 sm:p-5 ${className}`}>
      {title && (
        <Text variant="h3" className="mb-3 text-white">
          {title}
        </Text>
      )}
      {children}
    </div>
  );
}
