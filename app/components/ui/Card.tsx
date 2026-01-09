import Text from './Text'

export default function Card({
  title,
  children,
  className = '',
}: {
  title?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`bg-transparent border-transparent rounded-lg p-3 sm:p-4 md:p-5 shadow-sm ${className}`}>
      {title && <Text variant="h3" className="mb-3 md:mb-4 text-white">{title}</Text>}
      {children}
    </div>
  )
}
