import React, {
    useCallback,
    useContext,
    useEffect,
    useState
} from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import AppContext from "../context/AppContext";
import OrderStatusTimeline from "./OrderStatusTimeline";

const API_URL = "http://localhost:5000";

const MyOrders = () => {
    const { isUserLogin } = useContext(AppContext);

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [cancellingOrderId, setCancellingOrderId] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const fetchOrders = useCallback(async (initialLoad = false) => {
        if (initialLoad) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }

        try {
            const response = await axios.get(
                `${API_URL}/order/my-orders`,
                { withCredentials: true }
            );

            if (response.data.success) {
                setOrders(response.data.orders || []);
                setErrorMessage("");
            } else {
                setErrorMessage(
                    response.data.message || "Unable to load your orders."
                );
            }
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message ||
                "Unable to load your orders. Please check your login."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (!isUserLogin) {
            setOrders([]);
            setLoading(false);
            return;
        }

        fetchOrders(true);

        const intervalId = setInterval(() => {
            fetchOrders(false);
        }, 10000);

        return () => clearInterval(intervalId);
    }, [isUserLogin, fetchOrders]);

    const cancelOrder = async (orderId) => {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this order?"
        );

        if (!confirmed) {
            return;
        }

        setCancellingOrderId(orderId);

        try {
            const response = await axios.patch(
                `${API_URL}/order/${orderId}/cancel`,
                {},
                { withCredentials: true }
            );

            if (!response.data.success) {
                toast.error(
                    response.data.message || "Unable to cancel order."
                );
                return;
            }

            setOrders((previous) =>
                previous.map((order) =>
                    order._id === orderId
                        ? { ...order, ...response.data.order }
                        : order
                )
            );

            toast.success("Order cancelled successfully.");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to cancel this order."
            );

            await fetchOrders(false);
        } finally {
            setCancellingOrderId("");
        }
    };

    if (!isUserLogin) {
        return (
            <section className="min-h-screen bg-gray-50 px-5 py-12 md:px-10">
                <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 text-center shadow-sm">
                    <h1 className="text-3xl font-bold text-gray-900">
                        My Orders
                    </h1>
                    <p className="mt-3 text-gray-600">
                        Log in to view your order history.
                    </p>
                    <Link
                        to="/login"
                        className="mt-5 inline-block rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
                    >
                        Login
                    </Link>
                </div>
            </section>
        );
    }

    if (loading) {
        return (
            <section className="min-h-screen bg-gray-50 p-8">
                Loading your orders...
            </section>
        );
    }

    return (
        <section className="min-h-screen bg-gray-50 px-5 py-12 md:px-10 lg:px-16">
            <div className="mx-auto max-w-5xl">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            My Orders
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Track your orders and delivery updates.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => fetchOrders(false)}
                        disabled={refreshing}
                        className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60"
                    >
                        {refreshing ? "Refreshing..." : "Refresh Orders"}
                    </button>
                </div>

                {errorMessage ? (
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <p className="font-semibold text-red-600">
                            {errorMessage}
                        </p>
                        <button
                            type="button"
                            onClick={() => fetchOrders(true)}
                            className="mt-4 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
                        >
                            Try Again
                        </button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-900">
                            No orders yet
                        </h2>
                        <p className="mt-2 text-gray-600">
                            Your placed orders will appear here.
                        </p>
                        <Link
                            to="/menu"
                            className="mt-5 inline-block rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
                        >
                            Browse Menu
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <article
                                key={order._id}
                                className="rounded-2xl bg-white p-6 shadow-sm md:p-8"
                            >
                                <div className="flex flex-col justify-between gap-3 border-b pb-5 sm:flex-row sm:items-start">
                                    <div>
                                        <h2 className="break-all text-lg font-bold text-gray-900">
                                            Order #{order._id}
                                        </h2>
                                        <p className="mt-2 text-sm text-gray-500">
                                            {order.createdAt
                                                ? new Date(
                                                    order.createdAt
                                                ).toLocaleString()
                                                : "Date unavailable"}
                                        </p>
                                    </div>
                                    <span className="w-fit rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
                                        {order.orderStatus || "Confirmed"}
                                    </span>
                                </div>

                                <div className="space-y-4 py-5">
                                    <h3 className="font-semibold text-gray-900">
                                        Items Ordered
                                    </h3>

                                    {order.items?.map((item, index) => (
                                        <div
                                            key={item.foodId?._id || item.foodId || index}
                                            className="flex justify-between gap-4"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    {item.name || "Food item"}
                                                </p>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Quantity: {item.quantity}
                                                </p>
                                            </div>
                                            <p className="font-medium text-gray-800">
                                                ₹{Number(item.price) * Number(item.quantity)}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2 border-t py-5 text-sm text-gray-600">
                                    <p>
                                        <span className="font-semibold text-gray-800">
                                            Delivery address:
                                        </span>{" "}
                                        {order.deliveryAddress || "Address unavailable"}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-gray-800">
                                            Payment method:
                                        </span>{" "}
                                        {order.paymentMethod || "COD"}
                                    </p>
                                    <p>
                                        <span className="font-semibold text-gray-800">
                                            Payment status:
                                        </span>{" "}
                                        {order.paymentStatus || "Pending"}
                                    </p>
                                </div>

                                {order.deliveryPartner && (
                                    <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                                        <h3 className="font-semibold text-green-800">
                                            Delivery Partner
                                        </h3>
                                        <p className="mt-2 text-sm text-green-900">
                                            {order.deliveryPartner.name || "Partner assigned"}
                                        </p>
                                        {order.deliveryPartner.phoneNo && (
                                            <p className="mt-1 text-sm text-green-900">
                                                Phone:{" "}
                                                <a
                                                    href={`tel:${order.deliveryPartner.phoneNo}`}
                                                    className="font-semibold underline"
                                                >
                                                    {order.deliveryPartner.phoneNo}
                                                </a>
                                            </p>
                                        )}
                                    </div>
                                )}

                                {order.deliveryIssue?.reason && (
                                    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                                        <h3 className="font-semibold text-amber-900">
                                            Delivery issue update
                                        </h3>
                                        <p className="mt-2 text-sm text-amber-800">
                                            <strong>Reason:</strong>{" "}
                                            {order.deliveryIssue.reason}
                                        </p>
                                        <p className="mt-1 text-sm text-amber-800">
                                            <strong>Issue status:</strong>{" "}
                                            {order.deliveryIssue.status || "Open"}
                                        </p>
                                        {order.deliveryIssue.reportedAt && (
                                            <p className="mt-1 text-sm text-amber-800">
                                                <strong>Reported:</strong>{" "}
                                                {new Date(
                                                    order.deliveryIssue.reportedAt
                                                ).toLocaleString()}
                                            </p>
                                        )}
                                        {order.deliveryIssue.resolutionNote && (
                                            <p className="mt-2 text-sm text-green-800">
                                                <strong>Resolution update:</strong>{" "}
                                                {order.deliveryIssue.resolutionNote}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {order.orderStatus === "Confirmed" &&
                                    !order.deliveryPartner && (
                                        <div className="mt-5">
                                            <button
                                                type="button"
                                                onClick={() => cancelOrder(order._id)}
                                                disabled={cancellingOrderId === order._id}
                                                className="rounded-xl border border-red-300 px-5 py-3 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                                            >
                                                {cancellingOrderId === order._id
                                                    ? "Cancelling..."
                                                    : "Cancel Order"}
                                            </button>
                                            <p className="mt-2 text-xs text-gray-500">
                                                Cancellation is available before
                                                the restaurant starts preparing
                                                your order.
                                            </p>
                                        </div>
                                    )}

                                <div className="mt-5 border-t pt-5">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="font-semibold text-gray-700">
                                            Total amount
                                        </span>
                                        <span className="text-xl font-bold text-orange-500">
                                            ₹{order.totalAmount}
                                        </span>
                                    </div>
                                    <OrderStatusTimeline
                                        status={order.orderStatus}
                                        deliveryIssue={order.deliveryIssue}
                                    />
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>

            <p className="mx-auto mt-6 max-w-5xl text-center text-xs text-gray-500">
                Order status refreshes automatically every 10 seconds.
            </p>
        </section>
    );
};

export default MyOrders;