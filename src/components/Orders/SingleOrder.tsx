import React, { useState } from "react";
import OrderActions from "./OrderActions";
import OrderModal from "./OrderModal";

const SingleOrder = ({ orderItem, smallView }: any) => {
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const toggleModal = (status: boolean) => {
    setShowDetails(status);
  };

  return (
    <>
      {!smallView && (
        <div className="items-center justify-between border-t border-gray-3 py-5 px-7.5 hidden md:flex">
          <div className="min-w-[111px]">
            <p className="text-custom-sm text-red">
              {orderItem.orderNumber}
            </p>
          </div>
          <div className="min-w-[175px]">
            <p className="text-custom-sm text-dark">
              {new Date(orderItem.date).toLocaleDateString('uk-UA')}
            </p>
          </div>

          <div className="min-w-[128px]">
            <p
              className={`inline-block text-custom-sm py-0.5 px-2.5 rounded-[30px] capitalize ${
                orderItem.status === "delivered"
                  ? "text-green bg-green-light-6"
                  : orderItem.status === "shipped"
                  ? "text-gold bg-gold-light-6"
                  : orderItem.status === "pending"
                  ? "text-yellow bg-yellow-light-4"
                  : orderItem.status === "paid"
                  ? "text-green bg-green-light-6"
                  : orderItem.status === "awaiting_delivery"
                  ? "text-blue-600 bg-blue-100"
                  : orderItem.status === "cancelled"
                  ? "text-red bg-red-light-6"
                  : "text-gray bg-gray-light-6"
              }`}
            >
              {orderItem.status === "awaiting_delivery" ? "Очікує доставки" : orderItem.status}
            </p>
          </div>

          <div className="min-w-[213px]">
            <p className="text-custom-sm text-dark" title={orderItem.items}>
              {orderItem.items.length > 50 ? 
                orderItem.items.substring(0, 50) + '...' : 
                orderItem.items}
            </p>
          </div>

          <div className="min-w-[113px]">
            <p className="text-custom-sm text-dark">${orderItem.totalAmount}</p>
          </div>

          <div className="flex gap-5 items-center">
            <OrderActions
              toggleDetails={toggleDetails}
            />
          </div>
        </div>
      )}

      {smallView && (
        <div className="block md:hidden">
          <div className="py-4.5 px-7.5">
            <div className="">
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2"> Order:</span>
                {orderItem.orderNumber}
              </p>
            </div>
            <div className="">
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2">Date:</span>{" "}
                {new Date(orderItem.date).toLocaleDateString('uk-UA')}
              </p>
            </div>

            <div className="">
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2">Status:</span>{" "}
                <span
                  className={`inline-block text-custom-sm py-0.5 px-2.5 rounded-[30px] capitalize ${
                    orderItem.status === "delivered"
                      ? "text-green bg-green-light-6"
                      : orderItem.status === "shipped"
                      ? "text-gold bg-gold-light-6"
                      : orderItem.status === "pending"
                      ? "text-yellow bg-yellow-light-4"
                      : orderItem.status === "paid"
                      ? "text-green bg-green-light-6"
                      : orderItem.status === "awaiting_delivery"
                      ? "text-blue-600 bg-blue-100"
                      : orderItem.status === "cancelled"
                      ? "text-red bg-red-light-6"
                      : "text-gray bg-gray-light-6"
                  }`}
                >
                  {orderItem.status === "awaiting_delivery" ? "Очікує доставки" : orderItem.status}
                </span>
              </p>
            </div>

            <div className="">
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2">Items:</span> {orderItem.items}
              </p>
            </div>

            <div className="">
              <p className="text-custom-sm text-dark">
                <span className="font-bold pr-2">Total:</span>
                ${orderItem.totalAmount}
              </p>
            </div>

            <div className="">
              <p className="text-custom-sm text-dark flex items-center">
                <span className="font-bold pr-2">Дії:</span>{" "}
                <OrderActions
                  toggleDetails={toggleDetails}
                />
              </p>
            </div>
          </div>
        </div>
      )}

      <OrderModal
        showDetails={showDetails}
        toggleModal={toggleModal}
        order={orderItem}
      />
    </>
  );
};

export default SingleOrder;

