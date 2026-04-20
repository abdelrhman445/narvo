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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="font-display text-3xl mb-4 text-gray-900">المنتج غير متوفر</h2>
        <button onClick={() => router.push('/')} className="px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors">
          العودة للمتجر
        </button>
      </div>
    );
  }

  const images = product.images?.length ? product.images : ['https://placehold.co/600x600/eeeeee/999999?text=No+Image'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8 group w-fit"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        العودة للمتجر
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in">
        {/* Images Section */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
            <Image
              src={images[selectedImage]}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {discountPercent && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
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
                  className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === i ? 'border-zinc-900 shadow-md scale-95' : 'border-gray-200 hover:border-gray-400'
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
          <h1 className="font-display text-4xl text-gray-900 font-bold leading-tight mb-4">
            {product.title}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-xl text-gray-400 line-through font-medium">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 mb-6 bg-gray-50 w-fit px-3 py-1.5 rounded-lg border border-gray-200">
            <Package className="w-4 h-4 text-gray-500" />
            {product.stock > 0 ? (
              <span className="text-sm text-emerald-600 font-semibold">
                متوفر ({product.stock} قطع)
              </span>
            ) : (
              <span className="text-sm text-red-600 font-semibold">نفذت الكمية</span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed mb-8 flex-1 text-lg">
            {product.description}
          </p>

          {/* Quantity & Add to Cart Controls */}
          {product.stock > 0 && (
            <div className="space-y-5 bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-gray-700">الكمية</span>
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600 active:bg-gray-200"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-14 text-center font-bold text-lg text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock - cartQty, q + 1))}
                    disabled={quantity >= product.stock - cartQty}
                    className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:hover:bg-white text-gray-600 active:bg-gray-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-lg font-bold transition-all duration-300 active:scale-[0.98] shadow-sm ${
                  adding
                    ? 'bg-emerald-500 text-white shadow-emerald-500/30'
                    : inCart
                    ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-xl hover:shadow-zinc-900/20'
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
                  className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-700 text-sm font-bold hover:border-zinc-900 hover:text-zinc-900 transition-colors bg-white"
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