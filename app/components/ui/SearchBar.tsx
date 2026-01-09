import Button from './Button'

interface SearchBarProps {
  onSearch?: (query: string) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = formData.get('query') as string
    onSearch?.(query)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        name="query"
        placeholder="Search..."
        className="flex-1 px-4 py-2 border border-neutral-300 rounded"
      />
      <Button type="submit" variant="primary">
        Search
      </Button>
    </form>
  )
}
