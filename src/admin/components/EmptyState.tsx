import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-1">
        <Inbox size={22} className="text-gray-400" />
      </div>
      <p className="font-body text-sm font-medium text-gray-700">{title}</p>
      {description && <p className="font-body text-xs text-gray-500 max-w-sm">{description}</p>}
    </div>
  )
}