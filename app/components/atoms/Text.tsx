type Variant = "h1" | "h2" | "h3" | "body" | "caption";

const TAG_MAP: Record<Variant, keyof React.JSX.IntrinsicElements> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  body: "p",
  caption: "span",
};

const VARIANT_CLASSES: Record<Variant, string> = {
  h1: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight",
  h2: "text-xl sm:text-2xl md:text-3xl font-bold tracking-tight",
  h3: "text-lg sm:text-xl md:text-2xl font-semibold",
  body: "text-sm sm:text-base leading-relaxed",
  caption: "text-xs sm:text-sm text-white/70 leading-snug",
};

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: Variant;
  as?: keyof React.JSX.IntrinsicElements;
}

export default function Text({
  variant = "body",
  as,
  className = "",
  children,
  ...props
}: TextProps) {
  const Component = (as ?? TAG_MAP[variant]) as React.ElementType;
  return (
    <Component className={`${VARIANT_CLASSES[variant]} ${className}`} {...props}>
      {children}
    </Component>
  );
}
