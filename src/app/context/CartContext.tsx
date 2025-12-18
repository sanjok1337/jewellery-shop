"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated]);

  const refreshCart = async () => {
    if (!token) {
      console.log("No token, skipping cart refresh");
      return;
    }

    try {
      console.log("Refreshing cart with token:", token?.substring(0, 20) + "...");
      const response = await fetch("http://localhost:5000/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Cart refresh response status:", response.status);
      console.log("Cart refresh response headers:", response.headers.get('content-type'));

      const text = await response.text();
      console.log("Cart refresh raw response:", text.substring(0, 200));

      if (response.ok) {
        try {
          const data = JSON.parse(text);
          console.log("Cart refreshed successfully:", data);
          setCartItems(data.items || []);
        } catch (parseError) {
          console.error("Failed to parse cart response:", parseError);
          console.error("Response text:", text);
        }
      } else {
        console.error("Failed to refresh cart:", response.status, text);
      }
    } catch (error) {
      console.error("Error refreshing cart:", error);
    }
  };

  const addToCart = async (productId: number, quantity: number = 1) => {
    if (!token || !isAuthenticated) {
      toast.error("Please log in to add items to cart", {
        duration: 4000,
        icon: "🔒",
      });
      // Redirect to login page after 1 second
      setTimeout(() => {
        window.location.href = '/signin';
      }, 1500);
      return;
    }

    setLoading(true);
    try {
      console.log("Adding to cart:", { productId, quantity, token: token?.substring(0, 20) + "..." });
      const response = await fetch("http://localhost:5000/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity }),
      });

      console.log("Add to cart response status:", response.status);
      const text = await response.text();
      console.log("Add to cart raw response:", text.substring(0, 200));

      if (response.ok) {
        try {
          const data = JSON.parse(text);
          console.log("Added to cart:", data);
          toast.success("Product added to cart");
          await refreshCart();
        } catch (parseError) {
          console.error("Failed to parse add response:", parseError);
          console.error("Response text:", text);
          toast.error("Error processing response");
        }
      } else {
        try {
          const error = JSON.parse(text);
          toast.error(error.message || "Error adding to cart");
        } catch {
          toast.error("Error adding to cart: " + text.substring(0, 100));
        }
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Error adding to cart");
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    if (!token) return;

    setLoading(true);
    try {
      console.log("Removing from cart:", cartItemId);
      const response = await fetch(`http://localhost:5000/api/cart/${cartItemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("Product removed from cart");
        await refreshCart();
      } else {
        toast.error("Error removing from cart");
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Error removing from cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    if (!token) return;

    setLoading(true);
    try {
      console.log("Updating cart quantity:", { cartItemId, quantity });
      const response = await fetch(`http://localhost:5000/api/cart/${cartItemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        await refreshCart();
      } else {
        toast.error("Error updating quantity");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Error updating quantity");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        refreshCart,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
