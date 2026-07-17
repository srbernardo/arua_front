export interface ProductImage {
  url: string
}

export interface ProductImageGroup {
  color: string
  images: ProductImage[]
}

export interface Variant {
  id: number
  size: string
  color: string
  stock: number
  sku: string
}

export interface Product {
  id: number
  name: string
  price: number
  sizes: string[]
  images_by_color: ProductImageGroup[]
  colors: string[]
  variants: Variant[]
  category_id?: string
}

export interface Category {
  id: string
  name: string
  active?: boolean
}
