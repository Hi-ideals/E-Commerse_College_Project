import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { cartApi } from "../api/cart.api";
import { productsApi } from "../api/products.api";
import { extractErrorMessage } from "../api/axiosClient";
import { guestCart } from "../utils/guestCart";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

const EMPTY_CART = { items: [], itemCount: 0, subtotal: 0 };

function summarize(items) {
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  return {
    items,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: Number(subtotal.toFixed(2)),
  };
}

/**
 * Builds a cart view (same shape as the server cart) from locally-stored
 * {productId, quantity} entries, by fetching each product's current details.
 * Entries whose product no longer exists or was deactivated are silently
 * dropped from the view.
 */
async function buildGuestCartView(entries) {
  if (entries.length === 0) return EMPTY_CART;

  const results = await Promise.all(
    entries.map((e) =>
      productsApi
        .getById(e.productId)
        .then((product) => ({ entry: e, product }))
        .catch(() => null)
    )
  );

  const items = results
    .filter(Boolean)
    .map(({ entry, product }) => ({
      id: product.id, // guest cart rows are keyed by productId (no server row id yet)
      quantity: entry.quantity,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        isActive: product.isActive,
      },
      lineTotal: Number((product.price * entry.quantity).toFixed(2)),
    }));

  return summarize(items);
}

/** Pushes every guest-cart entry into the now-available server cart. */
async function mergeGuestCartIntoServer() {
  const entries = guestCart.readEntries();
  if (entries.length === 0) return;

  let mergedAny = false;
  for (const entry of entries) {
    try {
      await cartApi.add(entry.productId, entry.quantity);
      mergedAny = true;
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not carry over one item from your guest cart"));
    }
  }
  guestCart.clearEntries();
  if (mergedAny) toast.success("Your cart was carried over");
}

export function CartProvider({ children }) {
  const { isAuthenticated, initializing: authInitializing } = useAuth();
  const [cart, setCart] = useState(EMPTY_CART);
  // Starts true: until auth finishes its own silent-session check, we don't
  // yet know whether there's a cart to fetch, so consumers (like the
  // checkout empty-cart guard) must treat this window as "still loading",
  // not as "confirmed empty".
  const [loading, setLoading] = useState(true);
  const wasAuthenticated = useRef(false);

  // Fetches the current cart for whichever mode we're in right now, with NO
  // merge step. Safe to call any time after the initial load (e.g. after
  // placing an order) without re-triggering the guest-cart merge.
  const refresh = useCallback(async () => {
    if (authInitializing) return;
    setLoading(true);
    try {
      if (isAuthenticated) {
        setCart(await cartApi.get());
      } else {
        setCart(await buildGuestCartView(guestCart.readEntries()));
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authInitializing]);

  // Single coordinated effect for both the initial load AND the guest -> login
  // transition, so `loading` stays true for the *entire* merge-then-fetch
  // sequence — no window where a consumer could see a stale "empty" cart.
  useEffect(() => {
    if (authInitializing) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const justLoggedIn = isAuthenticated && !wasAuthenticated.current;
        if (justLoggedIn) {
          await mergeGuestCartIntoServer();
        }
        const next = isAuthenticated
          ? await cartApi.get()
          : await buildGuestCartView(guestCart.readEntries());
        if (!cancelled) setCart(next);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    wasAuthenticated.current = isAuthenticated;
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, authInitializing]);

  async function addItem(productId, quantity = 1) {
    if (isAuthenticated) {
      const data = await cartApi.add(productId, quantity);
      setCart(data);
      return data;
    }
    const entries = guestCart.addEntry(productId, quantity);
    const view = await buildGuestCartView(entries);
    setCart(view);
    return view;
  }

  async function updateQuantity(cartItemId, quantity) {
    if (isAuthenticated) {
      const data = await cartApi.updateQuantity(cartItemId, quantity);
      setCart(data);
      return data;
    }
    const entries = guestCart.setEntryQuantity(cartItemId, quantity);
    const view = await buildGuestCartView(entries);
    setCart(view);
    return view;
  }

  async function removeItem(cartItemId) {
    if (isAuthenticated) {
      const data = await cartApi.remove(cartItemId);
      setCart(data);
      return data;
    }
    const entries = guestCart.removeEntry(cartItemId);
    const view = await buildGuestCartView(entries);
    setCart(view);
    return view;
  }

  function clearLocal() {
    setCart(EMPTY_CART);
  }

  const value = { cart, loading, refresh, addItem, updateQuantity, removeItem, clearLocal };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
