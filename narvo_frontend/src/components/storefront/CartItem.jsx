'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import { formatPrice, getProductImage } from '@/lib/utils';

export default function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="flex gap-4 py-4 border-b border-border last:border-0 animate-fade-in">
      {/* Image */}
      <Link href={`/product/${item._id}`} className="flex-shrink-0">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-secondary border border-border">
          <Image
            src={getProductImage(item.images)}
            alt={item.title}
            fill
            className="object-cover"
          />
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link href={`/product/${item._id}`}>
          <h4 className="text-sm font-medium text-foreground line-clamp-2 hover:text-primary transition-colors">
            {item.title}
          </h4>
        </Link>
        <p className="text-sm font-semibold text-foreground mt-1">
          {formatPrice(item.price)}
        </p>

        {/* Quantity controls */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => updateQuantity(item._id, item.quantity - 1)}
              className="w-7 h-7 flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-sm font-medium text-foreground">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item._id, item.quantity + 1)}
              disabled={item.quantity >= (item.stock || 99)}
              className="w-7 h-7 flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={() => removeItem(item._id)}
            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
            aria-label="Remove item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-semibold text-foreground">
          {formatPrice(item.price * item.quantity)}
        </p>
        {item.quantity > 1 && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {item.quantity} × {formatPrice(item.price)}
          </p>
        )}
      </div>
    </div>
  );
}
