'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, Check, ArrowLeft, Minus, Plus, Loader2, Package } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import useCartStore from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';

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
    toast.success('تمت الإضافة للسلة!', { description: product.title, duration: 2000 });
    setTimeout(() => setAdding(false), 1500);
  };

  const discountPercent =
    product?.oldPrice && product?.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] transition-colors duration-300">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center transition-colors">
        <h2 className="font-display text-3xl mb-4 text-foreground">المنتج غير متوفر</h2>
        <button onClick={() => router.push('/')} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-colors">
          العودة للمتجر
        </button>
      </div>
    );
  }

  const images = product.images?.length ? product.images : ['https://placehold.co/600x600/eeeeee/999999?text=No+Image'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300" dir="rtl">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group w-fit"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        العودة للمتجر
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in">
        {/* Images Section */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-secondary border border-border shadow-sm transition-colors">
            <Image
              src={images[selectedImage]}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {discountPercent && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md z-10">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${
                    selectedImage === i 
                    ? 'border-primary shadow-md scale-95' 
                    : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <Image src={img} alt={`Thumbnail ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="flex flex-col" dir="auto">
          <h1 className="font-display text-4xl text-foreground font-bold leading-tight mb-4 transition-colors">
            {product.title}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6 transition-colors">
            <span className="text-3xl font-bold text-foreground transition-colors">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-xl text-muted-foreground line-through font-medium transition-colors">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 mb-6 bg-secondary px-3 py-1.5 rounded-lg border border-border transition-colors w-fit">
            <Package className="w-4 h-4 text-muted-foreground" />
            {product.stock > 0 ? (
              <span className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold transition-colors">
                متوفر ({product.stock} قطع)
              </span>
            ) : (
              <span className="text-sm text-destructive font-semibold transition-colors">نفذت الكمية</span>
            )}
          </div>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed mb-8 flex-1 text-lg transition-colors">
            {product.description}
          </p>

          {/* Quantity & Add to Cart Controls */}
          {product.stock > 0 && (
            <div className="space-y-5 bg-card p-6 rounded-[2rem] border border-border shadow-sm transition-colors">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-muted-foreground transition-colors">الكمية</span>
                <div className="flex items-center border-2 border-border rounded-2xl overflow-hidden bg-background transition-colors">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground active:bg-border"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-14 text-center font-bold text-lg text-foreground transition-colors">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock - cartQty, q + 1))}
                    disabled={quantity >= product.stock - cartQty}
                    className="w-12 h-12 flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-20 text-muted-foreground active:bg-border"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
                className={`w-full flex items-center justify-center gap-2 py-5 rounded-2xl text-lg font-bold transition-all duration-300 active:scale-[0.98] shadow-sm ${
                  adding
                    ? 'bg-red-500 text-white shadow-red-500/30 border-red-500'
                    : inCart
                    ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-2 border-red-200 dark:border-red-500/30 hover:bg-red-100'
                    : 'bg-red-600 text-white hover:bg-red-700 shadow-xl shadow-red-600/20'
                }`}
              >
                {adding ? (
                  <><Check className="w-6 h-6" /> تمت الإضافة!</>
                ) : inCart ? (
                  <><Check className="w-6 h-6" /> متواجد في السلة ({cartQty})</>
                ) : (
                  <><ShoppingCart className="w-6 h-6" /> أضف إلى السلة</>
                )}
              </button>

              {inCart && (
                <button
                  onClick={() => router.push('/cart')}
                  className="w-full py-4 rounded-2xl border-2 border-red-600 bg-red-600 text-white text-sm font-bold hover:bg-red-700 hover:border-red-700 transition-all active:scale-[0.98]"
                >
                  الذهاب إلى الدفع ←
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
