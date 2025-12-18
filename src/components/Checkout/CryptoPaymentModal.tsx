"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import toast from "react-hot-toast";
import { BrowserProvider, parseEther, formatEther } from "ethers";

// Sepolia testnet chain ID
const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111 in hex

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

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  isCorrectNetwork: boolean;
}

const CryptoPaymentModal = ({
  isOpen,
  onClose,
  orderId,
  totalAmount,
  cryptoType,
  onPaymentSuccess,
}: CryptoPaymentModalProps) => {
  console.log('💳 CryptoPaymentModal props:', { isOpen, orderId, totalAmount, cryptoType });
  
  const { token } = useAuth();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    isCorrectNetwork: false,
  });
  const [txHash, setTxHash] = useState<string | null>(null);
  const [sendingTx, setSendingTx] = useState(false);
  const [manualTxHash, setManualTxHash] = useState<string>("");
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'sending' | 'confirming' | 'verifying' | 'success' | 'error'>('idle');
  const [verificationMessage, setVerificationMessage] = useState<string>("");

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
    if (!isOpen) return;
    
    console.log('🔵 Modal opened', { orderId, cryptoType });
    
    if (orderId && cryptoType) {
      // Reset states
      setPaymentDetails(null);
      setTxHash(null);
      setLoading(true);
      
      // Generate payment and check wallet
      generatePayment();
      checkWalletConnection();
    } else {
      console.error('❌ Missing orderId or cryptoType', { orderId, cryptoType });
      toast.error('Invalid payment parameters');
      setLoading(false);
    }

    // Set up MetaMask event listeners
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          updateWalletState(accounts[0]);
        } else {
          setWallet({
            isConnected: false,
            address: null,
            balance: null,
            isCorrectNetwork: false,
          });
        }
      };

      const handleChainChanged = () => {
        // Reload page on chain change as recommended by MetaMask
        window.location.reload();
      };

      window.ethereum.on?.("accountsChanged", handleAccountsChanged);
      window.ethereum.on?.("chainChanged", handleChainChanged);

      return () => {
        window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
        window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
      };
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

  // Check if MetaMask is installed and connected
  const checkWalletConnection = async () => {
    console.log('🔍 Checking wallet connection...');
    
    if (typeof window === "undefined") {
      console.log('❌ Window not defined (SSR)');
      return;
    }
    
    if (!window.ethereum) {
      console.log('❌ MetaMask not installed');
      return;
    }
    
    try {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      console.log('👛 Accounts found:', accounts.length);
      
      if (accounts.length > 0) {
        console.log('✅ Wallet already connected:', accounts[0]);
        await updateWalletState(accounts[0]);
      } else {
        console.log('ℹ️ No accounts connected yet');
        // Reset wallet state if no accounts
        setWallet({
          isConnected: false,
          address: null,
          balance: null,
          isCorrectNetwork: false,
        });
      }
    } catch (error) {
      console.error("❌ Error checking wallet connection:", error);
      setWallet({
        isConnected: false,
        address: null,
        balance: null,
        isCorrectNetwork: false,
      });
    }
  };

  // Update wallet state with balance and network
  const updateWalletState = async (address: string) => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      const network = await provider.getNetwork();
      
      const isSepoliaNetwork = network.chainId === BigInt(11155111); // Sepolia chainId
      
      setWallet({
        isConnected: true,
        address,
        balance: formatEther(balance),
        isCorrectNetwork: isSepoliaNetwork,
      });

      if (!isSepoliaNetwork) {
        toast.error("Please switch to Sepolia testnet");
      }
    } catch (error) {
      console.error("Error updating wallet state:", error);
      toast.error("Failed to get wallet information");
    }
  };

  // Connect MetaMask wallet
  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      toast.error("MetaMask not installed! Please install MetaMask extension.");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      
      if (accounts.length > 0) {
        await updateWalletState(accounts[0]);
        toast.success("Wallet connected successfully!");
      } else {
        toast.error("No accounts found. Please unlock MetaMask.");
      }
    } catch (error: any) {
      console.error("Connect wallet error:", error);
      if (error.code === 4001) {
        toast.error("Connection rejected by user");
      } else if (error.code === -32002) {
        toast.error("Please check MetaMask - connection request pending");
      } else {
        toast.error(error.message || "Failed to connect wallet");
      }
    }
  };

  // Switch to Sepolia network
  const switchToSepolia = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask not found");
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
      
      // Wait a bit for the network to switch
      setTimeout(async () => {
        await checkWalletConnection();
        toast.success("Switched to Sepolia testnet!");
      }, 500);
    } catch (error: any) {
      console.error("Switch network error:", error);
      
      // If Sepolia is not added, add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: "Sepolia Test Network",
                nativeCurrency: {
                  name: "Sepolia ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://rpc.sepolia.org"],
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });
          toast.success("Sepolia network added and switched!");
          setTimeout(() => checkWalletConnection(), 500);
        } catch (addError: any) {
          console.error("Add network error:", addError);
          toast.error("Failed to add Sepolia network");
        }
      } else if (error.code === 4001) {
        toast.error("Network switch rejected by user");
      } else {
        toast.error(error.message || "Failed to switch network");
      }
    }
  };

  // Send ETH transaction via MetaMask
  const sendTransaction = async () => {
    if (!paymentDetails || !wallet.isConnected || !wallet.isCorrectNetwork) {
      toast.error("Please connect wallet and switch to Sepolia network");
      return;
    }

    setSendingTx(true);
    setVerificationStatus('sending');
    setVerificationMessage('Preparing transaction...');
    
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Parse amount and check balance
      const amountWei = parseEther(paymentDetails.crypto_amount);
      const balance = await provider.getBalance(wallet.address!);
      
      console.log('💰 Balance check:', {
        balance: formatEther(balance),
        required: paymentDetails.crypto_amount,
        balanceWei: balance.toString(),
        amountWei: amountWei.toString()
      });
      
      // Check if balance is sufficient (including estimated gas)
      const estimatedGas = parseEther('0.001'); // Reserve for gas fees
      const totalRequired = amountWei + estimatedGas;
      
      if (balance < totalRequired) {
        const shortfall = formatEther(totalRequired - balance);
        toast.error(`Insufficient balance. You need ${paymentDetails.crypto_amount} ETH + ~0.001 ETH for gas. Missing: ${shortfall} ETH`);
        setSendingTx(false);
        return;
      }

      // Send transaction
      setVerificationMessage('Please confirm transaction in MetaMask...');
      const tx = await signer.sendTransaction({
        to: paymentDetails.wallet_address,
        value: amountWei,
      });

      setTxHash(tx.hash);
      setVerificationStatus('confirming');
      setVerificationMessage('Transaction sent! Waiting for blockchain confirmation...');
      toast.success("Transaction sent! Waiting for confirmation...");

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (receipt && receipt.status === 1) {
        setVerificationStatus('verifying');
        setVerificationMessage('Transaction confirmed! Verifying payment...');
        toast.success("Transaction confirmed!");
        
        // Verify payment on backend with tx hash
        await verifyWithTxHash(tx.hash);
      } else {
        setVerificationStatus('error');
        setVerificationMessage('Transaction failed on blockchain');
        toast.error("Transaction failed!");
        setTxHash(null);
      }
    } catch (error: any) {
      console.error("Transaction error:", error);
      setTxHash(null);
      setVerificationStatus('error');
      
      if (error.code === 4001 || error.code === "ACTION_REJECTED") {
        setVerificationMessage('Transaction rejected by user');
        toast.error("Transaction rejected by user");
      } else if (error.code === "INSUFFICIENT_FUNDS" || error.code === -32000) {
        setVerificationMessage('Insufficient funds for transaction + gas fees');
        toast.error("Insufficient funds for transaction + gas fees");
      } else if (error.code === "NETWORK_ERROR") {
        setVerificationMessage('Network error. Please check your connection.');
        toast.error("Network error. Please check your connection.");
      } else {
        setVerificationMessage(error.shortMessage || error.message || 'Transaction failed');
        toast.error(error.shortMessage || error.message || "Transaction failed");
      }
    } finally {
      setSendingTx(false);
    }
  };

  // Verify payment with transaction hash
  const verifyWithTxHash = async (hash: string) => {
    console.log('🔍 Starting transaction verification...', { hash, orderId });
    setVerifying(true);
    try {
      const response = await fetch("http://localhost:5000/api/crypto-payments/verify-tx", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id: orderId,
          tx_hash: hash,
        }),
      });

      console.log('📥 Verification response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Verification successful:', data);
        setVerificationStatus('success');
        setVerificationMessage('Payment verified successfully!');
        toast.success("Payment verified successfully! Order updated.");
        
        // Call success callback and close modal after delay
        console.log('📞 Calling onPaymentSuccess callback...');
        setTimeout(async () => {
          await onPaymentSuccess();
          console.log('🚪 Closing modal...');
          onClose();
        }, 1500);
      } else {
        const errorText = await response.text();
        console.error('❌ Verification failed:', errorText);
        let error;
        try {
          error = JSON.parse(errorText);
        } catch (e) {
          error = { message: errorText };
        }
        
        // Show more helpful error message
        const errorMessage = error.message || "Payment verification failed";
        if (errorMessage.includes('not found')) {
          toast.error("Transaction not yet confirmed on blockchain. Please wait a moment and try again.");
        } else {
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      console.error("💥 Verify payment error:", error);
      toast.error(`Connection error: ${error instanceof Error ? error.message : 'Failed to verify'}`);
    } finally {
      setVerifying(false);
      console.log('🏁 Verification completed');
    }
  };

  const generatePayment = async () => {
    console.log('🚀 Starting payment generation...', { orderId, cryptoType, token: token ? 'exists' : 'missing' });
    setLoading(true);
    
    // Small delay to ensure order is fully created
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      console.log('📡 Sending request to generate payment...');
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

      console.log('📥 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Payment details received:', data);
        
        if (data.payment) {
          setPaymentDetails(data.payment);
          setTimeLeft(data.payment.expires_in || 1800);
          toast.success("Payment details generated!");
        } else {
          console.error('❌ No payment data in response');
          toast.error("Invalid payment data received");
          onClose();
        }
      } else {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        
        let errorMessage = "Failed to generate payment";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        toast.error(errorMessage);
        onClose();
      }
    } catch (error) {
      console.error('💥 Generate payment error:', error);
      toast.error(`Connection error: ${error instanceof Error ? error.message : 'Failed to connect to server'}`);
      onClose();
    } finally {
      setLoading(false);
      console.log('🏁 Payment generation completed');
    }
  };

  const handleVerifyPayment = async () => {
    if (!manualTxHash.trim()) {
      toast.error("Please enter transaction hash");
      return;
    }

    // Validate tx hash format (0x followed by 64 hex characters)
    const txHashRegex = /^0x[a-fA-F0-9]{64}$/;
    if (!txHashRegex.test(manualTxHash.trim())) {
      toast.error("Invalid transaction hash format");
      return;
    }

    await verifyWithTxHash(manualTxHash.trim());
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
              <p className="mt-4 text-gray-900 font-semibold">Generating payment details...</p>
              <button
                onClick={() => {
                  console.log('⏹️ Cancelling payment generation');
                  setLoading(false);
                  onClose();
                }}
                className="mt-4 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Cancel
              </button>
            </div>
          ) : paymentDetails ? (
            <>
              {/* Timer */}
              <div className="text-center mb-6">
                <p className="text-sm text-gray-700 font-medium">Payment expires in</p>
                <p className={`text-2xl font-bold ${timeLeft < 300 ? "text-red-500" : "text-gold-dark"}`}>
                  {formatTime(timeLeft)}
                </p>
              </div>

              {/* Amount */}
              <div className="bg-champagne-light/50 rounded-xl p-4 mb-4 border border-gold-light-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-800 font-medium">Amount to pay:</span>
                  <span className="text-xl font-bold text-gold-dark">
                    {paymentDetails.crypto_amount} {cryptoType.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 font-medium">USD equivalent:</span>
                  <span className="text-gray-900 font-semibold">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Wallet Address */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-800 mb-2">Send to wallet address:</label>
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
                <label className="block text-sm font-semibold text-gray-800 mb-2">Payment Reference:</label>
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
                {/* MetaMask Payment Section for Ethereum */}
                {cryptoType === "ethereum" && (
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 mb-4 border border-orange-200">
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-6 h-6" viewBox="0 0 40 40" fill="none">
                        <path d="M37.5 20c0 9.665-7.835 17.5-17.5 17.5S2.5 29.665 2.5 20 10.335 2.5 20 2.5 37.5 10.335 37.5 20z" fill="#F6851B"/>
                        <path d="M33.2 10.5l-12 8.9 2.2-5.3 9.8-3.6z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6.8 10.5l11.9 9-2.1-5.4-9.8-3.6zm22.1 18.1l-3.2 4.9 6.8 1.9 2-6.7-5.6-.1zm-23.8.1l1.9 6.7 6.8-1.9-3.2-4.9-5.5.1z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="font-semibold text-orange-800">Pay with MetaMask (Sepolia Testnet)</span>
                    </div>

                    {!wallet.isConnected ? (
                      <button
                        onClick={connectWallet}
                        className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M21 18v1a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1"/>
                          <polyline points="15,8 21,8 21,16 15,16"/>
                          <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Connect MetaMask
                      </button>
                    ) : !wallet.isCorrectNetwork ? (
                      <button
                        onClick={switchToSepolia}
                        className="w-full py-2.5 px-4 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                        Switch to Sepolia Network
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-800 font-medium">Connected:</span>
                          <span className="font-mono text-xs text-gray-900 font-semibold">
                            {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-800 font-medium">Balance:</span>
                          <span className="font-semibold text-gray-900">
                            {parseFloat(wallet.balance || "0").toFixed(4)} ETH
                          </span>
                        </div>
                        
                        {txHash ? (
                          <div className="space-y-3">
                            {/* Transaction Status Display */}
                            <div className={`rounded-lg p-4 text-center ${
                              verificationStatus === 'success' ? 'bg-green-100 border border-green-300' :
                              verificationStatus === 'error' ? 'bg-red-100 border border-red-300' :
                              'bg-blue-100 border border-blue-300'
                            }`}>
                              {/* Status Icon */}
                              <div className="flex justify-center mb-2">
                                {verificationStatus === 'success' ? (
                                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                ) : verificationStatus === 'error' ? (
                                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                ) : (
                                  <div className="w-10 h-10 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                                )}
                              </div>
                              
                              {/* Status Message */}
                              <p className={`text-sm font-semibold mb-1 ${
                                verificationStatus === 'success' ? 'text-green-800' :
                                verificationStatus === 'error' ? 'text-red-800' :
                                'text-blue-800'
                              }`}>
                                {verificationStatus === 'confirming' && 'Очікування підтвердження...'}
                                {verificationStatus === 'verifying' && 'Верифікація платежу...'}
                                {verificationStatus === 'success' && 'Оплата успішна!'}
                                {verificationStatus === 'error' && 'Помилка транзакції'}
                              </p>
                              <p className={`text-xs ${
                                verificationStatus === 'success' ? 'text-green-700' :
                                verificationStatus === 'error' ? 'text-red-700' :
                                'text-blue-700'
                              }`}>
                                {verificationMessage}
                              </p>
                              
                              {/* Etherscan Link */}
                              <a
                                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:underline font-mono"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Переглянути на Etherscan
                              </a>
                            </div>
                            
                            {verificationStatus === 'error' && (
                              <button
                                onClick={() => {
                                  setTxHash(null);
                                  setVerificationStatus('idle');
                                  setVerificationMessage('');
                                }}
                                className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-all"
                              >
                                Спробувати ще раз
                              </button>
                            )}
                          </div>
                        ) : (
                          <>
                            {parseFloat(wallet.balance || "0") < parseFloat(paymentDetails.crypto_amount) ? (
                              <div className="space-y-2">
                                <button
                                  disabled
                                  className="w-full py-2.5 px-4 bg-red-400 text-white font-medium rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                                  </svg>
                                  Insufficient Balance
                                </button>
                                <p className="text-xs text-red-600 text-center font-medium">
                                  Need {paymentDetails.crypto_amount} ETH, have {parseFloat(wallet.balance || "0").toFixed(4)} ETH
                                </p>
                              </div>
                            ) : (
                              <button
                                onClick={sendTransaction}
                                disabled={sendingTx}
                                className="w-full py-2.5 px-4 bg-orange-400 hover:bg-orange-500 text-gray-900 font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md border border-orange-500"
                              >
                                {sendingTx ? (
                                  <>
                                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-gray-900">Sending...</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                                    </svg>
                                    <span className="text-gray-900">Pay {paymentDetails.crypto_amount} ETH</span>
                                  </>
                                )}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                    
                    <p className="text-xs text-orange-700 mt-2 text-center">
                      Get free test ETH from{" "}
                      <a href="https://sepoliafaucet.com" target="_blank" rel="noopener noreferrer" className="underline">
                        sepoliafaucet.com
                      </a>
                    </p>
                  </div>
                )}

                <div className="relative flex items-center my-4">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink mx-4 text-gray-800 font-medium text-sm">or verify manual payment</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                {/* Manual Transaction Hash Input */}
                <div className="bg-blue-50 rounded-xl p-4 mb-3 border border-blue-200">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Enter Transaction Hash:
                  </label>
                  <p className="text-xs text-gray-800 mb-3">
                    If you paid manually, paste your transaction hash here to verify payment
                  </p>
                  <input
                    type="text"
                    value={manualTxHash}
                    onChange={(e) => setManualTxHash(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-4 py-2.5 border border-blue-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleVerifyPayment}
                  disabled={verifying || !manualTxHash.trim()}
                  className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-full hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {verifying ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying on Blockchain...
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
                      Verify Transaction on Blockchain
                    </>
                  )}
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-3 px-6 border border-gold-light-3 text-gold-dark font-medium rounded-full hover:bg-champagne-light/50 transition-all"
                >
                  Cancel
                </button>
              </div>

              {/* Info Note */}
              <p className="mt-4 text-xs text-center text-gray-700 font-medium">
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
