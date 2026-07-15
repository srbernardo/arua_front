import type { Product, Category } from '../types'

export const categories: Category[] = [
  { id: 'top-bikini', name: 'Top Bikini', active: true },
  { id: 'cueca-bikini', name: 'Cueca Bikini' },
  { id: 'bikinis', name: 'Bikínis' },
  { id: 'conjunto', name: 'Conjunto' },
  { id: 'fatos-banho', name: 'Fatos de Banho' },
  { id: 'ver-todos', name: 'Ver Todos' },
]

function generateImages(id: number): string[] {
  return [
    `/images/product-${id}.png`,
    `https://picsum.photos/seed/${id}a/320/360`,
    `https://picsum.photos/seed/${id}b/320/360`,
    `https://picsum.photos/seed/${id}c/320/360`,
  ]
}

export const products: Product[] = [
  { id: 1, name: "Classic High-Waisted", price: 89.99, images: generateImages(1), colors: ["#D4916E", "#F3EBE2", "#C4CFDE"] },
  { id: 2, name: "Surf Style Bottom", price: 69.99, images: generateImages(2), colors: ["#D4916E", "#F3EBE2", "#C4CFDE"] },
  { id: 3, name: "Lace Detail Set", price: 119.99, images: generateImages(3), colors: ["#D4916E", "#F3EBE2", "#C4CFDE"] },
  { id: 4, name: "Striped High-Waisted", price: 79.99, images: generateImages(4), colors: ["#D4916E", "#F3EBE2", "#C4CFDE"] },
  { id: 5, name: "Tropical Print Bottom", price: 74.99, images: generateImages(5), colors: ["#D4916E", "#F3EBE2", "#C4CFDE"] },
  { id: 6, name: "Polka Dot Set", price: 99.99, images: generateImages(6), colors: ["#D4916E", "#F3EBE2", "#C4CFDE"] },
  { id: 7, name: "Bandeau Top", price: 59.99, images: generateImages(7), colors: ["#D4916E", "#F3EBE2", "#C4CFDE"] },
  { id: 8, name: "Strapless Fit", price: 84.99, images: generateImages(8), colors: ["#D4916E", "#F3EBE2", "#C4CFDE"] },
  { id: 9, name: "Ribbed Texture Top", price: 64.99, images: generateImages(9), colors: ["#D4916E", "#F3EBE2", "#C4CFDE"] },
  { id: 10, name: "High Cut Bottom", price: 59.99, images: generateImages(10), colors: ["#D4916E", "#F3EBE2", "#C4CFDE"] },
  { id: 11, name: "Wrap Style Set", price: 109.99, images: generateImages(11), colors: ["#D4916E", "#F3EBE2", "#C4CFDE"] },
  { id: 12, name: "Sporty Cut Top", price: 54.99, images: generateImages(12), colors: ["#D4916E", "#F3EBE2", "#C4CFDE"] },
]
