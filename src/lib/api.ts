const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

function getCartToken(): string {
  const key = 'arua-cart-token'
  let token = localStorage.getItem(key)
  if (!token) {
    token = crypto.randomUUID()
    localStorage.setItem(key, token)
  }
  return token
}

async function fetchAPI(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-Cart-Token': getCartToken(),
      ...options?.headers,
    },
    ...options,
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`API ${res.status}: ${body}`)
  }
  return res.json()
}

export const api = {
  categories: {
    list: () => fetchAPI('/categories'),
  },
  products: {
    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : ''
      return fetchAPI(`/products${qs}`)
    },
  },
  cart: {
    show: () => fetchAPI('/cart'),
    addItem: (productId: number, quantity = 1) =>
      fetchAPI('/cart/add_item', { method: 'POST', body: JSON.stringify({ product_id: productId, quantity }) }),
    updateItem: (id: number, quantity: number) =>
      fetchAPI(`/cart/items/${id}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }),
    removeItem: (id: number) =>
      fetchAPI(`/cart/items/${id}`, { method: 'DELETE' }),
    clear: () =>
      fetchAPI('/cart/clear', { method: 'DELETE' }),
  },
}
