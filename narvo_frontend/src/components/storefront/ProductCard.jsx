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
      <article className="bg-card rounded-[2rem] overflow-hidden border border-border shadow-sm hover:shadow-2xl hover:shadow-black/20 dark:hover:shadow-white/5 hover:-translate-y-1 transition-all duration-500">
        
        {/* Image container */}
        <div className="relative aspect-square bg-secondary overflow-hidden transition-colors">
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
    /* ✅ هنا غيرنا bg-destructive لـ bg-red-600 عشان يفضل أحمر ثابت */
    <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm uppercase tracking-wider">
      -{discountPercent}%
    </span>
  )}
  {product.stock === 0 && (
    <span className="bg-primary text-primary-foreground text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm uppercase tracking-wider opacity-90">
      نفذت الكمية
    </span>
  )}
</div>

          {/* Quick view overlay */}
          <div className="absolute inset-0 bg-black/5 dark:bg-black/40 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="translate-y-4 group-hover:translate-y-0 transition-all duration-500 flex items-center gap-2 bg-background/95 dark:bg-card/95 backdrop-blur-md text-foreground text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-full shadow-xl border border-border">
              <Eye className="w-4 h-4" /> نظرة سريعة
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col justify-between transition-colors">
          <div>
            <h3 className="font-bold text-foreground text-sm leading-snug line-clamp-2 mb-3 group-hover:text-muted-foreground transition-colors">
              {product.title}
            </h3>

            {/* Pricing */}
            <div className="flex items-center gap-3 mb-6 transition-colors">
              <span className="text-lg font-black text-foreground">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-xs font-medium text-muted-foreground line-through decoration-destructive/50">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>
          </div>

          {/* Add to cart button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-sm active:scale-95',
              product.stock === 0
                ? 'bg-secondary text-muted-foreground cursor-not-allowed border border-border'
                : adding
                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                : inCart
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-200 dark:border-emerald-500/30'
                : 'bg-primary text-primary-foreground hover:opacity-90 shadow-xl shadow-primary/10'
            )}
          >
            {product.stock === 0 ? (
              'Sold Out'
            ) : adding ? (
              <>
                <Check className="w-4 h-4" /> Added
              </>
            ) : inCart ? (
              <>
                <Check className="w-4 h-4" /> In Cart
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" /> Add To Cart
              </>
            )}
          </button>
        </div>
      </article>
    </Link>
  );
}