"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { useState, useEffect } from "react";

// Import Swiper styles
import "swiper/css/pagination";
import "swiper/css";

import Image from "next/image";
import Link from "next/link";

interface FeaturedProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  average_rating: number;
  image_url: string;
  category_name: string;
}

const HeroCarousal = () => {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products/featured");
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Fallback static data if no products loaded
  const defaultSlides = [
    {
      id: 5,
      name: "Exquisite Diamond Jewelry",
      description: "Exclusive collection of precious jewelry crafted by master artisans specially for you",
      image: "/images/products/earings.webp",
      discount: 30,
    },
    {
      id: 2,
      name: "Elegant Emerald Collection",
      description: "The finest collection of gold and silver jewelry for special moments in your life",
      image: "/images/products/neckless.webp",
      discount: 30,
    },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  // Use API products or fallback to default
  const slidesToRender = products.length > 0 ? products : [];

  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel"
    >
      {slidesToRender.length > 0 ? (
        slidesToRender.map((product) => (
          <SwiperSlide key={product.id}>
            <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row">
              <div className="max-w-[394px] py-10 sm:py-15 lg:py-24.5 pl-4 sm:pl-7.5 lg:pl-12.5">
                <div className="flex items-center gap-4 mb-7.5 sm:mb-10">
                  <span className="block font-semibold text-heading-3 sm:text-heading-1 text-gold">
                    {formatPrice(product.price)}
                  </span>
                </div>

                <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3">
                  <Link href={`/products/${product.id}`} className="hover:text-gold transition-colors">
                    {product.name}
                  </Link>
                </h1>

                <p className="text-gray-600 line-clamp-2">
                  {product.description}
                </p>

                <Link
                  href={`/products/${product.id}`}
                  className="inline-flex font-medium text-white text-custom-sm rounded-full bg-gradient-to-r from-gold to-gold-dark py-3 px-9 ease-out duration-200 hover:from-gold-dark hover:to-gold mt-10 shadow-md"
                >
                  Shop Now
                </Link>
              </div>

              <div className="relative w-[351px] h-[358px]">
                <Image
                  src={product.image_url || "/images/products/earings.webp"}
                  alt={product.name}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </SwiperSlide>
        ))
      ) : (
        // Fallback static slides
        defaultSlides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row">
              <div className="max-w-[394px] py-10 sm:py-15 lg:py-24.5 pl-4 sm:pl-7.5 lg:pl-12.5">
                <div className="flex items-center gap-4 mb-7.5 sm:mb-10">
                  <span className="block font-semibold text-heading-3 sm:text-heading-1 text-gold">
                    {slide.discount}%
                  </span>
                  <span className="block text-dark text-sm sm:text-custom-1 sm:leading-[24px]">
                    Sale
                    <br />
                    Off
                  </span>
                </div>

                <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3">
                  <Link href={`/products/${slide.id}`} className="hover:text-gold transition-colors">
                    {slide.name}
                  </Link>
                </h1>

                <p className="text-gray-600">{slide.description}</p>

                <Link
                  href={`/products/${slide.id}`}
                  className="inline-flex font-medium text-white text-custom-sm rounded-full bg-gradient-to-r from-gold to-gold-dark py-3 px-9 ease-out duration-200 hover:from-gold-dark hover:to-gold mt-10 shadow-md"
                >
                  Shop Now
                </Link>
              </div>

              <div>
                <Image
                  src={slide.image}
                  alt={slide.name}
                  width={351}
                  height={358}
                />
              </div>
            </div>
          </SwiperSlide>
        ))
      )}
    </Swiper>
  );
};

export default HeroCarousal;
