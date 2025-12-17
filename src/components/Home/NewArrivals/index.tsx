"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import ProductItem from "@/components/Common/ProductItem";

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

const NewArrival = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('рџ”„ Fetching products from API...');
      const response = await fetch('http://localhost:5000/api/products?limit=4&sortBy=newest');
      console.log('рџ“Ў Response status:', response.status, response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('рџ“¦ API Response:', data);
        console.log('рџЏ·пёЏ Products array:', data.products);
        console.log('рџ“Љ Products count:', data.products?.length || 0);
        setProducts(data.products || []);
      } else {
        console.error('вќЊ API request failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('вќЊ Fetch products error:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="overflow-hidden pt-15">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- section title --> */}
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-gold mb-1.5">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.11826 15.4622C4.11794 16.6668 5.97853 16.6668 9.69971 16.6668H10.3007C14.0219 16.6668 15.8825 16.6668 16.8821 15.4622M3.11826 15.4622C2.11857 14.2577 2.46146 12.429 3.14723 8.77153C3.63491 6.17055 3.87875 4.87006 4.8045 4.10175M3.11826 15.4622C3.11826 15.4622 3.11826 15.4622 3.11826 15.4622ZM16.8821 15.4622C17.8818 14.2577 17.5389 12.429 16.8532 8.77153C16.3655 6.17055 16.1216 4.87006 15.1959 4.10175M16.8821 15.4622C16.8821 15.4622 16.8821 15.4622 16.8821 15.4622ZM15.1959 4.10175C14.2701 3.33345 12.947 3.33345 10.3007 3.33345H9.69971C7.0534 3.33345 5.73025 3.33345 4.8045 4.10175M15.1959 4.10175C15.1959 4.10175 15.1959 4.10175 15.1959 4.10175ZM4.8045 4.10175C4.8045 4.10175 4.8045 4.10175 4.8045 4.10175Z"
                  stroke="#D4AF37"
                  strokeWidth="1.5"
                />
                <path
                  d="M7.64258 6.66678C7.98578 7.63778 8.91181 8.33345 10.0003 8.33345C11.0888 8.33345 12.0149 7.63778 12.3581 6.66678"
                  stroke="#D4AF37"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              This WeekвЂ™s
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              New Arrivals
            </h2>
          </div>

          <Link
            href="/shop-with-sidebar"
            className="inline-flex font-medium text-custom-sm py-2.5 px-7 rounded-full border-gold-light border bg-champagne-light text-dark ease-out duration-200 hover:bg-gradient-to-r hover:from-gold hover:to-gold-dark hover:text-white hover:border-transparent"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7.5 gap-y-9">
          {/* <!-- New Arrivals item --> */}
          {loading ? (
            <div className="col-span-full text-center py-8">
              <p>Loading products...</p>
            </div>
          ) : products.length > 0 ? (
            products.map((product) => {
              // РђРґР°РїС‚СѓС”РјРѕ РґР°РЅС– Р· API РґРѕ С„РѕСЂРјР°С‚Сѓ, СЏРєРёР№ РѕС‡С–РєСѓС” ProductItem
              const adaptedProduct = {
                id: product.id,
                title: product.name,
                price: product.price,
                discountedPrice: product.price, // РїРѕРєРё С‰Рѕ Р±РµР· Р·РЅРёР¶РєРё
                reviews: 0, // РїРѕРєРё С‰Рѕ 0 РІС–РґРіСѓРєС–РІ
                stock: product.stock || 0,
                stockStatus: product.stock > 0 ? 'In Stock' : 'Out of Stock',
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
                <div key={product.id} className="relative">
                  <ProductItem item={adaptedProduct} />
                  {product.stock === 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded-md">
                      Out of Stock
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-8">
              <p>No products found</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewArrival;



