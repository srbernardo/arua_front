export interface Product {
  id: number
  name: string
  price: number
  images: string[]
  colors: string[]
}

export interface Category {
  id: string
  name: string
  active?: boolean
}
