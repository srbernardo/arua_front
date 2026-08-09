import { useState, useMemo, useRef, useEffect } from "react";
import {
  ChevronLeft,
  Heart,
  Minus,
  Plus,
  Check,
} from "lucide-react";
import type { Product } from "../types";
import { useFavorites } from "../context/FavoritesContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

interface ProductPageProps {
  product: Product;
  onBack: () => void;
}

export default function ProductPage({ product, onBack }: ProductPageProps) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? "");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addItem } = useCart();
  const thumbRef = useRef<HTMLDivElement>(null);

  const favorited = isFavorite(product.id);

  const availableColors = useMemo(() => {
    return [...new Set(product.variants.map((v) => v.color))];
  }, [product.variants]);

  const availableSizes = useMemo(() => {
    const sizes = product.variants
      .filter((v) => v.color === selectedColor)
      .map((v) => v.size);
    return [...new Set(sizes)];
  }, [product.variants, selectedColor]);

  useEffect(() => {
    if (availableSizes.length > 0 && !availableSizes.includes(selectedSize)) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes, selectedSize]);

  const selectedVariant = useMemo(
    () =>
      product.variants.find(
        (v) => v.size === selectedSize && v.color === selectedColor,
      ),
    [product.variants, selectedSize, selectedColor],
  );

  const currentImages = useMemo(() => {
    const group = product.images_by_color.find(
      (g) => g.color === selectedColor,
    );
    return group?.images ?? [];
  }, [product.images_by_color, selectedColor]);

  useEffect(() => {
    setSelectedImgIndex(0);
  }, [selectedColor]);

  useEffect(() => {
    if (thumbRef.current) {
      const active = thumbRef.current.children[selectedImgIndex] as HTMLElement;
      if (active) {
        active.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedImgIndex]);

  function handleAdd() {
    if (!selectedVariant) return;
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedVariant);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center gap-3 px-4 md:px-8 h-12 shrink-0">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
        >
          <ChevronLeft size={22} className="text-neutral-600" />
        </button>
        <span className="font-body text-sm text-neutral-500 truncate">
          {product.name}
        </span>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col md:flex-row gap-4 p-4 md:p-8 overflow-y-auto">
          <div className="hidden md:flex flex-col gap-2 shrink-0 w-38">
            <div
              ref={thumbRef}
              className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-260px)] scrollbar-hide"
            >
              {currentImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImgIndex(i)}
                  className={`w-38 h-48 shrink-0 overflow-hidden cursor-pointer transition-all ${
                    i === selectedImgIndex
                      ? "opacity-100"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center bg-neutral-50 overflow-hidden min-h-[25vh] md:min-h-0">
            {currentImages.length > 0 ? (
              <div className="relative w-full h-full">
                <div
                  className="flex h-full transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${selectedImgIndex * 100}%)`,
                  }}
                >
                  {currentImages.map((img, i) => (
                    <img
                      key={i}
                      src={img.url}
                      alt={product.name}
                      className="w-full h-full object-cover shrink-0"
                    />
                  ))}
                </div>
                {currentImages.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setSelectedImgIndex((i) =>
                          i === 0 ? currentImages.length - 1 : i - 1,
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-white transition-colors"
                    >
                      <ChevronLeft size={20} className="text-black" />
                    </button>
                    <button
                      onClick={() =>
                        setSelectedImgIndex((i) =>
                          i === currentImages.length - 1 ? 0 : i + 1,
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-white transition-colors"
                    >
                      <ChevronLeft
                        size={20}
                        className="text-black rotate-180"
                      />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center text-neutral-400 font-body text-sm">
                Sem imagens
              </div>
            )}
          </div>

          <div className="flex md:hidden gap-2 overflow-x-auto scrollbar-hide pb-2">
            {currentImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImgIndex(i)}
                className={`w-16 h-20 shrink-0 overflow-hidden cursor-pointer transition-all ${
                  i === selectedImgIndex
                    ? "opacity-100"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={img.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-[560px] xl:w-[620px] flex flex-col overflow-y-auto">
          <div className="p-6 md:p-8 flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-heading text-xl md:text-2xl font-semibold text-black leading-tight">
                {product.name}
              </h1>
              <button
                onClick={() => user && toggleFavorite(product.id)}
                className="w-10 h-10 flex items-center justify-center shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
              >
                <Heart
                  size={22}
                  className={`transition-colors ${
                    favorited ? "text-red-500 fill-red-500" : "text-neutral-400"
                  }`}
                />
              </button>
            </div>

            <span className="font-heading text-2xl font-bold text-black">
              {product.price.toFixed(2)} €
            </span>

            <div className="flex flex-col gap-3">
              <span className="font-body text-sm font-medium text-black">
                Cor
              </span>
              <div className="flex items-center gap-2">
                {availableColors.map((color) => {
                  const hasStock = product.variants.some(
                    (v) => v.color === color && v.stock > 0,
                  );
                  return (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setQuantity(1);
                      }}
                      disabled={!hasStock}
                      className={`w-9 h-9 rounded-full cursor-pointer hover:scale-110 transition-all flex items-center justify-center ${
                        !hasStock ? "opacity-30 cursor-not-allowed" : ""
                      } ${color === selectedColor ? "ring-2 ring-black ring-offset-2" : ""}`}
                      style={{ backgroundColor: color }}
                    >
                      {color === selectedColor && (
                        <Check
                          size={16}
                          className={
                            isLightColor(color) ? "text-black" : "text-white"
                          }
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm font-medium text-black">
                  Tamanho
                </span>
                {selectedVariant &&
                  selectedVariant.stock > 0 &&
                  selectedVariant.stock <= 5 && (
                    <span className="font-body text-xs text-orange-500">
                      Últimas {selectedVariant.stock} unidades
                    </span>
                  )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {availableSizes.map((size) => {
                  const hasStock = product.variants.some(
                    (v) =>
                      v.size === size &&
                      v.color === selectedColor &&
                      v.stock > 0,
                  );
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        setQuantity(1);
                      }}
                      disabled={!hasStock}
                      className={`min-w-[48px] h-11 px-4 rounded-xl text-sm font-body font-semibold transition-all cursor-pointer ${
                        size === selectedSize
                          ? "bg-black text-white"
                          : "bg-neutral-100 text-black hover:bg-neutral-200"
                      } ${!hasStock ? "opacity-30 cursor-not-allowed" : ""}`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-body text-sm font-medium text-black">
                Quantidade
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  <Minus size={16} className="text-black" />
                </button>
                <span className="font-body text-base font-semibold text-black w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(selectedVariant?.stock ?? 10, q + 1),
                    )
                  }
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  <Plus size={16} className="text-black" />
                </button>
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={!selectedVariant || selectedVariant.stock === 0}
              className="w-full h-13 bg-black text-white font-body text-sm font-semibold rounded-full cursor-pointer hover:bg-black/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {added ? (
                <>
                  <Check size={18} />
                  Adicionado!
                </>
              ) : selectedVariant && selectedVariant.stock > 0 ? (
                `Adicionar ao Carrinho — ${(product.price * quantity).toFixed(2)} €`
              ) : (
                "Indisponível"
              )}
            </button>

            {/* <div className="flex flex-col gap-3 mt-2">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50">
                <Truck size={20} className="text-neutral-500 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-body text-sm font-medium text-black">Envio grátis</span>
                  <span className="font-body text-xs text-neutral-500">Para encomendas acima de $50</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50">
                <RotateCcw size={20} className="text-neutral-500 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-body text-sm font-medium text-black">Devoluções grátis</span>
                  <span className="font-body text-xs text-neutral-500">Até 30 dias após a compra</span>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 186;
}
