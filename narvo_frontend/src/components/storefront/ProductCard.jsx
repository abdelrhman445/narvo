'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Check, Eye } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import useCartStore from '@/store/cartStore';
import { cn, formatPrice, getProductImage } from '@/lib/utils';

export default function ProductCard({ product }) {
  const { addItem, isInCart } = useCartStore();
  const [adding, setAdding] = useState(false);
  const inCart = isInCart(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock === 0) return;

    setAdding(true);
    addItem(product, 1);
    toast.success(`تمت الإضافة للسلة`, {
      description: product.title,
      duration: 2000,
    });

    setTimeout(() => setAdding(false), 1500);
  };

  const discountPercent =
    product.oldPrice && product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  const image = getProductImage(product.images);

  return (
    <Link href={`/product/${product._id}`} className="block group" dir="rtl">
      <article className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        {/* Image container */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <Image
            src={image}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
            {discountPercent && (
              <span className="bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-sm">
                -{discountPercent}%
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-zinc-900/90 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                نفذت الكمية
              </span>
            )}
          </div>

          {/* Quick view overlay */}
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 bg-white/95 backdrop-blur-md text-zinc-900 text-sm font-bold px-4 py-2 rounded-full shadow-lg">
              <Eye className="w-4 h-4" /> نظرة سريعة
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-3 group-hover:text-zinc-600 transition-colors">
              {product.title}
            </h3>

            {/* Pricing */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xl font-black text-zinc-900">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-sm font-medium text-gray-400 line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm',
              product.stock === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : adding
                ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                : inCart
                ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200 hover:bg-emerald-100'
                : 'bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-lg hover:shadow-zinc-900/20 active:scale-[0.98]'
            )}
          >
            {product.stock === 0 ? (
              'نفذت الكمية'
            ) : adding ? (
              <>
                <Check className="w-5 h-5" /> تمت الإضافة!
              </>
            ) : inCart ? (
              <>
                <Check className="w-5 h-5" /> في السلة
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" /> أضف للسلة
              </>
            )}
          </button>
        </div>
      </article>
    </Link>
  );
}