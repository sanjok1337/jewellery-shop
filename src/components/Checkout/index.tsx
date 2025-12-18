"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import Billing from "./Billing";
import CryptoPaymentModal from "./CryptoPaymentModal";
import { useAuth } from "@/app/context/AuthContext";
import { useCart } from "@/app/context/CartContext";
import toast from "react-hot-toast";

interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

interface Address {
  id: number;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

const Checkout = () => {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const { cartItems } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('bank');
  
  // Crypto payment modal state
  const [showCryptoModal, setShowCryptoModal] = useState(false);
  const [cryptoOrderId, setCryptoOrderId] = useState<number | null>(null);
  const [cryptoOrderTotal, setCryptoOrderTotal] = useState<number>(0);

  // Check if selected payment method is crypto
  const isCryptoPayment = ['bitcoin', 'ethereum', 'usdt'].includes(paymentMethod);

  useEffect(() => {
    console.log('Checkout - isAuthenticated:', isAuthenticated);
    console.log('Checkout - token:', token);
    
    if (!isAuthenticated) {
      toast.error('Please sign in to checkout');
      router.push('/signin');
      return;
    }
    
    fetchAddresses();
    setLoading(false);
  }, [isAuthenticated, token]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/addresses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
        
        // Select default address
        const defaultAddress = data.addresses?.find((addr: Address) => addr.is_default);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        } else if (data.addresses?.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      }
    } catch (error) {
      console.error('Fetch addresses error:', error);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    if (shippingMethod === 'express') return 25;
    if (shippingMethod === 'standard') return 15;
    return 0; // free shipping
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddress) {
      toast.error('Select delivery address');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      console.log('Creating order with:', {
        address_id: selectedAddress.id,
        payment_method: paymentMethod,
        shipping_method: shippingMethod,
        items_count: cartItems.length
      });

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          address_id: selectedAddress.id,
          payment_method: paymentMethod,
          shipping_method: shippingMethod,
          notes: notes,
          items: cartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price
          }))
        })
      });

      console.log('Order response status:', response.status);
      console.log('Order response headers:', response.headers.get('content-type'));
      const text = await response.text();
      console.log('Order response full text:', text);

      if (response.ok) {
        try {
          const data = JSON.parse(text);
          console.log('Order created successfully:', data);
          
          // If crypto payment, show the crypto modal
          if (isCryptoPayment) {
            setCryptoOrderId(data.orderId);
            setCryptoOrderTotal(calculateTotal());
            setShowCryptoModal(true);
            toast.success('Order created! Please complete payment.');
          } else {
            toast.success('Order created successfully!');
            
            // Clear cart after successful order
            await fetch('http://localhost:5000/api/cart', {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            router.push(`/my-account`);
          }
        } catch (parseError) {
          console.error('Parse success response error:', parseError);
          console.error('Response was:', text);
          toast.error('Error processing server response');
        }
      } else {
        console.error('Order failed with status:', response.status);
        console.error('Error response text:', text);
        try {
          const error = JSON.parse(text);
          console.error('Parsed error:', error);
          toast.error(error.message || error.error || 'Error creating order');
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
          toast.error('Server error: ' + text.substring(0, 100));
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Error processing order');
    }
  };

  const handleCryptoPaymentSuccess = async () => {
    setShowCryptoModal(false);
    
    // Clear cart after successful payment
    await fetch('http://localhost:5000/api/cart', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    toast.success('Payment successful!');
    router.push(`/my-account`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={handleCheckout}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* <!-- checkout left --> */}
              <div className="lg:max-w-[670px] w-full">
                {/* <!-- login box --> */}
                {!isAuthenticated && <Login />}

                {/* <!-- billing details --> */}
                <Billing 
                  addresses={addresses}
                  selectedAddress={selectedAddress}
                  onSelectAddress={setSelectedAddress}
                />

                {/* <!-- others note box --> */}
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <div>
                    <label htmlFor="notes" className="block mb-2.5">
                      Other Notes (optional)
                    </label>

                    <textarea
                      name="notes"
                      id="notes"
                      rows={5}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Notes about your order, e.g. special notes for delivery."
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-gold/30"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* // <!-- checkout right --> */}
              <div className="max-w-[455px] w-full">
                {/* <!-- order list box --> */}
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">
                      Your Order
                    </h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    {/* <!-- title --> */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <h4 className="font-medium text-dark">Product</h4>
                      </div>
                      <div>
                        <h4 className="font-medium text-dark text-right">
                          Subtotal
                        </h4>
                      </div>
                    </div>

                    {/* <!-- product items --> */}
                    {cartItems.length === 0 ? (
                      <div className="py-5 text-center text-dark-5">
                        Your cart is empty
                      </div>
                    ) : (
                      cartItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-5 border-b border-gray-3">
                          <div>
                            <p className="text-dark">
                              {item.name} x {item.quantity}
                            </p>
                          </div>
                          <div>
                            <p className="text-dark text-right">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}

                    {/* <!-- shipping fee --> */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <p className="text-dark">Shipping Fee</p>
                      </div>
                      <div>
                        <p className="text-dark text-right">
                          ${calculateShipping().toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* <!-- total --> */}
                    <div className="flex items-center justify-between pt-5">
                      <div>
                        <p className="font-medium text-lg text-dark">Total</p>
                      </div>
                      <div>
                        <p className="font-medium text-lg text-dark text-right">
                          ${calculateTotal().toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* <!-- coupon box --> */}
                <Coupon />

                {/* <!-- shipping box --> */}
                <ShippingMethod 
                  selectedMethod={shippingMethod}
                  onMethodChange={setShippingMethod}
                />

                {/* <!-- payment box --> */}
                <PaymentMethod 
                  selectedMethod={paymentMethod}
                  onMethodChange={setPaymentMethod}
                />

                {/* <!-- checkout button --> */}
                <button
                  type="submit"
                  className="w-full flex justify-center font-medium text-white bg-gradient-to-r from-gold to-gold-dark py-3 px-6 rounded-full shadow-md ease-out duration-200 hover:from-gold-dark hover:to-gold mt-7.5"
                >
                  Process to Checkout
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Crypto Payment Modal */}
      {showCryptoModal && (
        <CryptoPaymentModal
          isOpen={showCryptoModal}
          onClose={() => setShowCryptoModal(false)}
          orderId={cryptoOrderId}
          totalAmount={cryptoOrderTotal}
          cryptoType={paymentMethod}
          onPaymentSuccess={handleCryptoPaymentSuccess}
        />
      )}
    </>
  );
};

export default Checkout;

