 
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import AppContext from "../context/AppContext";
import toast from "react-hot-toast";

const Cart = () => {
    const { cart, updateCartQuantity, removeFromCart } = useContext(AppContext);

    const totalAmount = cart.reduce(
        (total, item) => total + Number(item.price) * item.quantity,
        0
    );

    return (
        <section className="min-h-screen bg-gray-50 px-5 py-12 md:px-10 lg:px-16">
            <div className="mx-auto max-w-5xl">
                <h1 className="mb-8 text-3xl font-bold text-gray-900">
                    Your Cart
                </h1>

                {cart.length === 0 ? (
                    <div className="rounded-2xl bg-white p-10 text-center shadow">
                        <p className="text-lg text-gray-600">
                            Your cart is empty.
                        </p>
                        <Link
                            to="/menu"
                            className="mt-5 inline-block rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
                        >
                            Browse Menu
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {cart.map((item) => (
                                <div
                                    key={item._id}
                                    className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center"
                                >
                                    <img
                                        src={item.imgSrc || item.image}
                                        alt={item.dishName || item.name || "Food"}
                                        className="h-24 w-full rounded-xl object-cover sm:w-28"
                                    />

                                    <div className="flex-1">
                                        <h2 className="text-lg font-bold text-gray-900">
                                            {item.dishName || item.name || item.title || "Food item"}
                                        </h2>
                                        <p className="mt-1 text-orange-500">
                                            ₹{item.price} each
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() =>
                                                updateCartQuantity(item._id, item.quantity - 1)
                                            }
                                            className="rounded-lg border px-3 py-1.5"
                                        >
                                            −
                                        </button>

                                        <span className="min-w-6 text-center font-semibold">
                                            {item.quantity}
                                        </span>

                                        <button
                                            onClick={() =>
                                                updateCartQuantity(item._id, item.quantity + 1)
                                            }
                                            className="rounded-lg border px-3 py-1.5"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="sm:text-right">
                                        <p className="font-bold text-gray-900">
                                            ₹{Number(item.price) * item.quantity}
                                        </p>
                                        <button
                                            onClick={() => {
                                                removeFromCart(item._id);
                                                toast.success("Item removed from cart");
                                            }}
                                            className="mt-2 text-sm text-red-500 hover:text-red-700"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between text-xl font-bold">
                                <span>Total</span>
                                <span className="text-orange-500">
                                    ₹{totalAmount}
                                </span>
                            </div>

                            <Link
                                to="/checkout"
                                className="mt-6 block rounded-xl bg-orange-500 px-6 py-3 text-center font-semibold text-white hover:bg-orange-600"
                            >
                                Proceed to Checkout
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};

export default Cart;
