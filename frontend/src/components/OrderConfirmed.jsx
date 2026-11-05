
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OrderConfirmed = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const order = state?.order;

  const orderId = order?._id || order?.id;
  const items = order?.items || [];
  const deliveryAddress = order?.deliveryAddress || "See your order details";
  const paymentMethod = order?.paymentMethod || "COD";
  const orderStatus = order?.orderStatus || order?.status || "Confirmed";

  const totalAmount = Number(
    order?.totalAmount ?? order?.totalPrice ?? order?.amount ?? 0
  );

  return (
    <section className="min-h-screen bg-gray-50 px-5 py-12">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm md:p-10">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
            ✓
          </div>

          <h1 className="mt-5 text-3xl font-bold text-gray-900">
            Order placed successfully!
          </h1>

          <p className="mt-3 text-gray-600">
            Thank you for ordering with HungerBird. You can track your order
            from the My Orders page.
          </p>
        </div>

        {order ? (
          <div className="mt-8 space-y-5 rounded-xl border border-gray-200 p-5">
            {orderId && (
              <div className="flex flex-wrap justify-between gap-2">
                <span className="text-gray-500">Order ID</span>
                <span className="break-all font-medium text-gray-900">
                  {orderId}
                </span>
              </div>
            )}

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Order status</span>
              <span className="font-semibold text-orange-600">
                {orderStatus}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">Payment method</span>
              <span className="font-medium text-gray-900">
                {paymentMethod === "COD" ? "Cash on Delivery" : paymentMethod}
              </span>
            </div>

            <div>
              <p className="mb-2 font-medium text-gray-700">
                Delivery address
              </p>
              <p className="break-words text-gray-600">{deliveryAddress}</p>
            </div>

            {items.length > 0 && (
              <div>
                <h2 className="mb-3 font-semibold text-gray-900">
                  Ordered items
                </h2>

                <div className="space-y-3">
                  {items.map((item, index) => {
                    const food = item.foodId;
                    const name =
                      item.dishName ||
                      item.name ||
                      (typeof food === "object"
                        ? food?.dishName || food?.name
                        : "") ||
                      "Food item";

                    return (
                      <div
                        key={item._id || `${name}-${index}`}
                        className="flex justify-between gap-4 text-sm"
                      >
                        <span className="text-gray-600">
                          {name} × {item.quantity || 1}
                        </span>
                        <span className="font-medium text-gray-800">
                          {item.price != null
                            ? `₹${Number(item.price) * (item.quantity || 1)}`
                            : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {totalAmount > 0 && (
              <div className="flex justify-between border-t pt-4 text-lg font-bold">
                <span>Total amount</span>
                <span className="text-orange-500">₹{totalAmount}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-8 rounded-xl bg-orange-50 p-4 text-center text-gray-700">
            Your order confirmation details aren't available on this page.
            Please visit My Orders to check your order status.
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => navigate("/my-orders")}
            className="flex-1 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
          >
            Track My Orders
          </button>

          <button
            onClick={() => navigate("/menu")}
            className="flex-1 rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </section>
  );
};

export default OrderConfirmed;
