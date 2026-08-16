import { useParams } from 'react-router-dom'
import AdminPlaceholder from '../AdminPlaceholder'

export default function ProductFormPage() {
  const { id } = useParams()
  const title = id ? `Editar Produto #${id}` : 'Novo Produto'

  return (
    <AdminPlaceholder
      title={title}
      description="O formulário de produto (variantes, stock e imagens) será implementado na Parte 3."
    />
  )
}