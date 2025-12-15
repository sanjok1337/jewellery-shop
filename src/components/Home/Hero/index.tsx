import React from "react";
import HeroCarousel from "./HeroCarousel";
import HeroFeature from "./HeroFeature";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="overflow-hidden pb-10 lg:pb-12.5 xl:pb-15 pt-57.5 sm:pt-45 lg:pt-30 xl:pt-51.5 bg-[#E5EAF4]">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-wrap gap-5">
          <div className="xl:max-w-[757px] w-full">
            <div className="relative z-1 rounded-[10px] bg-white overflow-hidden">
              {/* <!-- bg shapes --> */}
              <Image
                src="/images/hero/hero-bg.png"
                alt="hero bg shapes"
                className="absolute right-0 bottom-0 -z-1"
                width={534}
                height={520}
              />

              <HeroCarousel />
            </div>
          </div>

          <div className="xl:max-w-[393px] w-full">
            <div className="flex flex-col sm:flex-row xl:flex-col gap-5">
              <Link href="/products/3" className="w-full relative rounded-[10px] bg-white p-4 sm:p-7.5 block hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-14">
                  <div>
                    <h2 className="max-w-[153px] font-semibold text-dark text-xl mb-20 hover:text-blue transition-colors">
                      Gold Diamond Earrings
                    </h2>

                    <div>
                      <p className="font-medium text-dark-4 text-custom-sm mb-1.5">
                        limited time offer
                      </p>
                      <span className="flex items-center gap-3">
                        <span className="font-medium text-heading-5 text-red">
                          $499
                        </span>
                        <span className="font-medium text-2xl text-dark-4 line-through">
                          $799
                        </span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <Image
                      src="/images/products/gold-earrings-with-diamonds-isolated-transparent-background_191095-13254.avif"
                      alt="gold earrings"
                      width={123}
                      height={161}
                    />
                  </div>
                </div>
              </Link>
              <Link href="/products/1" className="w-full relative rounded-[10px] bg-white p-4 sm:p-7.5 block hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-14">
                  <div>
                    <h2 className="max-w-[153px] font-semibold text-dark text-xl mb-20 hover:text-blue transition-colors">
                      Silver Bracelet
                    </h2>

                    <div>
                      <p className="font-medium text-dark-4 text-custom-sm mb-1.5">
                        limited time offer
                      </p>
                      <span className="flex items-center gap-3">
                        <span className="font-medium text-heading-5 text-red">
                          $199
                        </span>
                        <span className="font-medium text-2xl text-dark-4 line-through">
                          $299
                        </span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <Image
                      src="/images/products/braclet.svg"
                      alt="silver bracelet"
                      width={123}
                      height={161}
                    />
                  </div>
                </div>
              </Link>

              
            </div>
          </div>
        </div>
      </div>

      {/* <!-- Hero features --> */}
      <HeroFeature />
    </section>
  );
};

export default Hero;
