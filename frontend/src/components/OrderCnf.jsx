import React from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

const OrderCnf = () => {
const location = useLocation();
const order = location.state?.order;

    return (
        <section className="flex min-h-[80vh] items-center justify-center bg-gray-50 px-5 py-12">

            <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl md:p-12">

                {/* Success Icon */}
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-4xl text-white">
                        ✓
                    </div>
                </div>

                {/* Title */}
                <h1 className="mt-7 text-3xl font-bold text-gray-900 md:text-4xl">
                    Order Confirmed!
                </h1>

                {/* Message */}
                <p className="mt-4 text-lg text-gray-600">
                    Thank you for your order. Your order has been successfully
                    placed.
                </p>

                {/* Waiting Message */}
                <div className="mt-6 rounded-xl bg-orange-50 p-4">
                    <p className="font-medium text-orange-700">
                        🍽️ Please wait while we prepare your delicious food.
                    </p>

                    <p className="mt-1 text-sm text-orange-600">
                        Your order will be ready soon.
                    </p>
                </div>

                <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 text-left">
    <h2 className="text-xl font-bold text-gray-900">
        Order Details
    </h2>

    <p className="mt-4 break-all text-gray-700">
        <span className="font-semibold">Order ID:</span>{" "}
        {order?._id || "Order ID unavailable"}
    </p>

    <p className="mt-2 text-gray-700">
        <span className="font-semibold">Order Status:</span>{" "}
        {order?.orderStatus || "Confirmed"}
    </p>

    <p className="mt-2 text-gray-700">
        <span className="font-semibold">Total Amount:</span>{" "}
        ₹{order?.totalAmount ?? "Unavailable"}
    </p>
</div>

                {/* Buttons */}
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">

                    <Link
                        to="/"
                        className="rounded-xl bg-red-500 px-6 py-3 font-semibold text-white transition hover:bg-red-600"
                    >
                        🏠 Go to Home
                    </Link>

                    <Link
                        to="/menu"
                        className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100"
                    >
                        🍽️ View Menu
                    </Link>

                </div>

            </div>

        </section>
    );
};

export default OrderCnf;
