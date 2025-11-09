"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface WishlistItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  image_url?: string;
  category?: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  isOpen: boolean;
  toggleWishlist: () => void;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (itemId: number) => Promise<void>;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider = ({ children }: WishlistProviderProps) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      refreshWishlist();
    } else {
      setItems([]);
    }
  }, [token]);

  const refreshWishlist = async () => {
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data.items);
      }
    } catch (error) {
      console.error('Fetch wishlist error:', error);
    }
  };

  const toggleWishlist = () => {
    setIsOpen(!isOpen);
  };

  const addToWishlist = async (productId: number) => {
    if (!token) {
      toast.error('Увійдіть в аккаунт для додавання в віш-ліст');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/wishlist/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });

      if (response.ok) {
        toast.success('Товар додано в віш-ліст!');
        await refreshWishlist();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Помилка додавання в віш-ліст');
      }
    } catch (error) {
      console.error('Add to wishlist error:', error);
      toast.error('Помилка додавання в віш-ліст');
    }
  };

  const removeFromWishlist = async (itemId: number) => {
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/wishlist/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setItems(prev => prev.filter(item => item.id !== itemId));
        toast.success('Товар видалено з віш-ліста');
      } else {
        toast.error('Помилка видалення з віш-ліста');
      }
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      toast.error('Помилка видалення з віш-ліста');
    }
  };

  const clearWishlist = async () => {
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setItems([]);
        toast.success('Віш-ліст очищено');
      } else {
        toast.error('Помилка очищення віш-ліста');
      }
    } catch (error) {
      console.error('Clear wishlist error:', error);
      toast.error('Помилка очищення віш-ліста');
    }
  };

  return (
    <WishlistContext.Provider value={{
      items,
      isOpen,
      toggleWishlist,
      addToWishlist,
      removeFromWishlist,
      clearWishlist,
      refreshWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};