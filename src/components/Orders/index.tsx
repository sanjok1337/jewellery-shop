"use client";
import React, { useEffect, useState } from "react";
import SingleOrder from "./SingleOrder";
import { useAuth } from "@/app/context/AuthContext";
import toast from "react-hot-toast";

interface Order {
  id: number;
  orderNumber: string;
  date: string;
  status: string;
  totalAmount: number;
  items: string;
  shippingAddress: string;
  phone?: string;
  paymentMethod: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        toast.error('Помилка завантаження замовлень');
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      toast.error('Помилка завантаження замовлень');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[770px]">
          {loading ? (
            <div className="py-9.5 px-4 sm:px-7.5 xl:px-10 text-center">
              <p>Завантаження замовлень...</p>
            </div>
          ) : (
            <>
              {/* <!-- order item --> */}
              {orders.length > 0 && (
                <div className="items-center justify-between py-4.5 px-7.5 hidden md:flex ">
                  <div className="min-w-[111px]">
                    <p className="text-custom-sm text-dark">Order</p>
                  </div>
                  <div className="min-w-[175px]">
                    <p className="text-custom-sm text-dark">Date</p>
                  </div>

                  <div className="min-w-[128px]">
                    <p className="text-custom-sm text-dark">Status</p>
                  </div>

                  <div className="min-w-[213px]">
                    <p className="text-custom-sm text-dark">Items</p>
                  </div>

                  <div className="min-w-[113px]">
                    <p className="text-custom-sm text-dark">Total</p>
                  </div>

                  <div className="min-w-[113px]">
                    <p className="text-custom-sm text-dark">Action</p>
                  </div>
                </div>
              )}
              {orders.length > 0 ? (
                orders.map((orderItem, key) => (
                  <SingleOrder key={key} orderItem={orderItem} smallView={false} />
                ))
              ) : (
                <p className="py-9.5 px-4 sm:px-7.5 xl:px-10">
                  У вас поки немає замовлень!
                </p>
              )}
            </>
          )}
        </div>

        {orders.length > 0 && !loading &&
          orders.map((orderItem, key) => (
            <SingleOrder key={key} orderItem={orderItem} smallView={true} />
          ))}
      </div>
    </>
  );
};

export default Orders;
