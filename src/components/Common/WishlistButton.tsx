"use client";
import React from 'react';
import { useWishlist } from '@/app/context/WishlistContext';

interface WishlistButtonProps {
  productId: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const WishlistButton = ({ productId, className = '', size = 'md' }: WishlistButtonProps) => {
  const { toggleWishlistItem, isInWishlist } = useWishlist();

  const inWishlist = isInWishlist(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🖱️ Wishlist button clicked for product:', productId);
    console.log('❤️ Is in wishlist:', inWishlist);
    toggleWishlistItem(productId);
  };

  // Розміри в залежності від size
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={handleClick}
      className={`
        flex items-center justify-center ${sizeClasses[size]} 
        rounded-md shadow-sm transition-all duration-200
        ${inWishlist 
          ? 'bg-red-50 border border-red-200 text-red-500 hover:bg-red-100' 
          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-red-200 hover:text-red-500'
        }
        ${className}
      `}
      title={inWishlist ? "Видалити зі списку бажань" : "Додати в список бажань"}
    >
      <svg
        className={`${iconSizes[size]} transition-all duration-200 ${inWishlist ? 'fill-red-500' : 'fill-none'}`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
};

export default WishlistButton;