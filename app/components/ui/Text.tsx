interface TextProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption'
}

export default function Text({ variant = 'body', className = '', children, ...props }: TextProps) {
  const variants = {
    h1: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold',
    h2: 'text-xl sm:text-2xl md:text-3xl font-bold',
    h3: 'text-lg sm:text-xl md:text-2xl font-semibold',
    body: 'text-sm sm:text-base',
    caption: 'text-xs sm:text-sm text-white/70',
  }

  return (
    <div className={`${variants[variant as keyof typeof variants]} ${className}`} {...props}>
      {children}
    </div>
  )
}
