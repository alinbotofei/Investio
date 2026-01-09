export type Message = {
  id: string
  role: 'user' | 'assistant'
  text: string
  time?: number
  fresh?: boolean
}

export type NavItem = {
  label: string
  href: string
  active?: boolean
}
