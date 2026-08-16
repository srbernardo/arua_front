import { useParams } from 'react-router-dom'
import AdminPlaceholder from '../AdminPlaceholder'

export default function AdminOrderDetailsPage() {
  const { id } = useParams()

  return (
    <AdminPlaceholder
      title={`Pedido #${id}`}
      description="Detalhes do pedido (itens, morada e estado) serão implementados na Parte 3."
    />
  )
}