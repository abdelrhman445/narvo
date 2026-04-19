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
    toast.success(`Added to cart`, {
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
    <Link href={`/product/${product._id}`} className="block group">
      <article className="product-card bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30">
        {/* Image container */}
        <div className="relative aspect-square bg-secondary overflow-hidden">
          <Image
            src={image}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discountPercent && (
              <span className="bg-primary text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                -{discountPercent}%
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-foreground/80 text-background text-[11px] font-medium px-2 py-0.5 rounded-full">
                Out of stock
              </span>
            )}
          </div>

          {/* Quick view overlay */}
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
              <Eye className="w-3.5 h-3.5" /> Quick view
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-body font-medium text-foreground text-sm leading-snug line-clamp-2 mb-3 group-hover:text-primary transition-colors">
            {product.title}
          </h3>

          {/* Pricing */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-base font-semibold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              product.stock === 0
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : inCart
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95'
            )}
          >
            {product.stock === 0 ? (
              'Out of Stock'
            ) : adding ? (
              <>
                <Check className="w-4 h-4" /> Added!
              </>
            ) : inCart ? (
              <>
                <Check className="w-4 h-4" /> In Cart
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </article>
    </Link>
  );
}
