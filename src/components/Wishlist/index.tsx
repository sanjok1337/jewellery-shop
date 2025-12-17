"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useAuth } from "@/app/context/AuthContext";
import { useWishlist } from "@/app/context/WishlistContext";
import SingleItem from "./SingleItem";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface WishlistItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  image_url?: string;
  category?: string;
}

export const Wishlist = () => {
  const { user, token } = useAuth();
  const router = useRouter();
  const { items: contextItems, refreshWishlist: contextRefresh } = useWishlist();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/signin');
      return;
    }
    fetchWishlist();
  }, [token]);

  useEffect(() => {
    setWishlistItems(contextItems);
  }, [contextItems]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data.items);
      } else {
        toast.error('Помилка завантаження віш-ліста');
      }
    } catch (error) {
      console.error('Fetch wishlist error:', error);
      toast.error('Помилка завантаження віш-ліста');
    } finally {
      setLoading(false);
    }
  };

  const clearWishlist = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setWishlistItems([]);
        toast.success('Віш-ліст очищено');
      } else {
        toast.error('Помилка очищення віш-ліста');
      }
    } catch (error) {
      console.error('Clear wishlist error:', error);
      toast.error('Помилка очищення віш-ліста');
    }
  };

  const removeFromWishlist = async (itemId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/wishlist/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.id !== itemId));
        await contextRefresh();
        toast.success('Product видалено з віш-ліста');
      } else {
        toast.error('Помилка видалення з віш-ліста');
      }
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      toast.error('Помилка видалення з віш-ліста');
    }
  };

  return (
    <>
      <Breadcrumb title={"Wishlist"} pages={["Wishlist"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
            <h2 className="font-medium text-dark text-2xl">
              Your Wishlist {wishlistItems.length > 0 && `(${wishlistItems.length})`}
            </h2>
            {wishlistItems.length > 0 && (
              <button 
                onClick={clearWishlist}
                className="text-blue hover:text-red transition-colors"
              >
                Clear Wishlist
              </button>
            )}
          </div>

          <div className="bg-white rounded-[10px] shadow-1">
            {loading ? (
              <div className="py-20 text-center">
                <p>Завантаження віш-ліста...</p>
              </div>
            ) : wishlistItems.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-gray-600 mb-4">Your Wishlist порожній</p>
                <button 
                  onClick={() => router.push('/shop-without-sidebar')}
                  className="bg-red text-white px-6 py-3 rounded hover:bg-red/90 transition-colors"
                >
                  Перейти до покупок
                </button>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <div className="min-w-[1170px]">
                  {/* <!-- table header --> */}
                  <div className="flex items-center py-5.5 px-10">
                    <div className="min-w-[83px]"></div>
                    <div className="min-w-[387px]">
                      <p className="text-dark">Product</p>
                    </div>

                    <div className="min-w-[205px]">
                      <p className="text-dark">Price</p>
                    </div>

                    <div className="min-w-[265px]">
                      <p className="text-dark">Category</p>
                    </div>

                    <div className="min-w-[150px]">
                      <p className="text-dark text-right">Actions</p>
                    </div>
                  </div>

                  {/* <!-- wish item --> */}
                  {wishlistItems.map((item) => (
                    <SingleItem 
                      key={item.id} 
                      item={item} 
                      onRemove={() => removeFromWishlist(item.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};
