import Text from '../atoms/Text'

interface NavItem {
  label: string
  href: string
  active?: boolean
}

interface SidebarProps {
  items: NavItem[]
}

export default function Sidebar({ items }: SidebarProps) {
  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <Text variant="h3">Menu</Text>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {items.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`block px-4 py-2 rounded transition-colors ${
              item.active
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  )
}
