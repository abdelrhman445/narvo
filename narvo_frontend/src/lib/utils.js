import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// وظيفة دمج كلاسات Tailwind (موجودة غالباً عندك)
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// 1. وظيفة تنسيق التاريخ (اللي ناقصة عندك)
export function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// 2. وظيفة ألوان حالة الطلب (اللي ناقصة عندك)
export function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "processing":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "shipped":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "delivered":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "cancelled":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

// 3. وظيفة تنسيق السعر (عشان نضمن إنها موجودة)
export function formatPrice(price) {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
  }).format(price);
}

// 4. وظيفة جلب صورة المنتج
export function getProductImage(images) {
  if (images && images.length > 0) return images[0];
  return "https://placehold.co/600x600/eeeeee/999999?text=No+Image";
}