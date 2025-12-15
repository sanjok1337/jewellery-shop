"use client";
import { useParams } from 'next/navigation';
import { useState, useEffect, useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
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
}

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();

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
        
        // Гнучка обробка відповіді API
        if (data.product) {
          setProduct(data.product);
        } else if (data && data.id) {
          // Якщо дані прийшли без обгортки product
          setProduct(data);
        } else {
          console.error('❌ Unexpected API response format:', data);
          toast.error('Неочікуваний формат відповіді від сервера');
        }
        
        // Встановлюємо головне зображення
        if (data.product.images && data.product.images.length > 0) {
          const mainImage = data.product.images.find((img: any) => img.is_main) || data.product.images[0];
          setSelectedImage(mainImage.image_url);
        } else if (data.product.image_url) {
          setSelectedImage(data.product.image_url);
        }
      } else {
        toast.error('Товар не знайдено');
      }
    } catch (error) {
      console.error('Помилка завантаження товару:', error);
      toast.error('Помилка завантаження товару');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!user) {
      toast.error('Увійдіть в систему для додавання в кошик');
      return;
    }

    if (!product || product.stock === 0) {
      toast.error('Товар недоступний');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity
        })
      });

      if (response.ok) {
        toast.success('Товар додано в кошик');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Помилка додавання в кошик');
      }
    } catch (error) {
      console.error('Помилка додавання в кошик:', error);
      toast.error('Помилка додавання в кошик');
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Завантаження товару...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Товар не знайдено</h1>
          <Link href="/" className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark">
            На головну
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
                Головна
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link href="/shop" className="text-gray-500 hover:text-primary">
                  Магазин
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
                    <span className="text-gray-400">Немає зображення</span>
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
                <p className="text-gray-500 mb-4">Категорія: {product.category}</p>
              )}
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-primary">
                  ₴{Number(product.price).toFixed(2)}
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
                    <span className="text-red-600 font-medium">Немає в наявності</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-green-600 font-medium">
                      В наявності ({product.stock} шт.)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Опис товару</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description || 'Опис товару недоступний'}
              </p>
            </div>

            {/* Add to Cart Section */}
            {!isOutOfStock && (
              <div className="flex items-center space-x-4 border-t pt-6">
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={addToCart}
                  className="flex-1 bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition duration-200 font-medium"
                >
                  Додати в кошик
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
                  Товар недоступний
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Секція відгуків */}
        <div className="mt-16 border-t pt-16">
          <Reviews productId={productId} />
        </div>
      </div>
    </div>
  );
}