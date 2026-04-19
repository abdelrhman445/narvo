'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, Check, ArrowLeft, Minus, Plus, Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import useCartStore from '@/store/cartStore';
import { formatPrice, getProductImage } from '@/lib/utils';

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem, isInCart, getItemQuantity } = useCartStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const inCart = product ? isInCart(product._id) : false;
  const cartQty = product ? getItemQuantity(product._id) : 0;

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    setAdding(true);
    addItem(product, quantity);
    toast.success('Added to cart!', { description: product.title, duration: 2000 });
    setTimeout(() => setAdding(false), 1500);
  };

  const discountPercent =
    product?.oldPrice && product?.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="font-display text-3xl mb-4">Product not found</h2>
        <button onClick={() => router.push('/')} className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium">
          Back to Shop
        </button>
      </div>
    );
  }

  const images = product.images?.length ? product.images : ['/placeholder-product.jpg'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Shop
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary border border-border">
            <Image
              src={images[selectedImage]}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {discountPercent && (
              <span className="absolute top-4 left-4 bg-primary text-white text-sm font-bold px-3 py-1 rounded-full">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === i ? 'border-primary' : 'border-border hover:border-primary/40'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <h1 className="font-display text-4xl text-foreground leading-tight mb-4">
            {product.title}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-semibold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-4 h-4 text-muted-foreground" />
            {product.stock > 0 ? (
              <span className="text-sm text-emerald-600 font-medium">
                {product.stock} in stock
              </span>
            ) : (
              <span className="text-sm text-destructive font-medium">Out of stock</span>
            )}
          </div>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed mb-8 flex-1">
            {product.description}
          </p>

          {/* Quantity + Add to Cart */}
          {product.stock > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground w-20">Quantity</span>
                <div className="flex items-center border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock - cartQty, q + 1))}
                    disabled={quantity >= product.stock - cartQty}
                    className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-semibold transition-all active:scale-95 ${
                  adding
                    ? 'bg-emerald-500 text-white'
                    : inCart
                    ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200'
                    : 'bg-primary text-white hover:bg-primary/90 animate-pulse-glow'
                }`}
              >
                {adding ? (
                  <><Check className="w-5 h-5" /> Added to Cart!</>
                ) : inCart ? (
                  <><Check className="w-5 h-5" /> In Cart ({cartQty})</>
                ) : (
                  <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
                )}
              </button>

              {inCart && (
                <button
                  onClick={() => router.push('/cart')}
                  className="w-full py-3 rounded-xl border border-border text-sm font-medium hover:border-primary/40 transition-colors"
                >
                  View Cart →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
