"use client";
import React from 'react';
import { useWishlist } from '@/app/context/WishlistContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const FixedWishlist = () => {
  const { items, isOpen, toggleWishlist, removeFromWishlist } = useWishlist();
  const router = useRouter();

  return (
    <>
      {/* Кнопка віш-ліста */}
      <div className="fixed bottom-20 right-4 z-50">
        <button
          onClick={toggleWishlist}
          className="relative bg-red text-white p-3 rounded-full shadow-lg hover:bg-red/90 transition-colors"
          aria-label="Відкрити віш-ліст"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-red text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
              {items.length}
            </span>
          )}
        </button>
      </div>

      {/* Панель віш-ліста */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={toggleWishlist}
          />
          
          {/* Панель */}
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* Заголовок */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">Віш-ліст ({items.length})</h3>
                <button
                  onClick={toggleWishlist}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Контент */}
              <div className="flex-1 overflow-y-auto p-4">
                {items.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 mb-4">Ваш віш-ліст порожній</p>
                    <button 
                      onClick={() => {
                        toggleWishlist();
                        router.push('/shop-without-sidebar');
                      }}
                      className="bg-red text-white px-4 py-2 rounded hover:bg-red/90 transition-colors"
                    >
                      Почати покупки
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="w-16 h-16 flex-shrink-0">
                          <Image
                            src={item.image_url || '/images/products/product-1-bg-1.png'}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 
                            className="text-sm font-medium truncate cursor-pointer hover:text-red"
                            onClick={() => {
                              toggleWishlist();
                              router.push(`/products/${item.product_id}`);
                            }}
                          >
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-600">{item.price} грн</p>
                          {item.category && (
                            <p className="text-xs text-gray-500">{item.category}</p>
                          )}
                        </div>

                        <button
                          onClick={() => removeFromWishlist(item.id)}
                          className="p-1 text-gray-400 hover:text-red"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Футер */}
              {items.length > 0 && (
                <div className="border-t p-4 space-y-2">
                  <button
                    onClick={() => {
                      toggleWishlist();
                      router.push('/wishlist');
                    }}
                    className="w-full bg-red text-white py-2 px-4 rounded hover:bg-red/90 transition-colors"
                  >
                    Переглянути весь віш-ліст
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FixedWishlist;