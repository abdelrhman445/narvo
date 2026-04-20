'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import { formatPrice, getProductImage } from '@/lib/utils';

export default function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="flex gap-4 py-4 border-b border-gray-200 last:border-0 animate-fade-in" dir="rtl">
      {/* Image */}
      <Link href={`/product/${item._id}`} className="flex-shrink-0">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm transition-transform hover:scale-105">
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
          <h4 className="text-sm font-bold text-gray-900 line-clamp-2 hover:text-zinc-600 transition-colors">
            {item.title}
          </h4>
        </Link>
        <p className="text-sm font-semibold text-gray-700 mt-1">
          {formatPrice(item.price)}
        </p>

        {/* Quantity controls */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => updateQuantity(item._id, item.quantity - 1)}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900 active:bg-gray-200"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center text-sm font-bold text-gray-900">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item._id, item.quantity + 1)}
              disabled={item.quantity >= (item.stock || 99)}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-white active:bg-gray-200"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => removeItem(item._id)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 active:scale-95"
            aria-label="Remove item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="text-left flex-shrink-0">
        <p className="text-base font-bold text-zinc-900">
          {formatPrice(item.price * item.quantity)}
        </p>
        {item.quantity > 1 && (
          <p className="text-xs font-medium text-gray-500 mt-1">
            {item.quantity} × {formatPrice(item.price)}
          </p>
        )}
      </div>
    </div>
  );
}