
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import AppContext from "../context/AppContext";
import toast from "react-hot-toast";

const RestaurantDashboard = () => {
    const { isUserLogin } = useContext(AppContext);

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const [dishForm, setDishForm] = useState({
    dishName: "",
    category: "",
    imgSrc: "",
    price: "",
    description: "",
    isVeg: false,
    isAvailable: true
});

const [savingDish, setSavingDish] = useState(false);

const handleDishChange = (event) => {
    const { name, value, type, checked } = event.target;

    setDishForm((previous) => ({
        ...previous,
        [name]: type === "checkbox" ? checked : value
    }));
};

const handleAddDish = async (event) => {
    event.preventDefault();
    setSavingDish(true);

    try {
        const response = await axios.post(
            "http://localhost:5000/dish/restaurant-add",
            {
                ...dishForm,
                price: Number(dishForm.price)
            },
            { withCredentials: true }
        );

        if (response.data.success) {
            toast.success("Food item added successfully!");

            setDishForm({
                dishName: "",
                category: "",
                imgSrc: "",
                price: "",
                description: "",
                isVeg: false,
                isAvailable: true
            });
        } else {
            toast.error(response.data.message || "Unable to add food item.");
        }
    } catch (error) {
        toast.error(
            error.response?.data?.message ||
            "Unable to add food item. Please check your restaurant login."
        );
    } finally {
        setSavingDish(false);
    }
};

    useEffect(() => {
        if (!isUserLogin) {
            setLoading(false);
            return;
        }

        const fetchOrders = async () => {
            setLoading(true);
            setErrorMessage("");

            try {
                const response = await axios.get(
                    "http://localhost:5000/restaurant/orders",
                    { withCredentials: true }
                );

                if (response.data.success) {
                    setOrders(response.data.orders || []);
                } else {
                    setErrorMessage(
                        response.data.message || "Unable to load orders."
                    );
                }
            } catch (error) {
                setErrorMessage(
                    error.response?.data?.message ||
                    "Unable to load restaurant orders. Check that the backend is running."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [isUserLogin]);

    return (
        <section className="min-h-screen bg-gray-50 px-5 py-12 md:px-10 lg:px-16">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Restaurant Dashboard
                    </h1>

                    
{isUserLogin && (
    <form
        onSubmit={handleAddDish}
        className="mb-8 rounded-2xl bg-white p-6 shadow-sm md:p-8"
    >
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Add Food Item
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
            <div>
                <label className="mb-2 block font-medium text-gray-700">
                    Food name
                </label>
                <input
                    name="dishName"
                    value={dishForm.dishName}
                    onChange={handleDishChange}
                    placeholder="e.g. Paneer Biryani"
                    required
                    className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-orange-500"
                />
            </div>

            <div>
                <label className="mb-2 block font-medium text-gray-700">
                    Category
                </label>
                <input
                    name="category"
                    value={dishForm.category}
                    onChange={handleDishChange}
                    placeholder="e.g. Indian"
                    required
                    className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-orange-500"
                />
            </div>

            <div>
                <label className="mb-2 block font-medium text-gray-700">
                    Price (₹)
                </label>
                <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={dishForm.price}
                    onChange={handleDishChange}
                    placeholder="e.g. 180"
                    required
                    className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-orange-500"
                />
            </div>

            <div>
                <label className="mb-2 block font-medium text-gray-700">
                    Image URL
                </label>
                <input
                    name="imgSrc"
                    type="url"
                    value={dishForm.imgSrc}
                    onChange={handleDishChange}
                    placeholder="https://..."
                    required
                    className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-orange-500"
                />
            </div>

            <div className="md:col-span-2">
                <label className="mb-2 block font-medium text-gray-700">
                    Description
                </label>
                <textarea
                    name="description"
                    value={dishForm.description}
                    onChange={handleDishChange}
                    placeholder="Describe the food item"
                    rows={3}
                    className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-orange-500"
                />
            </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-gray-700">
                <input
                    type="checkbox"
                    name="isVeg"
                    checked={dishForm.isVeg}
                    onChange={handleDishChange}
                />
                Vegetarian
            </label>

            <label className="flex items-center gap-2 text-gray-700">
                <input
                    type="checkbox"
                    name="isAvailable"
                    checked={dishForm.isAvailable}
                    onChange={handleDishChange}
                />
                Available for ordering
            </label>
        </div>

        <button
            type="submit"
            disabled={savingDish}
            className="mt-6 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
        >
            {savingDish ? "Adding Food..." : "Add Food Item"}
        </button>
    </form>
)}

                    <p className="mt-2 text-gray-600">
                        Review incoming orders and monitor their progress.
                    </p>
                </div>

                {!isUserLogin ? (
                    <div className="rounded-2xl bg-white p-6 text-gray-700 shadow-sm">
                        Please log in with your restaurant account to continue.
                    </div>
                ) : loading ? (
                    <div className="rounded-2xl bg-white p-6 text-gray-600 shadow-sm">
                        Loading restaurant orders...
                    </div>
                ) : errorMessage ? (
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <p className="font-semibold text-red-600">
                            {errorMessage}
                        </p>
                        <p className="mt-2 text-sm text-gray-600">
                            Restaurant access requires a valid account with the
                            restaurant role.
                        </p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-900">
                            No orders yet
                        </h2>
                        <p className="mt-2 text-gray-600">
                            New orders for your restaurant will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <article
                                key={order._id}
                                className="rounded-2xl bg-white p-6 shadow-sm"
                            >
                                <div className="flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-start">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">
                                            Order #{order._id}
                                        </h2>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {order.createdAt
                                                ? new Date(order.createdAt).toLocaleString()
                                                : "Date unavailable"}
                                        </p>
                                    </div>

                                    <span className="w-fit rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
                                        {order.orderStatus || "Confirmed"}
                                    </span>
                                </div>

                                <div className="space-y-3 py-5">
                                    {order.items?.map((item, index) => (
                                        <div
                                            key={item.foodId?._id || item.foodId || index}
                                            className="flex justify-between gap-4"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    {item.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Quantity: {item.quantity}
                                                </p>
                                            </div>

                                            <p className="font-medium text-gray-800">
                                                ₹{Number(item.price) * Number(item.quantity)}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="text-sm text-gray-600">
                                        <p>
                                            <span className="font-semibold">
                                                Delivery address:
                                            </span>{" "}
                                            {order.deliveryAddress}
                                        </p>
                                        <p className="mt-1">
                                            Payment: {order.paymentMethod} · {order.paymentStatus}
                                        </p>
                                    </div>

                                    <p className="text-lg font-bold text-orange-500">
                                        Total: ₹{order.totalAmount}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default RestaurantDashboard;
