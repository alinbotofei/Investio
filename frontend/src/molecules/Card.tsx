import Text from '../atoms/Text'

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
    <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${className}`}>
      {title && <Text variant="h3" className="mb-3">{title}</Text>}
      {children}
    </div>
  )
}
