"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import toast from "react-hot-toast";

interface CryptoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  totalAmount: number;
  cryptoType: string;
  onPaymentSuccess: () => void;
}

interface PaymentDetails {
  crypto_amount: string;
  wallet_address: string;
  payment_reference: string;
  expires_in: number;
  qr_data: string;
}

const CryptoPaymentModal = ({
  isOpen,
  onClose,
  orderId,
  totalAmount,
  cryptoType,
  onPaymentSuccess,
}: CryptoPaymentModalProps) => {
  const { token } = useAuth();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const cryptoNames: Record<string, string> = {
    bitcoin: "Bitcoin (BTC)",
    ethereum: "Ethereum (ETH)",
    usdt: "Tether (USDT)",
  };

  const cryptoIcons: Record<string, React.ReactNode> = {
    bitcoin: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#F7931A" />
        <path
          d="M15.5 10.5C15.5 9.12 14.38 8 13 8V6.5H11.5V8H10.5V6.5H9V8H7V9.5H8V14.5H7V16H9V17.5H10.5V16H11.5V17.5H13V16C14.38 16 15.5 14.88 15.5 13.5C15.5 12.67 15.09 11.93 14.47 11.44C15.09 10.95 15.5 10.21 15.5 10.5ZM13 14.5H9.5V12.5H13C13.55 12.5 14 12.95 14 13.5C14 14.05 13.55 14.5 13 14.5ZM13 11.5H9.5V9.5H13C13.55 9.5 14 9.95 14 10.5C14 11.05 13.55 11.5 13 11.5Z"
          fill="white"
        />
      </svg>
    ),
    ethereum: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#627EEA" />
        <path d="M12 4L7 12.5L12 15L17 12.5L12 4Z" fill="white" fillOpacity="0.6" />
        <path d="M12 4L12 15L17 12.5L12 4Z" fill="white" />
        <path d="M12 16L7 13.5L12 20L17 13.5L12 16Z" fill="white" fillOpacity="0.6" />
        <path d="M12 16V20L17 13.5L12 16Z" fill="white" />
      </svg>
    ),
    usdt: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#26A17B" />
        <path
          d="M13.5 10.5V9H16V7H8V9H10.5V10.5C7.5 10.7 5.5 11.5 5.5 12.5C5.5 13.5 7.5 14.3 10.5 14.5V18H13.5V14.5C16.5 14.3 18.5 13.5 18.5 12.5C18.5 11.5 16.5 10.7 13.5 10.5Z"
          fill="white"
        />
      </svg>
    ),
  };

  useEffect(() => {
    if (isOpen && orderId && cryptoType) {
      generatePayment();
    }
  }, [isOpen, orderId, cryptoType]);

  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error("Payment time expired. Please try again.");
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  const generatePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/crypto-payments/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: orderId,
          crypto_type: cryptoType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentDetails(data.payment);
        setTimeLeft(data.payment.expires_in);
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to generate payment");
        onClose();
      }
    } catch (error) {
      console.error("Generate payment error:", error);
      toast.error("Failed to generate payment details");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    setVerifying(true);
    try {
      const response = await fetch("http://localhost:5000/api/crypto-payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: orderId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Payment verified successfully!");
        onPaymentSuccess();
      } else {
        const error = await response.json();
        toast.error(error.message || "Payment verification failed");
      }
    } catch (error) {
      console.error("Verify payment error:", error);
      toast.error("Failed to verify payment");
    } finally {
      setVerifying(false);
    }
  };

  const handleSimulatePayment = async () => {
    setVerifying(true);
    try {
      const response = await fetch("http://localhost:5000/api/crypto-payments/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: orderId,
        }),
      });

      if (response.ok) {
        toast.success("Payment completed successfully! Order status updated.");
        onPaymentSuccess();
      } else {
        const error = await response.json();
        toast.error(error.message || "Payment simulation failed");
      }
    } catch (error) {
      console.error("Simulate payment error:", error);
      toast.error("Failed to simulate payment");
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-gradient-to-br from-white to-champagne-light rounded-2xl shadow-2xl border border-gold-light-3 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gold to-gold-dark text-white py-5 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {cryptoIcons[cryptoType]}
              <div>
                <h2 className="text-xl font-semibold">Crypto Payment</h2>
                <p className="text-sm text-white/80">{cryptoNames[cryptoType]}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-gold-light-3 border-t-gold rounded-full animate-spin" />
              <p className="mt-4 text-gray-600">Generating payment details...</p>
            </div>
          ) : paymentDetails ? (
            <>
              {/* Timer */}
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500">Payment expires in</p>
                <p className={`text-2xl font-bold ${timeLeft < 300 ? "text-red-500" : "text-gold-dark"}`}>
                  {formatTime(timeLeft)}
                </p>
              </div>

              {/* Amount */}
              <div className="bg-champagne-light/50 rounded-xl p-4 mb-4 border border-gold-light-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Amount to pay:</span>
                  <span className="text-xl font-bold text-gold-dark">
                    {paymentDetails.crypto_amount} {cryptoType.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">USD equivalent:</span>
                  <span className="text-gray-700">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Wallet Address */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">Send to wallet address:</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white border border-gold-light-3 rounded-lg p-3 font-mono text-sm break-all">
                    {paymentDetails.wallet_address}
                  </div>
                  <button
                    onClick={() => copyToClipboard(paymentDetails.wallet_address, "address")}
                    className={`p-3 rounded-lg border transition-all ${
                      copied === "address"
                        ? "bg-green-100 border-green-300 text-green-600"
                        : "bg-champagne-light border-gold-light-3 hover:bg-gold-light-5 text-gold-dark"
                    }`}
                  >
                    {copied === "address" ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Payment Reference */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600 mb-2">Payment Reference:</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white border border-gold-light-3 rounded-lg p-3 font-mono text-sm">
                    {paymentDetails.payment_reference}
                  </div>
                  <button
                    onClick={() => copyToClipboard(paymentDetails.payment_reference, "reference")}
                    className={`p-3 rounded-lg border transition-all ${
                      copied === "reference"
                        ? "bg-green-100 border-green-300 text-green-600"
                        : "bg-champagne-light border-gold-light-3 hover:bg-gold-light-5 text-gold-dark"
                    }`}
                  >
                    {copied === "reference" ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleVerifyPayment}
                  disabled={verifying}
                  className="w-full py-3 px-6 bg-gradient-to-r from-gold to-gold-dark text-white font-medium rounded-full hover:from-gold-dark hover:to-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {verifying ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      I&apos;ve Made the Payment
                    </>
                  )}
                </button>

                {/* Simulate Payment Button (for testing) */}
                <button
                  onClick={handleSimulatePayment}
                  disabled={verifying}
                  className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-medium rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Simulate Payment (Testing)
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-3 px-6 border border-gold-light-3 text-gold-dark font-medium rounded-full hover:bg-champagne-light/50 transition-all"
                >
                  Cancel
                </button>
              </div>

              {/* Info Note */}
              <p className="mt-4 text-xs text-center text-gray-500">
                Send exactly the amount shown above to the wallet address. The payment will be verified automatically.
              </p>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-red-500">Failed to load payment details</p>
              <button
                onClick={generatePayment}
                className="mt-4 px-6 py-2 bg-gold text-white rounded-full hover:bg-gold-dark"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CryptoPaymentModal;
