import Text from '../atoms/Text'

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 shadow-sm">
      <Text variant="h2" className="text-gray-900">
        Investio
      </Text>
    </header>
  )
}
