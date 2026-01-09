import Icon from '../ui/Icon'
import { NavItem } from '../../lib/types'

interface SidebarProps {
  items: NavItem[]
}

export default function Sidebar({ items }: SidebarProps) {
  const iconFor = (label: string) => {
    if (label.toLowerCase().includes('dash')) return 'dashboard'
    if (label.toLowerCase().includes('chat')) return 'chat'
    return 'circle'
  }

  return (
    <aside className="w-64 flex flex-col h-full bg-transparent">
      <div className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold">I</div>
          <div>
            <div className="text-white font-semibold">Investio</div>
            <div className="text-xs text-white/60">Investment Assistant</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-150 ${
              item.active ? 'bg-white/6 text-white' : 'text-white/80 hover:bg-white/5'
            }`}
          >
            <Icon name={iconFor(item.label)} className="text-[18px] text-white/70" />
            <span className="text-sm">{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  )
}
