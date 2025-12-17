"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Newsletter from "../Common/Newsletter";
import Reviews from "./Reviews";
import { useAuth } from "@/app/context/AuthContext";
import { useWishlist } from "@/app/context/WishlistContext";
import toast from "react-hot-toast";

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
  image_url?: string;
  images?: Array<{image_url: string; is_main: boolean}>;
  stock_quantity?: number;
  created_at?: string;
}

interface ProductDetailProps {
  productId: string;
}

const ProductDetail = ({ productId }: ProductDetailProps) => {
  const router = useRouter();
  const { user, token } = useAuth();
  const { toggleWishlistItem, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}`);
      
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        toast.error('Product not found');
        router.push('/shop-without-sidebar');
      }
    } catch (error) {
      console.error('Fetch product error:', error);
      toast.error('Error loading product');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!token) {
      toast.error('Please sign in to add items to cart');
      router.push('/signin');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product?.id,
          quantity: quantity
        })
      });

      if (response.ok) {
        toast.success('Product added to cart!');
      } else {
        toast.error('Error adding to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Error adding to cart');
    }
  };

  const handleAddToWishlist = async () => {
    if (!product?.id) return;
    await toggleWishlistItem(product.id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Product not found</p>
      </div>
    );
  }

  const productImages = product.images && product.images.length > 0 
    ? product.images.map(img => img.image_url)
    : [
        product.image_url || '/images/products/product-1-bg-1.png',
        '/images/products/product-1-bg-2.png' // fallback images
      ];

  return (
    <>
      <Breadcrumb 
        title={product.name}
        pages={[
          { name: "Home", href: "/" },
          { name: "Shop", href: "/shop-without-sidebar" },
          { name: product.name }
        ]}
      />

      <section className="pb-20 pt-12.5">
        <div className="mx-auto max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <div className="grid grid-cols-1 gap-7.5 lg:grid-cols-2 xl:gap-12.5">
            
            {/* Images Section */}
            <div className="w-full">
              <div className="mb-4">
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-2 flex items-center justify-center p-4">
                  <Image
                    src={productImages[activeImage]}
                    alt={product.name}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              
              {/* Thumbnail images */}
              <div className="flex gap-2.5">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`relative aspect-square w-20 overflow-hidden rounded border-2 ${
                      activeImage === index ? 'border-red' : 'border-gray-3'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info Section */}
            <div className="w-full">
              <h1 className="mb-4 text-2xl font-bold text-dark lg:text-3xl">
                {product.name}
              </h1>

              {product.category && (
                <p className="mb-3 text-sm text-gray-6">
                  Category: <span className="text-dark">{product.category}</span>
                </p>
              )}

              <div className="mb-6">
                <p className="text-3xl font-bold text-red">
                  {product.price} $
                </p>
              </div>

              {product.description && (
                <div className="mb-6">
                  <h3 className="mb-2 text-lg font-semibold text-dark">Description</h3>
                  <p className="text-body leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Quantity and Stock */}
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <label className="mr-3 text-sm font-medium text-dark">
                      Quantity:
                    </label>
                    <div className="flex items-center">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="flex h-10 w-10 items-center justify-center border border-gray-3 text-dark hover:bg-gray-2"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="h-10 w-16 border-b border-t border-gray-3 text-center text-dark"
                        min="1"
                        max={product.stock_quantity || 999}
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="flex h-10 w-10 items-center justify-center border border-gray-3 text-dark hover:bg-gray-2"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {product.stock_quantity && (
                    <p className="text-sm text-gray-6">
                      In Stock: {product.stock_quantity} pcs.
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mb-8 flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={addToCart}
                  className="flex-1 bg-red py-3 px-6 text-white font-semibold hover:bg-red/90 transition-colors"
                  disabled={product.stock_quantity === 0}
                >
                  {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                
                <button
                  onClick={handleAddToWishlist}
                  className={`flex items-center justify-center border py-3 px-6 transition-colors ${
                    product?.id && isInWishlist(product.id)
                      ? 'border-red bg-red text-white hover:bg-red/90'
                      : 'border-red text-red hover:bg-red hover:text-white'
                  }`}
                >
                  <svg
                    className={`mr-2 h-5 w-5 ${
                      product?.id && isInWishlist(product.id) ? 'fill-white' : 'fill-none'
                    }`}
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
                  {product?.id && isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </button>
              </div>

              {/* Additional Info */}
              {product.created_at && (
                <div className="border-t border-gray-3 pt-6">
                  <p className="text-sm text-gray-6">
                    Added: {new Date(product.created_at).toLocaleDateString('en-US')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Секція відгуків */}
      <section className="pb-20">
        <div className="mx-auto max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <Reviews productId={productId} />
        </div>
      </section>

      <Newsletter />
    </>
  );
};

export default ProductDetail;