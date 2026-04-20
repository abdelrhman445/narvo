'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import { formatPrice, getProductImage } from '@/lib/utils';

export default function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="flex gap-4 py-6 border-b border-border last:border-0 animate-fade-in transition-colors duration-300" dir="rtl">
      {/* Image Container */}
      <Link href={`/product/${item._id}`} className="flex-shrink-0">
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-secondary border border-border shadow-sm transition-transform hover:scale-105">
          <Image
            src={getProductImage(item.images)}
            alt={item.title}
            fill
            className="object-cover"
          />
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <Link href={`/product/${item._id}`}>
            <h4 className="text-sm font-bold text-foreground line-clamp-2 hover:text-muted-foreground transition-colors">
              {item.title}
            </h4>
          </Link>
          <p className="text-sm font-semibold text-muted-foreground mt-1 transition-colors">
            {formatPrice(item.price)}
          </p>
        </div>

        {/* Quantity controls & Trash */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center border border-border rounded-xl overflow-hidden bg-background transition-colors">
            <button
              onClick={() => updateQuantity(item._id, item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground active:bg-border"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center text-sm font-bold text-foreground transition-colors">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item._id, item.quantity + 1)}
              disabled={item.quantity >= (item.stock || 99)}
              className="w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground disabled:opacity-20 active:bg-border"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => removeItem(item._id)}
            className="p-2 text-muted-foreground hover:text-destructive transition-all rounded-xl hover:bg-destructive/10 active:scale-95"
            aria-label="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtotal Section */}
      <div className="text-left flex-shrink-0 flex flex-col items-end">
        <p className="text-base font-black text-foreground transition-colors">
          {formatPrice(item.price * item.quantity)}
        </p>
        {item.quantity > 1 && (
          <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest transition-colors">
            {item.quantity} × {formatPrice(item.price)}
          </p>
        )}
      </div>
    </div>
  );
}