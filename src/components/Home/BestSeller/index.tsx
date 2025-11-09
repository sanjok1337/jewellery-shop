"use client";
import React, { useState, useEffect } from "react";
import SingleItem from "./SingleItem";
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
  image_url?: string;
  images?: Array<{image_url: string; is_main: boolean}>;
  stock?: number;
}

const BestSeller = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('🔄 Fetching best sellers from API...');
      const response = await fetch('http://localhost:5000/api/products?limit=4&sortBy=price_desc');
      console.log('📡 Best sellers response status:', response.status, response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Best sellers API Response:', data);
        console.log('🏷️ Best sellers products array:', data.products);
        console.log('📊 Best sellers products count:', data.products?.length || 0);
        setProducts(data.products || []);
      } else {
        console.error('❌ Best sellers API request failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Fetch best sellers error:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="overflow-hidden">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- section title --> */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
              <Image
                src="/images/icons/icon-07.svg"
                alt="icon"
                width={17}
                height={17}
              />
              This Month
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              Best Sellers
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7.5">
          {/* <!-- Best Sellers item --> */}
          {loading ? (
            <div className="col-span-full text-center py-8">
              <p>Завантаження товарів...</p>
            </div>
          ) : products.length > 0 ? (
            products.map((product) => {
              // Адаптуємо дані з API до формату, який очікує SingleItem
              const adaptedProduct = {
                id: product.id,
                title: product.name,
                price: product.price,
                discountedPrice: product.price,
                reviews: 0,
                imgs: {
                  thumbnails: [
                    product.image_url || '/images/products/product-1-sm-1.png'
                  ],
                  previews: [
                    product.image_url || '/images/products/product-1-bg-1.png'
                  ]
                }
              };
              return (
                <SingleItem item={adaptedProduct} key={product.id} />
              );
            })
          ) : (
            <div className="col-span-full text-center py-8">
              <p>Товарів не знайдено</p>
            </div>
          )}
        </div>

        <div className="text-center mt-12.5">
          <Link
            href="/shop-without-sidebar"
            className="inline-flex font-medium text-custom-sm py-3 px-7 sm:px-12.5 rounded-md border-gray-3 border bg-gray-1 text-dark ease-out duration-200 hover:bg-dark hover:text-white hover:border-transparent"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
