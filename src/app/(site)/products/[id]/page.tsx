"use client";
import { useParams } from 'next/navigation';
import { useState, useEffect, useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useCart } from '@/app/context/CartContext';
import { useWishlist } from '@/app/context/WishlistContext';
import WishlistButton from '@/components/Common/WishlistButton';
import Reviews from '@/components/ProductDetail/Reviews';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url?: string;
  images?: Array<{image_url: string; is_main: boolean}>;
  average_rating: number;
  characteristics?: Record<string, string>;
}

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();
  const { addToCart: addToCartContext, loading: cartLoading } = useCart();

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching product with ID:', productId);
      const response = await fetch(`http://localhost:5000/api/products/${productId}`);
      
      console.log('📡 Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Received data:', data);
        console.log('🎯 data.product:', data.product);
        console.log('🔍 typeof data:', typeof data);
        console.log('🔍 data keys:', Object.keys(data));
        
        // Flexible API response handling
        if (data.product) {
          setProduct(data.product);
        } else if (data && data.id) {
          // If data comes without product wrapper
          setProduct(data);
        } else {
          console.error('❌ Unexpected API response format:', data);
          toast.error('Unexpected server response format');
        }
        
        // Встановлюємо головне зображення
        if (data.product.images && data.product.images.length > 0) {
          const mainImage = data.product.images.find((img: any) => img.is_main) || data.product.images[0];
          setSelectedImage(mainImage.image_url);
        } else if (data.product.image_url) {
          setSelectedImage(data.product.image_url);
        }
      } else {
        toast.error('Product not found');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Error loading product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || product.stock === 0) {
      toast.error('Product not available');
      return;
    }

    await addToCartContext(product.id, quantity);
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Link href="/" className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 py-8">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/" className="text-gray-500 hover:text-primary">
                Home
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link href="/shop" className="text-gray-500 hover:text-primary">
                  Shop
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-900">{product.name}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Product Details */}
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            {/* Main Image */}
            <div className="mb-6">
              <div className="relative w-full h-[400px] lg:h-[500px] bg-gray-100 rounded-lg overflow-hidden">
                {selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image.image_url)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                      selectedImage === image.image_url 
                        ? 'border-primary' 
                        : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image.image_url}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              {product.category && (
                <p className="text-gray-500 mb-4">Category: {product.category}</p>
              )}
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-primary">
                  ${Number(product.price).toFixed(2)}
                </span>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${
                        star <= product.average_rating 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-sm text-gray-500 ml-2">
                    ({Number(product.average_rating || 0).toFixed(1)})
                  </span>
                </div>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {isOutOfStock ? (
                  <div className="flex items-center space-x-2">
                    <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span>
                    <span className="text-red-600 font-medium">Out of Stock</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_stock_page)">
                        <path
                          d="M10 0.5625C4.78125 0.5625 0.5625 4.78125 0.5625 10C0.5625 15.2188 4.78125 19.4688 10 19.4688C15.2188 19.4688 19.4688 15.2188 19.4688 10C19.4688 4.78125 15.2188 0.5625 10 0.5625ZM10 18.0625C5.5625 18.0625 1.96875 14.4375 1.96875 10C1.96875 5.5625 5.5625 1.96875 10 1.96875C14.4375 1.96875 18.0625 5.59375 18.0625 10.0312C18.0625 14.4375 14.4375 18.0625 10 18.0625Z"
                          fill="#22AD5C"
                        />
                        <path
                          d="M12.6875 7.09374L8.9688 10.7187L7.2813 9.06249C7.00005 8.78124 6.56255 8.81249 6.2813 9.06249C6.00005 9.34374 6.0313 9.78124 6.2813 10.0625L8.2813 12C8.4688 12.1875 8.7188 12.2812 8.9688 12.2812C9.2188 12.2812 9.4688 12.1875 9.6563 12L13.6875 8.12499C13.9688 7.84374 13.9688 7.40624 13.6875 7.12499C13.4063 6.84374 12.9688 6.84374 12.6875 7.09374Z"
                          fill="#22AD5C"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_stock_page">
                          <rect width="20" height="20" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                    <span className="text-green-600 font-medium">
                      In Stock ({product.stock} pcs.)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Product Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description || 'Product Description not available'}
              </p>
            </div>

            {/* Characteristics */}
            {product.characteristics && Object.keys(product.characteristics).length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  {Object.entries(product.characteristics).map(([key, value], index) => (
                    <div 
                      key={key} 
                      className={`flex py-3 px-4 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                    >
                      <div className="w-1/2 text-gray-600 font-medium">{key}</div>
                      <div className="w-1/2 text-gray-900">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart Section */}
            {!isOutOfStock && (
              <div className="flex items-center space-x-4 border-t pt-6">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-gray-600 hover:bg-gray-100 transition"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-5 py-3 border-x border-gray-300 min-w-[60px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-3 text-gray-600 hover:bg-gray-100 transition"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gold to-gold-dark text-white px-6 py-3 rounded-md hover:from-gold-dark hover:to-gold transition duration-200 font-medium shadow-md disabled:opacity-50"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  {cartLoading ? "Adding..." : "Add to Cart"}
                </button>
                <WishlistButton productId={product.id} size="lg" />
              </div>
            )}

            {isOutOfStock && (
              <div className="border-t pt-6">
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 px-6 py-3 rounded-md cursor-not-allowed font-medium"
                >
                  Product not available
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 border-t pt-16">
          <Reviews productId={productId} />
        </div>
      </div>
    </div>
  );
}