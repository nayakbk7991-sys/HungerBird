import React, { useContext } from "react";
import AppContext from "../context/AppContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const Menu = () => {
    const { dish, isUserLogin } = useContext(AppContext);
    const navigate = useNavigate()

    const handleOrder = () => {

        if (!isUserLogin) {
            toast.success("please login to place order")
        } else
            navigate("/order-confirmed")
    }

    return (
        <section className="min-h-screen bg-gray-50 px-5 py-12 md:px-10 lg:px-16">

            {/* Header */}
            <div className="mx-auto mb-10 max-w-7xl text-center">
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-orange-500">
                    Our Menu
                </p>

                <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
                    Delicious Food For Everyone
                </h1>

                <p className="mx-auto mt-3 max-w-2xl text-gray-500">
                    Explore our delicious selection of freshly prepared dishes.
                </p>
            </div>

            {/* Food Cards */}
            <div className="mx-auto grid max-w-7xl gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                {dish?.map((data) => (
                    <div
                        key={data._id}
                        className="group overflow-hidden rounded-2xl bg-white shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-xl"
                    >

                        {/* Image */}
                        <div className="relative h-52 overflow-hidden bg-gray-200">

                            <img
                                src={data.imgSrc}
                                alt={data.dishName}
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                            />

                            {/* Veg Badge */}
                            <div className="absolute left-3 top-3">
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold shadow ${data.isVeg
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {data.isVeg ? "🌱 Veg" : "🍗 Non-Veg"}
                                </span>
                            </div>

                            {/* Availability */}
                            <div className="absolute right-3 top-3">
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold shadow ${data.isAvailable
                                        ? "bg-green-500 text-white"
                                        : "bg-gray-700 text-white"
                                        }`}
                                >
                                    {data.isAvailable ? "Available" : "Unavailable"}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">

                            {/* Category */}
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-orange-500">
                                {data.category}
                            </p>

                            {/* Dish Name */}
                            <h2 className="truncate text-xl font-bold text-gray-900">
                                {data.dishName}
                            </h2>

                            {/* Price + Button */}
                            <div className="mt-5 flex items-center justify-between">

                                <div>
                                    <span className="text-sm text-gray-500">Price</span>
                                    <p className="text-2xl font-bold text-orange-500">
                                        ₹{data.price}
                                    </p>
                                </div>
                                <button onClick={handleOrder}
                                    disabled={!data.isAvailable}
                                    className={`rounded-xl px-5 py-2.5 cursor-pointer text-sm font-semibold transition ${data.isAvailable
                                        ? "bg-orange-500 text-white hover:bg-orange-600"
                                        : "cursor-not-allowed bg-gray-200 text-gray-400"
                                        }`}
                                >
                                    {data.isAvailable ? "Order" : "Unavailable"}
                                </button>

                            </div>
                        </div>
                    </div>
                ))}

            </div>

            {/* Empty State */}
            {(!dish || dish.length === 0) && (
                <div className="py-20 text-center">
                    <div className="text-5xl">🍽️</div>

                    <h2 className="mt-4 text-2xl font-bold text-gray-800">
                        No dishes available
                    </h2>

                    <p className="mt-2 text-gray-500">
                        Please check back later.
                    </p>
                </div>
            )}

        </section>
    );
};

export default Menu;
