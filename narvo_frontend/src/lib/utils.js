import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// دالة لدمج كلاسات Tailwind (بتاعة Shadcn)
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// دالة لتنسيق السعر بالجنيه المصري
export function formatPrice(price) {
  if (!price) return "0 EGP";
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0, // عشان نشيل القروش
  }).format(price);
}

// دالة لجلب أول صورة للمنتج أو عرض صورة بديلة لو مفيش صور
export function getProductImage(images) {
  // لو فيه صور ومبعوتة في شكل مصفوفة بنرجع أول صورة
  if (Array.isArray(images) && images.length > 0) {
    return images[0];
  }
  // لو المنتج ملوش صورة، بنعرض صورة رمادية كبديل
  return 'https://placehold.co/600x600/eeeeee/999999?text=No+Image';
}