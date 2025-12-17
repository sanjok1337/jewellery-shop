"use client";
import React from "react";
import Image from "next/image";
import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { updateproductDetails } from "@/redux/features/product-details";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { useWishlist } from "@/app/context/WishlistContext";
import { useCart } from "@/app/context/CartContext";
import WishlistButton from "@/components/Common/WishlistButton";
import Link from "next/link";

const ProductItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();
  const { addToCart } = useCart();
  const dispatch = useDispatch<AppDispatch>();

  // update the QuickView state
  const handleQuickViewUpdate = () => {
    dispatch(updateQuickView({ ...item }));
  };

  // add to cart
  const handleAddToCart = () => {
    addToCart(item.id, 1);
  };



  const handleProductDetails = () => {
    dispatch(updateproductDetails({ ...item }));
  };

  return (
    <div className={`group ${item.stock === 0 ? 'opacity-75' : ''}`}>
      <div className="relative overflow-hidden flex items-center justify-center rounded-2xl bg-gradient-to-br from-champagne-light to-white min-h-[270px] mb-4 border border-gold-light-3 shadow-sm hover:shadow-lg transition-all duration-300">
        <Link href={`/products/${item.id}`}>
          <Image src={item.imgs.previews[0]} alt="" width={250} height={250} className="cursor-pointer transition-transform duration-500 group-hover:scale-105 rounded-xl" />
        </Link>

        <div className="absolute left-0 bottom-0 translate-y-full w-full flex items-center justify-center gap-2.5 pb-5 ease-linear duration-200 group-hover:translate-y-0 bg-gradient-to-t from-white/90 to-transparent pt-8">
          <button
            onClick={() => {
              openModal(item.id);
            }}
            id="newOne"
            aria-label="button for quick view"
            className="flex items-center justify-center w-10 h-10 rounded-full shadow-lg ease-out duration-200 text-gold-dark bg-white hover:bg-gold hover:text-white border border-gold-light-2"
          >
            <svg
              className="fill-current"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.00016 5.5C6.61945 5.5 5.50016 6.61929 5.50016 8C5.50016 9.38071 6.61945 10.5 8.00016 10.5C9.38087 10.5 10.5002 9.38071 10.5002 8C10.5002 6.61929 9.38087 5.5 8.00016 5.5ZM6.50016 8C6.50016 7.17157 7.17174 6.5 8.00016 6.5C8.82859 6.5 9.50016 7.17157 9.50016 8C9.50016 8.82842 8.82859 9.5 8.00016 9.5C7.17174 9.5 6.50016 8.82842 6.50016 8Z"
                fill=""
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.00016 2.16666C4.99074 2.16666 2.96369 3.96946 1.78721 5.49791L1.76599 5.52546C1.49992 5.87102 1.25487 6.18928 1.08862 6.5656C0.910592 6.96858 0.833496 7.40779 0.833496 8C0.833496 8.5922 0.910592 9.03142 1.08862 9.4344C1.25487 9.81072 1.49992 10.129 1.76599 10.4745L1.78721 10.5021C2.96369 12.0305 4.99074 13.8333 8.00016 13.8333C11.0096 13.8333 13.0366 12.0305 14.2131 10.5021L14.2343 10.4745C14.5004 10.129 14.7455 9.81072 14.9117 9.4344C15.0897 9.03142 15.1668 8.5922 15.1668 8C15.1668 7.40779 15.0897 6.96858 14.9117 6.5656C14.7455 6.18927 14.5004 5.87101 14.2343 5.52545L14.2131 5.49791C13.0366 3.96946 11.0096 2.16666 8.00016 2.16666ZM2.57964 6.10786C3.66592 4.69661 5.43374 3.16666 8.00016 3.16666C10.5666 3.16666 12.3344 4.69661 13.4207 6.10786C13.7131 6.48772 13.8843 6.7147 13.997 6.9697C14.1023 7.20801 14.1668 7.49929 14.1668 8C14.1668 8.50071 14.1023 8.79199 13.997 9.0303C13.8843 9.28529 13.7131 9.51227 13.4207 9.89213C12.3344 11.3034 10.5666 12.8333 8.00016 12.8333C5.43374 12.8333 3.66592 11.3034 2.57964 9.89213C2.28725 9.51227 2.11599 9.28529 2.00334 9.0303C1.89805 8.79199 1.8335 8.50071 1.8335 8C1.8335 7.49929 1.89805 7.20801 2.00334 6.9697C2.11599 6.7147 2.28725 6.48772 2.57964 6.10786Z"
                fill=""
              />
            </svg>
          </button>

          <button
            onClick={() => handleAddToCart()}
            className="inline-flex font-medium text-custom-sm py-2 px-5 rounded-full bg-gradient-to-r from-gold to-gold-dark text-white ease-out duration-200 hover:from-gold-dark hover:to-gold shadow-md"
          >
            Add to cart
          </button>

          <WishlistButton productId={item.id} size="md" />
        </div>
      </div>

      <div className="flex items-center gap-2.5 mb-2">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          ))}
        </div>

        <p className="text-custom-sm text-gray-500">({item.reviews} reviews)</p>
      </div>

      <h3
        className="font-semibold text-dark ease-out duration-200 hover:text-gold mb-1.5 cursor-pointer"
        onClick={() => handleProductDetails()}
      >
        <Link href={`/products/${item.id}`}> {item.title} </Link>
      </h3>

      <span className="flex items-center gap-2 font-medium text-lg">
        <span className="text-gold-dark font-bold">${item.discountedPrice}</span>
        <span className="text-gray-400 line-through text-sm">${item.price}</span>
      </span>
      
      {/* Stock Status */}
      {item.stock !== undefined && (
        <div className="mt-2">
          {item.stock === 0 ? (
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-rose-light text-rose-dark rounded-full">
              <span className="w-2 h-2 bg-rose rounded-full mr-1.5"></span>
              Out of Stock
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">
              <svg className="w-3 h-3 mr-1.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
              In Stock
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductItem;
