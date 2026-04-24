interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const SIZE_CLASSES = {
  sm: "w-3.5 h-3.5 border-2",
  md: "w-5 h-5 border-2",
  lg: "w-8 h-8 border-[3px]",
} as const;

export default function Spinner({ size = "md", className = "", label = "Loading..." }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className={`inline-block ${className}`}>
      <span
        className={`block rounded-full border-slate-600 border-t-cyan-400 animate-spin ${SIZE_CLASSES[size]}`}
        aria-hidden="true"
      />
    </span>
  );
}
