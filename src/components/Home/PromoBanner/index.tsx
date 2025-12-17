import React from "react";
import Image from "next/image";

const PromoBanner = () => {
  return (
    <section className="overflow-hidden py-20">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- promo banner big --> */}
        <div className="relative z-1 overflow-hidden rounded-lg bg-gradient-to-r from-champagne-light via-white to-champagne border border-gold-light-3 py-12.5 lg:py-17.5 xl:py-22.5 px-4 sm:px-7.5 lg:px-14 xl:px-19 mb-7.5">
          <div className="max-w-[550px] w-full">
            <span className="block font-medium text-xl text-dark mb-3">
              &quot;Lixitu&quot; Collection
            </span>

            <h2 className="font-bold text-xl lg:text-heading-4 xl:text-heading-3 text-dark mb-5">
              UP TO 30% OFF
            </h2>

            <p>
              Exclusive collection of gold jewelry with natural diamonds and precious gemstones. 
              Create your unique look with our premium-class products.
            </p>

            <a
              href="#"
              className="inline-flex font-medium text-custom-sm text-white bg-gradient-to-r from-gold to-gold-dark py-[11px] px-9.5 rounded-full shadow-md ease-out duration-200 hover:from-gold-dark hover:to-gold mt-7.5"
            >
              Buy Now
            </a>
          </div>

          <Image
            src="/images/promo/13-2-watch-high-quality-png.png"
            alt="Lixitu Gold Ring Collection"
            className="absolute bottom-0 right-4 lg:right-26 -z-1"
            width={320}
            height={350}
          />
        </div>

        <div className="grid gap-7.5 grid-cols-1 lg:grid-cols-2">
          {/* <!-- promo banner small --> */}
          <div className="relative z-1 overflow-hidden rounded-lg bg-gradient-to-br from-champagne via-white to-rose-light border border-gold-light-3 py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10">
            <Image
              src="/images/promo/13-2-watch-high-quality-png.png"
              alt="Gold Bracelet"
              className="absolute top-1/2 -translate-y-1/2 left-3 sm:left-10 -z-1"
              width={200}
              height={200}
            />

            <div className="text-right">
              <span className="block text-lg text-dark mb-1.5">
                Gold Bracelet Collection
              </span>

              <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                Shine Every Day
              </h2>

              <p className="font-semibold text-custom-1 text-gold">
                Flat 20% off
              </p>

              <a
                href="#"
                className="inline-flex font-medium text-custom-sm text-white bg-gradient-to-r from-rose to-rose-dark py-2.5 px-8.5 rounded-full shadow-md ease-out duration-200 hover:from-rose-dark hover:to-rose mt-9"
              >
                Grab Now
              </a>
            </div>
          </div>

          {/* <!-- promo banner small --> */}
          <div className="relative z-1 overflow-hidden rounded-lg bg-gradient-to-bl from-gold-light-3 via-white to-champagne-light border border-gold-light-3 py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10">
            <Image
              src="/images/promo/13-2-watch-high-quality-png.png"
              alt="Gold Pendant"
              className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-8.5 -z-1"
              width={180}
              height={180}
            />

            <div>
              <span className="block text-lg text-dark mb-1.5">
                Elegant Gold Pendants
              </span>

              <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                Up to <span className="text-gold-dark">40%</span> off
              </h2>

              <p className="max-w-[285px] text-custom-sm">
                Timeless elegance in every piece. Handcrafted pendants with 
                precious stones for your special moments.
              </p>

              <a
                href="#"
                className="inline-flex font-medium text-custom-sm text-white bg-gradient-to-r from-gold to-gold-dark py-2.5 px-8.5 rounded-full shadow-md ease-out duration-200 hover:from-gold-dark hover:to-gold mt-7.5"
              >
                Buy Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;








