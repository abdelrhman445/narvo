import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i._id === product._id);
          if (existing) {
            const newQty = Math.min(existing.quantity + quantity, product.stock || 99);
            return {
              items: state.items.map((i) =>
                i._id === product._id ? { ...i, quantity: newQty } : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                _id: product._id,
                title: product.title,
                price: product.price,
                oldPrice: product.oldPrice || null,
                images: product.images,
                stock: product.stock,
                quantity: Math.min(quantity, product.stock || 99),
              },
            ],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i._id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i._id === productId
              ? { ...i, quantity: Math.min(quantity, i.stock || 99) }
              : i
          ),
        }));
      },

      isInCart: (productId) => {
        return get().items.some((i) => i._id === productId);
      },

      getItemQuantity: (productId) => {
        const item = get().items.find((i) => i._id === productId);
        return item?.quantity || 0;
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'ecommerce-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export default useCartStore;