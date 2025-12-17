import React from "react";
import Image from "next/image";

interface ShippingMethodProps {
  selectedMethod?: string;
  onMethodChange?: (method: string) => void;
}

const ShippingMethod = ({ selectedMethod = "standard", onMethodChange }: ShippingMethodProps) => {
  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Shipping Method</h3>
      </div>

      <div className="p-4 sm:p-8.5">
        <div className="flex flex-col gap-4">
          <label
            htmlFor="free"
            className="flex cursor-pointer select-none items-center gap-3.5"
          >
            <div className="relative">
              <input
                type="checkbox"
                name="free"
                id="free"
                className="sr-only"
                onChange={() => onMethodChange?.("free")}
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  selectedMethod === "free"
                    ? "border-4 border-gold"
                    : "border border-gray-4"
                }`}
              ></div>
            </div>
            Free Shipping
          </label>

          <label
            htmlFor="standard"
            className="flex cursor-pointer select-none items-center gap-3.5"
          >
            <div className="relative">
              <input
                type="checkbox"
                name="standard"
                id="standard"
                className="sr-only"
                onChange={() => onMethodChange?.("standard")}
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  selectedMethod === "standard"
                    ? "border-4 border-gold"
                    : "border border-gray-4"
                }`}
              ></div>
            </div>

            <div className="rounded-md border-[0.5px] py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none">
              <div className="flex items-center">
                <div className="pr-4">
                  <Image
                    src="/images/checkout/fedex.svg"
                    alt="fedex"
                    width={64}
                    height={18}
                  />
                </div>

                <div className="border-l border-gray-4 pl-4">
                  <p className="font-semibold text-dark">$10.99</p>
                  <p className="text-custom-xs">Standard Shipping</p>
                </div>
              </div>
            </div>
          </label>

          <label
            htmlFor="express"
            className="flex cursor-pointer select-none items-center gap-3.5"
          >
            <div className="relative">
              <input
                type="checkbox"
                name="express"
                id="express"
                className="sr-only"
                onChange={() => onMethodChange?.("express")}
              />
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full ${
                  selectedMethod === "express"
                    ? "border-4 border-gold"
                    : "border border-gray-4"
                }`}
              ></div>
            </div>

            <div className="rounded-md border-[0.5px] py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none">
              <div className="flex items-center">
                <div className="pr-4">
                  <Image
                    src="/images/checkout/dhl.svg"
                    alt="dhl"
                    width={64}
                    height={20}
                  />
                </div>

                <div className="border-l border-gray-4 pl-4">
                  <p className="font-semibold text-dark">$12.50</p>
                  <p className="text-custom-xs">Standard Shipping</p>
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ShippingMethod;

