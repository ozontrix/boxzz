"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import type { CartItem, Product, Address, User, Order, OrderStatus, ProductVariant } from "@/types";
import { CONTACT_INFO } from "@/lib/constants";
import {
  getCurrentSession,
  signIn as apiSignIn,
  signUp as apiSignUp,
  signOut as apiSignOut,
  resendVerificationEmail as apiResendVerificationEmail,
} from "@/lib/api/auth";
import { getShippingConfig, type ShippingConfig, getContactInfo, type ContactInfo } from "@/lib/api/db";
import {
  getUserAddresses,
  addAddress as apiAddAddress,
  updateAddress as apiUpdateAddress,
  deleteAddress as apiDeleteAddress,
  setDefaultAddressInDb,
  getUserOrders,
} from "@/lib/api/db";

// ─── State Types ──────────────────────────────────────────────────

interface CartState {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  gst: number;
  total: number;
  config: ShippingConfig;
}

interface WishlistState {
  items: Product[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
}

interface AppState {
  cart: CartState;
  wishlist: WishlistState;
  auth: AuthState;
  toasts: Toast[];
  checkoutAddress: Address | null;
  orders: Order[];
  savedAddresses: Address[];
  contact: ContactInfo;
}

type Action =
  | { type: "CART_ADD_ITEM"; payload: { product: Product; quantity: number; variant?: ProductVariant | null; variantName?: string } }
  | { type: "CART_REMOVE_ITEM"; payload: { productId: string; variantId?: string } }
  | { type: "CART_UPDATE_QUANTITY"; payload: { productId: string; variantId?: string; quantity: number } }
  | { type: "CART_CLEAR" }
  | { type: "CART_SET_CONFIG"; payload: ShippingConfig }
  | { type: "WISHLIST_ADD_ITEM"; payload: Product }
  | { type: "WISHLIST_REMOVE_ITEM"; payload: { productId: string } }
  | { type: "AUTH_LOGIN"; payload: User }
  | { type: "AUTH_LOGOUT" }
  | { type: "AUTH_SET_LOADING"; payload: boolean }
  | { type: "AUTH_UPDATE_USER"; payload: User }
  | { type: "ADD_TOAST"; payload: Toast }
  | { type: "REMOVE_TOAST"; payload: { id: string } }
  | { type: "SET_CHECKOUT_ADDRESS"; payload: Address | null }
  | { type: "ADD_ORDER"; payload: Order }
  | { type: "UPDATE_ORDER_STATUS"; payload: { orderId: string; status: OrderStatus } }
  | { type: "SET_ORDERS"; payload: Order[] }
  | { type: "ADD_ADDRESS"; payload: Address }
  | { type: "UPDATE_ADDRESS"; payload: Address }
  | { type: "REMOVE_ADDRESS"; payload: { addressId: string } }
  | { type: "SET_DEFAULT_ADDRESS"; payload: { addressId: string } }
  | { type: "SET_ADDRESSES"; payload: Address[] }
  | { type: "CONTACT_SET"; payload: ContactInfo }
  | { type: "HYDRATE"; payload: Partial<AppState> };

const STORAGE_KEY = "boxzz_store";
const CART_KEY = "boxzz_cart";
const SHIPPING_CONFIG_KEY = "boxzz_shipping_config";

let cachedShippingConfig: ShippingConfig | null = null;

export async function refreshShippingConfig(): Promise<ShippingConfig> {
  try {
    const config = await getShippingConfig();
    cachedShippingConfig = config;
    if (typeof window !== "undefined") {
      localStorage.setItem(SHIPPING_CONFIG_KEY, JSON.stringify(config));
    }
    return config;
  } catch (e) {
    return getFallbackConfig();
  }
}

function getFallbackConfig(): ShippingConfig {
  return {
    standardCharge: 149,
    freeThreshold: 2499,
    gstRate: 0.12,
    methods: [],
  };
}

function getCachedConfig(): ShippingConfig {
  if (cachedShippingConfig) return cachedShippingConfig;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(SHIPPING_CONFIG_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        cachedShippingConfig = parsed;
        return parsed;
      }
    } catch {}
  }
  return getFallbackConfig();
}

function calculateCart(items: CartItem[], config?: ShippingConfig): Omit<CartState, "items"> {
  const cfg = config || getCachedConfig();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= cfg.freeThreshold ? 0 : cfg.standardCharge;
  const gst = Math.round(subtotal * (cfg.gstRate || 0.12));
  const total = subtotal + shipping + gst;
  return { subtotal, shipping, gst, total, config: cfg };
}

// Check if window is defined (avoids SSR issues)
const isBrowser = typeof window !== "undefined";

// Load cart from localStorage synchronously on module load
function loadInitialCart(): CartState {
  if (!isBrowser)
    return { items: [], subtotal: 0, shipping: 0, gst: 0, total: 0, config: getCachedConfig() };
  try {
    const stored = localStorage.getItem(CART_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && Array.isArray(parsed.items)) {
        const cartCalc = calculateCart(parsed.items);
        return { items: parsed.items, ...cartCalc };
      }
    }
  } catch (e) {
    console.warn("Failed to load cart from localStorage:", e);
  }
  return { items: [], subtotal: 0, shipping: 0, gst: 0, total: 0, config: getCachedConfig() };
}

// Load wishlist from localStorage synchronously on module load
function loadInitialWishlist(): WishlistState {
  if (!isBrowser) return { items: [] };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.wishlist) return parsed.wishlist;
    }
  } catch {}
  return { items: [] };
}

const initialState: AppState = {
  cart: loadInitialCart(),
  wishlist: loadInitialWishlist(),
  auth: { user: null, isAuthenticated: false, isLoading: true },
  toasts: [],
  checkoutAddress: null,
  orders: [],
  savedAddresses: [],
  contact: { ...CONTACT_INFO },
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "CART_ADD_ITEM": {
      const { product, quantity, variant, variantName } = action.payload;
      const existingIndex = state.cart.items.findIndex(
        (item) =>
          item.productId === product.id &&
          ((!variant && !item.variantId) ||
            (variant && item.variantId === variant.id))
      );

      let newItems: CartItem[];
      if (existingIndex >= 0) {
        newItems = state.cart.items.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: Math.max(item.quantity + quantity, product.moq) }
            : item
        );
      } else {
        const imageUrl = product.images?.[0] || "📦";
        const variantPrice = variant?.price ?? product.price;
        const variantMrp = variant?.mrp ?? product.originalPrice ?? variantPrice;
        const newItem: CartItem = {
          productId: product.id,
          name: product.name,
          price: variantPrice,
          mrp: variantMrp,
          quantity: Math.max(quantity, product.moq),
          image: imageUrl,
          variant: variant?.label ?? variantName ?? variant?.value ?? "",
          variantId: variant?.id,
          variantLabel: variant?.label ?? variantName ?? variant?.value ?? "",
          sku: variant?.sku,
          shippingWeight: variant?.weight,
        };
        newItems = [...state.cart.items, newItem];
      }

      const cartCalc = calculateCart(newItems);
      return { ...state, cart: { items: newItems, ...cartCalc } };
    }

    case "CART_REMOVE_ITEM": {
      const { productId, variantId } = action.payload;
      const newItems = state.cart.items.filter(
        (item) =>
          item.productId !== productId ||
          (variantId ? item.variantId !== variantId : false)
      );
      const cartCalc = calculateCart(newItems);
      return { ...state, cart: { items: newItems, ...cartCalc } };
    }

    case "CART_UPDATE_QUANTITY": {
      const { productId, variantId, quantity } = action.payload;
      const newItems = state.cart.items.map((item) =>
        item.productId === productId &&
        (!variantId || item.variantId === variantId)
          ? { ...item, quantity: Math.max(quantity, 1) }
          : item
      );
      const cartCalc = calculateCart(newItems);
      return { ...state, cart: { items: newItems, ...cartCalc } };
    }

    case "CART_CLEAR":
      return {
        ...state,
        cart: {
          items: [],
          subtotal: 0,
          shipping: 0,
          gst: 0,
          total: 0,
          config: state.cart.config,
        },
      };

    case "CART_SET_CONFIG": {
      const cartCalc = calculateCart(state.cart.items, action.payload);
      return { ...state, cart: { items: state.cart.items, ...cartCalc } };
    }

    case "WISHLIST_ADD_ITEM": {
      const exists = state.wishlist.items.find(
        (item) => item.id === action.payload.id
      );
      if (exists) return state;
      return {
        ...state,
        wishlist: { items: [...state.wishlist.items, action.payload] },
      };
    }

    case "WISHLIST_REMOVE_ITEM": {
      return {
        ...state,
        wishlist: {
          items: state.wishlist.items.filter(
            (item) => item.id !== action.payload.productId
          ),
        },
      };
    }

    case "AUTH_LOGIN":
      return {
        ...state,
        auth: { user: action.payload, isAuthenticated: true, isLoading: false },
      };

    case "AUTH_LOGOUT":
      return {
        ...state,
        auth: { user: null, isAuthenticated: false, isLoading: false },
        orders: [],
        savedAddresses: [],
      };

    case "AUTH_SET_LOADING":
      return {
        ...state,
        auth: { ...state.auth, isLoading: action.payload },
      };

    case "AUTH_UPDATE_USER":
      return {
        ...state,
        auth: { ...state.auth, user: action.payload },
      };

    case "ADD_TOAST":
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      };

    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload.id),
      };

    case "SET_CHECKOUT_ADDRESS":
      return {
        ...state,
        checkoutAddress: action.payload,
      };

    case "ADD_ORDER":
      return {
        ...state,
        orders: [action.payload, ...state.orders],
      };

    case "UPDATE_ORDER_STATUS":
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.payload.orderId
            ? { ...o, status: action.payload.status }
            : o
        ),
      };

    case "SET_ORDERS":
      return {
        ...state,
        orders: action.payload,
      };

    case "ADD_ADDRESS":
      return {
        ...state,
        savedAddresses: [...state.savedAddresses, action.payload],
      };

    case "UPDATE_ADDRESS":
      return {
        ...state,
        savedAddresses: state.savedAddresses.map((a) =>
          a.id === action.payload.id ? action.payload : a
        ),
      };

    case "REMOVE_ADDRESS":
      return {
        ...state,
        savedAddresses: state.savedAddresses.filter(
          (a) => a.id !== action.payload.addressId
        ),
      };

    case "SET_DEFAULT_ADDRESS":
      return {
        ...state,
        savedAddresses: state.savedAddresses.map((a) => ({
          ...a,
          isDefault: a.id === action.payload.addressId,
        })),
      };

    case "SET_ADDRESSES":
      return {
        ...state,
        savedAddresses: action.payload,
      };

    case "CONTACT_SET":
      return {
        ...state,
        contact: action.payload,
      };

    case "HYDRATE":
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addToCart: (product: Product, quantity?: number, variant?: ProductVariant | null, variantName?: string) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  isInCart: (productId: string, variantId?: string) => boolean;
  getCartQuantity: (productId: string, variantId?: string) => number;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; emailNotConfirmed?: boolean }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean }>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  showToast: (type: Toast["type"], title: string, message?: string) => void;
  removeToast: (id: string) => void;
  setCheckoutAddress: (address: Address | null) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addAddress: (address: Omit<Address, "id">) => Promise<void>;
  updateAddress: (address: Address) => Promise<void>;
  removeAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => void;
  getDefaultAddress: () => Address | undefined;
  refreshUserData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── Toast Generator ──────────────────────────────────────────────

let toastCounter = 0;
function generateToast(
  type: Toast["type"],
  title: string,
  message?: string
): Toast {
  toastCounter++;
  return {
    id: `toast-${Date.now()}-${toastCounter}`,
    type,
    title,
    message,
  };
}

// ─── Provider ─────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Sync cart to localStorage on every cart change
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
    } catch (e) {
      console.warn("Failed to persist cart:", e);
    }
  }, [state.cart]);

  // Fetch live shipping/GST config from DB on mount so
  // cart & checkout always use the admin-configured values
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const config = await refreshShippingConfig();
      if (!cancelled) {
        dispatch({ type: "CART_SET_CONFIG", payload: config });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch live contact info from DB on mount so the header, footer
  // & all shop pages show the admin-configured values
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const contact = await getContactInfo();
      if (!cancelled) {
        dispatch({ type: "CONTACT_SET", payload: contact });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);


  // Sync wishlist to localStorage
  useEffect(() => {
    try {
      const { toasts, checkoutAddress, auth, cart, orders, savedAddresses, ...persistable } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
    } catch (e) {
      console.warn("Failed to persist store:", e);
    }
  }, [state.wishlist]);

  // Check auth session on mount and fetch DB data
  useEffect(() => {
    async function checkAuth() {
      try {
        const { user } = await getCurrentSession();
        if (user) {
          dispatch({ type: "AUTH_LOGIN", payload: user });
          // Fetch orders and addresses from DB
          const [orders, addresses] = await Promise.all([
            getUserOrders(user.id),
            getUserAddresses(user.id),
          ]);
          dispatch({ type: "SET_ORDERS", payload: orders });
          dispatch({ type: "SET_ADDRESSES", payload: addresses });
        } else {
          dispatch({ type: "AUTH_SET_LOADING", payload: false });
        }
      } catch {
        dispatch({ type: "AUTH_SET_LOADING", payload: false });
      }
    }
    checkAuth();
  }, []);

  const refreshUserData = useCallback(async () => {
    const user = state.auth.user;
    if (!user) return;
    try {
      const [orders, addresses] = await Promise.all([
        getUserOrders(user.id),
        getUserAddresses(user.id),
      ]);
      dispatch({ type: "SET_ORDERS", payload: orders });
      dispatch({ type: "SET_ADDRESSES", payload: addresses });
    } catch (e) {
      console.error("refreshUserData error:", e);
    }
  }, [state.auth.user]);

  const addToCart = useCallback(
    (product: Product, quantity = 1, variant?: ProductVariant | null, variantName?: string) => {
      dispatch({
        type: "CART_ADD_ITEM",
        payload: { product, quantity, variant, variantName },
      });
      dispatch({
        type: "ADD_TOAST",
        payload: generateToast("success", "Added to Cart", `${product.name} has been added to your cart.`),
      });
    },
    []
  );

  const removeFromCart = useCallback((productId: string, variantId?: string) => {
    dispatch({ type: "CART_REMOVE_ITEM", payload: { productId, variantId } });
    dispatch({
      type: "ADD_TOAST",
      payload: generateToast("info", "Removed from Cart", "Item has been removed from your cart."),
    });
  }, []);

  const updateCartQuantity = useCallback(
    (productId: string, quantity: number, variantId?: string) => {
      dispatch({ type: "CART_UPDATE_QUANTITY", payload: { productId, variantId, quantity } });
    },
    []
  );

  const clearCart = useCallback(() => {
    dispatch({ type: "CART_CLEAR" });
  }, []);

  const addToWishlist = useCallback((product: Product) => {
    const exists = state.wishlist.items.find((item) => item.id === product.id);
    if (exists) {
      dispatch({
        type: "ADD_TOAST",
        payload: generateToast("warning", "Already in Wishlist", `${product.name} is already in your wishlist.`),
      });
      return;
    }
    dispatch({ type: "WISHLIST_ADD_ITEM", payload: product });
    dispatch({
      type: "ADD_TOAST",
      payload: generateToast("success", "Added to Wishlist", `${product.name} has been saved.`),
    });
  }, [state.wishlist.items]);

  const removeFromWishlist = useCallback((productId: string) => {
    dispatch({ type: "WISHLIST_REMOVE_ITEM", payload: { productId } });
    dispatch({
      type: "ADD_TOAST",
      payload: generateToast("info", "Removed from Wishlist", "Item has been removed from your wishlist."),
    });
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => {
      return state.wishlist.items.some((item) => item.id === productId);
    },
    [state.wishlist.items]
  );

  const isInCart = useCallback(
    (productId: string, variantId?: string) => {
      return state.cart.items.some(
        (item) =>
          item.productId === productId &&
          (!variantId || item.variantId === variantId)
      );
    },
    [state.cart.items]
  );

  const getCartQuantity = useCallback(
    (productId: string, variantId?: string) => {
      const item = state.cart.items.find(
        (it) =>
          it.productId === productId &&
          (!variantId || it.variantId === variantId)
      );
      return item?.quantity || 0;
    },
    [state.cart.items]
  );

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiSignIn(email, password);
    if (result.user) {
      dispatch({ type: "AUTH_LOGIN", payload: result.user });
      // Fetch DB data after login
      getUserOrders(result.user.id).then(orders => dispatch({ type: "SET_ORDERS", payload: orders }));
      getUserAddresses(result.user.id).then(addrs => dispatch({ type: "SET_ADDRESSES", payload: addrs }));
      dispatch({
        type: "ADD_TOAST",
        payload: generateToast("success", "Welcome back!", `Signed in as ${result.user.name}`),
      });
      return { success: true };
    }
    if (result.emailNotConfirmed) {
      return {
        success: false,
        error: result.error || "Email not confirmed",
        emailNotConfirmed: true,
      };
    }
    return { success: false, error: result.error || "Login failed" };
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const result = await apiSignUp(email, password, name);
    if (result.user) {
      // Only auto sign-in if the session exists (email confirmation disabled)
      if (result.requiresEmailConfirmation || !result.user.emailConfirmed) {
        dispatch({
          type: "ADD_TOAST",
          payload: generateToast("info", "Verify your email", `We sent a verification link to ${result.user.email}.`),
        });
        return {
          success: true,
          requiresEmailConfirmation: true,
        };
      }
      dispatch({ type: "AUTH_LOGIN", payload: result.user });
      dispatch({
        type: "ADD_TOAST",
        payload: generateToast("success", "Account created!", `Welcome, ${result.user.name}!`),
      });
      return { success: true };
    }
    return { success: false, error: result.error || "Sign up failed" };
  }, []);

  const resendVerificationEmail = useCallback(async (email: string) => {
    const result = await apiResendVerificationEmail(email);
    if (result.sent) {
      dispatch({
        type: "ADD_TOAST",
        payload: generateToast("success", "Email Sent", `Verification email sent to ${email}.`),
      });
      return { success: true };
    }
    dispatch({
      type: "ADD_TOAST",
      payload: generateToast("error", "Failed to Send", result.error || "Could not resend verification email."),
    });
    return { success: false, error: result.error || "Failed to resend verification email" };
  }, []);

  const logout = useCallback(async () => {
    await apiSignOut();
    dispatch({ type: "AUTH_LOGOUT" });
    // Clear persisted store data so no stale auth state remains
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CART_KEY);
      localStorage.removeItem(SHIPPING_CONFIG_KEY);
    } catch (e) {
      console.warn("Failed to clear store:", e);
    }
    // Full page reload so every component (header, account, ui) reflects logged-out state
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }, []);

  const showToast = useCallback(
    (type: Toast["type"], title: string, message?: string) => {
      dispatch({
        type: "ADD_TOAST",
        payload: generateToast(type, title, message),
      });
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    dispatch({ type: "REMOVE_TOAST", payload: { id } });
  }, []);

  const setCheckoutAddress = useCallback((address: Address | null) => {
    dispatch({ type: "SET_CHECKOUT_ADDRESS", payload: address });
  }, []);

  const addOrder = useCallback((order: Order) => {
    dispatch({ type: "ADD_ORDER", payload: order });
    dispatch({
      type: "ADD_TOAST",
      payload: generateToast("success", "Order Placed!", `Your order ${order.id} has been confirmed.`),
    });
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    dispatch({ type: "UPDATE_ORDER_STATUS", payload: { orderId, status } });
  }, []);

  const addAddress = useCallback(async (address: Omit<Address, "id">) => {
    const user = state.auth.user;
    if (!user) {
      dispatch({
        type: "ADD_TOAST",
        payload: generateToast("error", "Not signed in", "Please sign in to save addresses."),
      });
      return;
    }
    const saved = await apiAddAddress(user.id, address);
    if (saved) {
      dispatch({ type: "ADD_ADDRESS", payload: saved });
      dispatch({
        type: "ADD_TOAST",
        payload: generateToast("success", "Address Saved", "Your address has been saved to your account."),
      });
    } else {
      dispatch({
        type: "ADD_TOAST",
        payload: generateToast("error", "Failed to Save", "Could not save address. Please try again."),
      });
    }
  }, [state.auth.user]);

  const updateAddress = useCallback(async (address: Address) => {
    const success = await apiUpdateAddress(address);
    if (success) {
      dispatch({ type: "UPDATE_ADDRESS", payload: address });
      dispatch({
        type: "ADD_TOAST",
        payload: generateToast("success", "Address Updated", "Your address has been updated."),
      });
    } else {
      dispatch({
        type: "ADD_TOAST",
        payload: generateToast("error", "Update Failed", "Could not update address."),
      });
    }
  }, []);

  const removeAddress = useCallback(async (addressId: string) => {
    const success = await apiDeleteAddress(addressId);
    if (success) {
      dispatch({ type: "REMOVE_ADDRESS", payload: { addressId } });
      dispatch({
        type: "ADD_TOAST",
        payload: generateToast("info", "Address Removed", "Address has been removed."),
      });
    } else {
      dispatch({
        type: "ADD_TOAST",
        payload: generateToast("error", "Delete Failed", "Could not remove address."),
      });
    }
  }, []);

  const setDefaultAddress = useCallback(async (addressId: string) => {
    const user = state.auth.user;
    if (!user) return;
    const success = await setDefaultAddressInDb(addressId, user.id);
    if (success) {
      dispatch({ type: "SET_DEFAULT_ADDRESS", payload: { addressId } });
      dispatch({
        type: "ADD_TOAST",
        payload: generateToast("success", "Default Address Set", "This is now your default address."),
      });
    }
  }, [state.auth.user]);

  const getDefaultAddress = useCallback((): Address | undefined => {
    return state.savedAddresses.find((a) => a.isDefault) || state.savedAddresses[0];
  }, [state.savedAddresses]);

  const value: AppContextType = {
    state,
    dispatch,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    isInCart,
    getCartQuantity,
    login,
    signUp,
    resendVerificationEmail,
    logout,
    showToast,
    removeToast,
    setCheckoutAddress,
    addOrder,
    updateOrderStatus,
    addAddress,
    updateAddress,
    removeAddress,
    setDefaultAddress,
    getDefaultAddress,
    refreshUserData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      <ToastContainer />
    </AppContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

// ─── Toast Container ──────────────────────────────────────────────

function ToastContainer() {
  const { state, removeToast } = useApp();

  useEffect(() => {
    if (state.toasts.length === 0) return;
    const timers = state.toasts.map((toast) =>
      setTimeout(() => removeToast(toast.id), 4000)
    );
    return () => timers.forEach(clearTimeout);
  }, [state.toasts, removeToast]);

  if (state.toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {state.toasts.map((toast) => {
        const colors = {
          success: {
            bg: "bg-success",
            border: "border-success",
            icon: "✓",
          },
          error: {
            bg: "bg-error",
            border: "border-error",
            icon: "✕",
          },
          warning: {
            bg: "bg-warning",
            border: "border-warning",
            icon: "⚠",
          },
          info: {
            bg: "bg-primary",
            border: "border-primary",
            icon: "ℹ",
          },
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto animate-slide-up flex items-start gap-3 p-4 rounded-xl border ${colors.border} bg-white shadow-lg`}
          >
            <div
              className={`w-6 h-6 rounded-full ${colors.bg} flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5`}
            >
              {colors.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-800">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-zinc-500 mt-0.5">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-400 hover:text-zinc-600 transition-colors shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}