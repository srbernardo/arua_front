const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  shipped: 'bg-violet-50 text-violet-700 border-violet-200',
  delivered: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

interface BadgeProps {
  status: string
  label?: string
}

export default function Badge({ status, label }: BadgeProps) {
  const style = STATUS_STYLES[status] ?? 'bg-gray-50 text-gray-700 border-gray-200'
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border font-body text-xs font-medium ${style}`}
    >
      {label ?? STATUS_LABELS[status] ?? status}
    </span>
  )
}

export function orderStatusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status
}