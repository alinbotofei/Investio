interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export default function Input({ label, error, hint, id, className = "", ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-200">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          "w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border text-white placeholder:text-slate-400/70 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/40",
          "transition-[border-color,box-shadow] duration-200",
          error ? "border-red-500/60" : "border-slate-600/50 hover:border-slate-500/60",
          className,
        ].join(" ")}
        {...props}
      />
      {hint && !error && <span className="text-xs text-slate-400">{hint}</span>}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
