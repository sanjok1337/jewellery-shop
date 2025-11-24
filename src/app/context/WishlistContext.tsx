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
  toggleWishlistItem: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
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

    console.log('🔄 Оновлюємо wishlist...');

    try {
      const response = await fetch('http://localhost:5000/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 Wishlist response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Wishlist data:', data);
        setItems(data.items || []);
        console.log('✅ Wishlist оновлено, кількість товарів:', data.items?.length || 0);
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

    console.log('🔄 Додаємо товар до wishlist:', productId);
    console.log('🔑 Token:', token ? 'є' : 'немає');

    try {
      const response = await fetch('http://localhost:5000/api/wishlist/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        toast.success('Товар додано в віш-ліст!');
        await refreshWishlist();
        console.log('✅ Товар додано до wishlist');
      } else {
        const data = await response.json();
        console.log('❌ Помилка:', data);
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

  const isInWishlist = (productId: number): boolean => {
    return items.some(item => item.product_id === productId);
  };

  const toggleWishlistItem = async (productId: number) => {
    if (!token) {
      toast.error('Увійдіть в аккаунт для додавання в віш-ліст');
      return;
    }

    const existingItem = items.find(item => item.product_id === productId);
    
    if (existingItem) {
      // Видаляємо з wishlist
      await removeFromWishlist(existingItem.id);
    } else {
      // Додаємо в wishlist
      await addToWishlist(productId);
    }
  };

  return (
    <WishlistContext.Provider value={{
      items,
      isOpen,
      toggleWishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlistItem,
      isInWishlist,
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