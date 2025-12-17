import React from "react";
import Image from "next/image";

interface PaymentMethodProps {
  selectedMethod?: string;
  onMethodChange?: (method: string) => void;
}

// Crypto Bitcoin icon component
const BitcoinIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#F7931A"/>
    <path d="M15.5 10.5C15.5 9.12 14.38 8 13 8V6.5H11.5V8H10.5V6.5H9V8H7V9.5H8V14.5H7V16H9V17.5H10.5V16H11.5V17.5H13V16C14.38 16 15.5 14.88 15.5 13.5C15.5 12.67 15.09 11.93 14.47 11.44C15.09 10.95 15.5 10.21 15.5 10.5ZM13 14.5H9.5V12.5H13C13.55 12.5 14 12.95 14 13.5C14 14.05 13.55 14.5 13 14.5ZM13 11.5H9.5V9.5H13C13.55 9.5 14 9.95 14 10.5C14 11.05 13.55 11.5 13 11.5Z" fill="white"/>
  </svg>
);

// Ethereum icon component
const EthereumIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#627EEA"/>
    <path d="M12 4L7 12.5L12 15L17 12.5L12 4Z" fill="white" fillOpacity="0.6"/>
    <path d="M12 4L12 15L17 12.5L12 4Z" fill="white"/>
    <path d="M12 16L7 13.5L12 20L17 13.5L12 16Z" fill="white" fillOpacity="0.6"/>
    <path d="M12 16V20L17 13.5L12 16Z" fill="white"/>
  </svg>
);

const PaymentMethod = ({ selectedMethod = "bank", onMethodChange }: PaymentMethodProps) => {
  return (
    <div className="bg-gradient-to-br from-white to-champagne-light shadow-1 rounded-xl mt-7.5 border border-gold-light-4">
      <div className="border-b border-gold-light-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark flex items-center gap-2">
          <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
          </svg>
          Payment Method
        </h3>
      </div>

      <div className="p-4 sm:p-8.5">
        <div className="flex flex-col gap-3">
          {/* Bank Transfer */}
          <label
            htmlFor="bank"
            className="flex cursor-pointer select-none items-center gap-4"
          >
            <div className="relative">
              <input
                type="checkbox"
                name="bank"
                id="bank"
                className="sr-only"
                onChange={() => onMethodChange?.("bank")}
              />
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 ${
                  selectedMethod === "bank"
                    ? "border-4 border-gold bg-gold-light-5"
                    : "border-2 border-gray-4"
                }`}
              ></div>
            </div>

            <div
              className={`flex-1 rounded-xl border py-4 px-5 ease-out duration-200 hover:bg-champagne-light/50 hover:border-gold-light-3 ${
                selectedMethod === "bank"
                  ? "border-gold-light-2 bg-champagne-light/70 shadow-gold-sm"
                  : "border-gray-3 bg-white"
              }`}
            >
              <div className="flex items-center">
                <div className="pr-3">
                  <Image src="/images/checkout/bank.svg" alt="bank" width={29} height={12}/>
                </div>

                <div className="border-l border-gold-light-3 pl-3">
                  <p className="font-medium text-dark">Direct bank transfer</p>
                </div>
              </div>
            </div>
          </label>

          {/* Cash on delivery */}
          <label
            htmlFor="cash"
            className="flex cursor-pointer select-none items-center gap-4"
          >
            <div className="relative">
              <input
                type="checkbox"
                name="cash"
                id="cash"
                className="sr-only"
                onChange={() => onMethodChange?.("cash")}
              />
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 ${
                  selectedMethod === "cash"
                    ? "border-4 border-gold bg-gold-light-5"
                    : "border-2 border-gray-4"
                }`}
              ></div>
            </div>

            <div
              className={`flex-1 rounded-xl border py-4 px-5 ease-out duration-200 hover:bg-champagne-light/50 hover:border-gold-light-3 ${
                selectedMethod === "cash"
                  ? "border-gold-light-2 bg-champagne-light/70 shadow-gold-sm"
                  : "border-gray-3 bg-white"
              }`}
            >
              <div className="flex items-center">
                <div className="pr-3">
                  <Image src="/images/checkout/cash.svg" alt="cash" width={21} height={21} />
                </div>

                <div className="border-l border-gold-light-3 pl-3">
                  <p className="font-medium text-dark">Cash on delivery</p>
                </div>
              </div>
            </div>
          </label>

          {/* PayPal */}
          <label
            htmlFor="paypal"
            className="flex cursor-pointer select-none items-center gap-4"
          >
            <div className="relative">
              <input
                type="checkbox"
                name="paypal"
                id="paypal"
                className="sr-only"
                onChange={() => onMethodChange?.("paypal")}
              />
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 ${
                  selectedMethod === "paypal"
                    ? "border-4 border-gold bg-gold-light-5"
                    : "border-2 border-gray-4"
                }`}
              ></div>
            </div>
            <div
              className={`flex-1 rounded-xl border py-4 px-5 ease-out duration-200 hover:bg-champagne-light/50 hover:border-gold-light-3 ${
                selectedMethod === "paypal"
                  ? "border-gold-light-2 bg-champagne-light/70 shadow-gold-sm"
                  : "border-gray-3 bg-white"
              }`}
            >
              <div className="flex items-center">
                <div className="pr-3">
                  <Image src="/images/checkout/paypal.svg" alt="paypal" width={75} height={20}/>
                </div>

                <div className="border-l border-gold-light-3 pl-3">
                  <p className="font-medium text-dark">PayPal</p>
                </div>
              </div>
            </div>
          </label>

          {/* Cryptocurrency Section Header */}
          <div className="mt-4 mb-2">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-light-3 to-transparent"></div>
              <span className="text-sm font-medium text-gold-dark px-2">Cryptocurrency</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold-light-3 to-transparent"></div>
            </div>
          </div>

          {/* Bitcoin */}
          <label
            htmlFor="bitcoin"
            className="flex cursor-pointer select-none items-center gap-4"
          >
            <div className="relative">
              <input
                type="checkbox"
                name="bitcoin"
                id="bitcoin"
                className="sr-only"
                onChange={() => onMethodChange?.("bitcoin")}
              />
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 ${
                  selectedMethod === "bitcoin"
                    ? "border-4 border-gold bg-gold-light-5"
                    : "border-2 border-gray-4"
                }`}
              ></div>
            </div>
            <div
              className={`flex-1 rounded-xl border py-4 px-5 ease-out duration-200 hover:bg-champagne-light/50 hover:border-gold-light-3 ${
                selectedMethod === "bitcoin"
                  ? "border-gold-light-2 bg-champagne-light/70 shadow-gold-sm"
                  : "border-gray-3 bg-white"
              }`}
            >
              <div className="flex items-center">
                <div className="pr-3">
                  <BitcoinIcon />
                </div>

                <div className="border-l border-gold-light-3 pl-3 flex-1">
                  <p className="font-medium text-dark">Bitcoin (BTC)</p>
                  <p className="text-xs text-gray-500 mt-0.5">Fast & Secure crypto payment</p>
                </div>
                <span className="text-xs bg-gradient-to-r from-gold to-gold-dark text-white px-2 py-1 rounded-full">Popular</span>
              </div>
            </div>
          </label>

          {/* Ethereum */}
          <label
            htmlFor="ethereum"
            className="flex cursor-pointer select-none items-center gap-4"
          >
            <div className="relative">
              <input
                type="checkbox"
                name="ethereum"
                id="ethereum"
                className="sr-only"
                onChange={() => onMethodChange?.("ethereum")}
              />
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 ${
                  selectedMethod === "ethereum"
                    ? "border-4 border-gold bg-gold-light-5"
                    : "border-2 border-gray-4"
                }`}
              ></div>
            </div>
            <div
              className={`flex-1 rounded-xl border py-4 px-5 ease-out duration-200 hover:bg-champagne-light/50 hover:border-gold-light-3 ${
                selectedMethod === "ethereum"
                  ? "border-gold-light-2 bg-champagne-light/70 shadow-gold-sm"
                  : "border-gray-3 bg-white"
              }`}
            >
              <div className="flex items-center">
                <div className="pr-3">
                  <EthereumIcon />
                </div>

                <div className="border-l border-gold-light-3 pl-3 flex-1">
                  <p className="font-medium text-dark">Ethereum (ETH)</p>
                  <p className="text-xs text-gray-500 mt-0.5">Pay with ETH or ERC-20 tokens</p>
                </div>
              </div>
            </div>
          </label>

          {/* USDT */}
          <label
            htmlFor="usdt"
            className="flex cursor-pointer select-none items-center gap-4"
          >
            <div className="relative">
              <input
                type="checkbox"
                name="usdt"
                id="usdt"
                className="sr-only"
                onChange={() => onMethodChange?.("usdt")}
              />
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full transition-all duration-200 ${
                  selectedMethod === "usdt"
                    ? "border-4 border-gold bg-gold-light-5"
                    : "border-2 border-gray-4"
                }`}
              ></div>
            </div>
            <div
              className={`flex-1 rounded-xl border py-4 px-5 ease-out duration-200 hover:bg-champagne-light/50 hover:border-gold-light-3 ${
                selectedMethod === "usdt"
                  ? "border-gold-light-2 bg-champagne-light/70 shadow-gold-sm"
                  : "border-gray-3 bg-white"
              }`}
            >
              <div className="flex items-center">
                <div className="pr-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#26A17B"/>
                    <path d="M13.5 10.5V9H16V7H8V9H10.5V10.5C7.5 10.7 5.5 11.5 5.5 12.5C5.5 13.5 7.5 14.3 10.5 14.5V18H13.5V14.5C16.5 14.3 18.5 13.5 18.5 12.5C18.5 11.5 16.5 10.7 13.5 10.5ZM10.5 14C8.3 13.8 7 13.2 7 12.5C7 11.8 8.3 11.2 10.5 11V13.5C10.5 13.67 10.5 13.83 10.5 14ZM13.5 14C13.5 13.83 13.5 13.67 13.5 13.5V11C15.7 11.2 17 11.8 17 12.5C17 13.2 15.7 13.8 13.5 14Z" fill="white"/>
                  </svg>
                </div>

                <div className="border-l border-gold-light-3 pl-3 flex-1">
                  <p className="font-medium text-dark">Tether (USDT)</p>
                  <p className="text-xs text-gray-500 mt-0.5">Stablecoin - 1:1 with USD</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Stable</span>
              </div>
            </div>
          </label>

        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;

