import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Zustand Cart Store
 *
 * Persists the cart to localStorage so it survives page reloads.
 * Uses the 'persist' middleware from zustand/middleware.
 *
 * State shape:
 * {
 *   items: [{ _id, title, price, images, quantity }],
 *   ...actions
 * }
 */
const useCartStore = create(
  persist(
    (set, get) => ({
      // ─── State ──────────────────────────────────────────────────────────────
      items: [],

      // ─── Computed ───────────────────────────────────────────────────────────

      /** Total number of unique items in cart */
      get itemCount() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      /** Total price of all items */
      get total() {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      // ─── Actions ─────────────────────────────────────────────────────────────

      /**
       * Add a product to the cart.
       * If product already exists, increment quantity.
       * @param {object} product - { _id, title, price, images, stock }
       * @param {number} quantity - default 1
       */
      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i._id === product._id);

          if (existing) {
            // Respect stock limit
            const newQty = Math.min(
              existing.quantity + quantity,
              product.stock || 99
            );
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

      /**
       * Remove a product from the cart by ID.
       * @param {string} productId
       */
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i._id !== productId),
        }));
      },

      /**
       * Update the quantity of a cart item.
       * If quantity <= 0, removes the item.
       * @param {string} productId
       * @param {number} quantity
       */
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

      /**
       * Check if a product is already in the cart.
       * @param {string} productId
       * @returns {boolean}
       */
      isInCart: (productId) => {
        return get().items.some((i) => i._id === productId);
      },

      /**
       * Get the quantity of a specific product in the cart.
       * @param {string} productId
       * @returns {number}
       */
      getItemQuantity: (productId) => {
        const item = get().items.find((i) => i._id === productId);
        return item?.quantity || 0;
      },

      /**
       * Clear all items from the cart.
       * Called after a successful checkout.
       */
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'ecommerce-cart', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist 'items' — not computed getters
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export default useCartStore;
