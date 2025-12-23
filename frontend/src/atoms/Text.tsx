interface TextProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption'
}

export default function Text({ variant = 'body', className = '', children, ...props }: TextProps) {
  const variants = {
    h1: 'text-3xl font-bold',
    h2: 'text-2xl font-bold',
    h3: 'text-xl font-semibold',
    body: 'text-base',
    caption: 'text-sm text-gray-600',
  }

  return (
    <div className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  )
}
