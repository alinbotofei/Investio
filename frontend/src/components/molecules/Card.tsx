import Text from '../atoms/Text'
import React from 'react'

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
    <div className={`bg-transparent border-transparent rounded-lg p-4 shadow-sm ${className}`}>
      {title && <Text variant="h3" className="mb-3 text-white">{title}</Text>}
      {children}
    </div>
  )
}
