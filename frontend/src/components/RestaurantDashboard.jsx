import React, {
    useCallback,
    useContext,
    useEffect,
    useState
} from "react";
import axios from "axios";
import AppContext from "../context/AppContext";
import toast from "react-hot-toast";

const API_URL = "http://localhost:5000";

const emptyDishForm = {
    dishName: "",
    category: "",
    imgSrc: "",
    price: "",
    description: "",
    isVeg: false,
    isAvailable: true
};

const emptyLocationForm = {
    savedAddress: "",
    latitude: "",
    longitude: ""
};

const RestaurantDashboard = () => {
    const { isUserLogin, userRole, setDish } = useContext(AppContext);

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const [dishForm, setDishForm] = useState(emptyDishForm);
    const [savingDish, setSavingDish] = useState(false);
    const [updatingOrderId, setUpdatingOrderId] = useState("");

    const [restaurantLocation, setRestaurantLocation] = useState(
        emptyLocationForm
    );
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [savingLocation, setSavingLocation] = useState(false);

    const loadOrders = useCallback(async () => {
        setLoading(true);
        setErrorMessage("");

        try {
            const response = await axios.get(
                `${API_URL}/restaurant/orders`,
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
    }, []);

    const loadRestaurantLocation = useCallback(async () => {
        setLoadingLocation(true);

        try {
            const response = await axios.get(`${API_URL}/user/profile`, {
                withCredentials: true
            });

            const profile = response.data.profile;

            if (response.data.success && profile) {
                setRestaurantLocation({
                    savedAddress: profile.savedAddress || "",
                    latitude:
                        profile.restaurantLocation?.latitude == null
                            ? ""
                            : String(profile.restaurantLocation.latitude),
                    longitude:
                        profile.restaurantLocation?.longitude == null
                            ? ""
                            : String(profile.restaurantLocation.longitude)
                });
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to load restaurant pickup location."
            );
        } finally {
            setLoadingLocation(false);
        }
    }, []);

    useEffect(() => {
        if (isUserLogin && userRole === "restaurant") {
            loadOrders();
            loadRestaurantLocation();
        } else {
            setOrders([]);
            setLoading(false);
            setLoadingLocation(false);
        }
    }, [
        isUserLogin,
        userRole,
        loadOrders,
        loadRestaurantLocation
    ]);

    const handleLocationChange = (event) => {
        const { name, value } = event.target;

        setRestaurantLocation((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSaveLocation = async (event) => {
        event.preventDefault();

        const address = restaurantLocation.savedAddress.trim();
        const latitudeText = restaurantLocation.latitude.trim();
        const longitudeText = restaurantLocation.longitude.trim();

        if (!address) {
            toast.error("Please enter your restaurant pickup address.");
            return;
        }

        const hasLatitude = latitudeText !== "";
        const hasLongitude = longitudeText !== "";

        if (hasLatitude !== hasLongitude) {
            toast.error("Enter both coordinates or leave both empty.");
            return;
        }

        let location = null;

        if (hasLatitude && hasLongitude) {
            const latitude = Number(latitudeText);
            const longitude = Number(longitudeText);

            if (
                !Number.isFinite(latitude) ||
                !Number.isFinite(longitude) ||
                latitude < -90 ||
                latitude > 90 ||
                longitude < -180 ||
                longitude > 180
            ) {
                toast.error("Please enter valid latitude and longitude values.");
                return;
            }

            location = { latitude, longitude };
        }

        setSavingLocation(true);

        try {
            const response = await axios.patch(
                `${API_URL}/user/profile`,
                {
                    savedAddress: address,
                    restaurantLocation: location
                },
                { withCredentials: true }
            );

            if (!response.data.success) {
                toast.error(
                    response.data.message || "Unable to save pickup location."
                );
                return;
            }

            const profile = response.data.profile;

            setRestaurantLocation({
                savedAddress: profile?.savedAddress || address,
                latitude:
                    profile?.restaurantLocation?.latitude == null
                        ? ""
                        : String(profile.restaurantLocation.latitude),
                longitude:
                    profile?.restaurantLocation?.longitude == null
                        ? ""
                        : String(profile.restaurantLocation.longitude)
            });

            toast.success("Restaurant pickup location saved.");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to save pickup location. Please try again."
            );
        } finally {
            setSavingLocation(false);
        }
    };

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
                `${API_URL}/dish/restaurant-add`,
                {
                    ...dishForm,
                    price: Number(dishForm.price)
                },
                { withCredentials: true }
            );

            if (!response.data.success) {
                toast.error(
                    response.data.message || "Unable to add food item."
                );
                return;
            }

            const newDish = response.data.dish;

            if (newDish && typeof setDish === "function") {
                setDish((previous) => [
                    newDish,
                    ...(Array.isArray(previous) ? previous : [])
                ]);
            }

            toast.success("Food item added successfully!");
            setDishForm({ ...emptyDishForm });
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to add food item. Check your restaurant login and image URL."
            );
        } finally {
            setSavingDish(false);
        }
    };

    const updateOrderStatus = async (orderId, orderStatus) => {
        setUpdatingOrderId(orderId);

        try {
            const response = await axios.patch(
                `${API_URL}/restaurant/orders/${orderId}/status`,
                { orderStatus },
                { withCredentials: true }
            );

            if (!response.data.success) {
                toast.error(
                    response.data.message || "Unable to update order."
                );
                return;
            }

            setOrders((previous) =>
                previous.map((order) =>
                    order._id === orderId
                        ? {
                            ...order,
                            orderStatus:
                                response.data.order?.orderStatus || orderStatus
                        }
                        : order
                )
            );

            toast.success(`Order marked ${orderStatus}.`);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to update order status."
            );
        } finally {
            setUpdatingOrderId("");
        }
    };

    if (!isUserLogin || userRole !== "restaurant") {
        return (
            <section className="min-h-screen bg-gray-50 px-5 py-12 md:px-10">
                <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Restaurant Dashboard
                    </h1>
                    <p className="mt-3 text-gray-600">
                        Please log in with a Restaurant account to manage food items and orders.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-screen bg-gray-50 px-5 py-12 md:px-10 lg:px-16">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Restaurant Dashboard
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Manage your pickup location, menu, and incoming orders.
                    </p>
                </div>

                <form
                    onSubmit={handleSaveLocation}
                    className="mb-10 rounded-2xl bg-white p-6 shadow-sm md:p-8"
                >
                    <h2 className="mb-2 text-2xl font-bold text-gray-900">
                        Restaurant Pickup Location
                    </h2>

                    <p className="mb-6 text-sm text-gray-600">
                        Enter the address where delivery partners should collect orders.
                        Coordinates are optional, but entering them enables precise map navigation.
                    </p>

                    {loadingLocation ? (
                        <p className="text-gray-600">
                            Loading pickup location...
                        </p>
                    ) : (
                        <>
                            <div className="mb-5">
                                <label
                                    htmlFor="savedAddress"
                                    className="mb-2 block font-medium text-gray-700"
                                >
                                    Pickup address
                                </label>

                                <textarea
                                    id="savedAddress"
                                    name="savedAddress"
                                    value={restaurantLocation.savedAddress}
                                    onChange={handleLocationChange}
                                    placeholder="Enter your complete restaurant address"
                                    rows={3}
                                    maxLength={500}
                                    required
                                    className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-orange-500"
                                />
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="latitude"
                                        className="mb-2 block font-medium text-gray-700"
                                    >
                                        Latitude (optional)
                                    </label>

                                    <input
                                        id="latitude"
                                        name="latitude"
                                        type="number"
                                        min="-90"
                                        max="90"
                                        step="any"
                                        value={restaurantLocation.latitude}
                                        onChange={handleLocationChange}
                                        placeholder="e.g. 18.5204"
                                        className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-orange-500"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="longitude"
                                        className="mb-2 block font-medium text-gray-700"
                                    >
                                        Longitude (optional)
                                    </label>

                                    <input
                                        id="longitude"
                                        name="longitude"
                                        type="number"
                                        min="-180"
                                        max="180"
                                        step="any"
                                        value={restaurantLocation.longitude}
                                        onChange={handleLocationChange}
                                        placeholder="e.g. 73.8567"
                                        className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-orange-500"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={savingLocation}
                                className="mt-6 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {savingLocation
                                    ? "Saving Location..."
                                    : "Save Pickup Location"}
                            </button>
                        </>
                    )}
                </form>

                <form
                    onSubmit={handleAddDish}
                    className="mb-10 rounded-2xl bg-white p-6 shadow-sm md:p-8"
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
                                maxLength={100}
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
                                maxLength={60}
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
                            <p className="mt-1 text-xs text-gray-500">
                                For an image in frontend/public, enter its browser path, e.g. /BiriyaniImage.jpg.
                            </p>
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
                                maxLength={500}
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
                        className="mt-6 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {savingDish ? "Adding Food..." : "Add Food Item"}
                    </button>
                </form>

                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Incoming Orders
                    </h2>

                    <button
                        type="button"
                        onClick={loadOrders}
                        disabled={loading}
                        className="rounded-xl border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                    >
                        {loading ? "Refreshing..." : "Refresh Orders"}
                    </button>
                </div>

                {loading ? (
                    <div className="rounded-2xl bg-white p-6 text-gray-600 shadow-sm">
                        Loading restaurant orders...
                    </div>
                ) : errorMessage ? (
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <p className="font-semibold text-red-600">
                            {errorMessage}
                        </p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-900">
                            No orders yet
                        </h3>
                        <p className="mt-2 text-gray-600">
                            New orders containing your food items will appear here.
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
                                        <h3 className="break-all text-lg font-bold text-gray-900">
                                            Order #{order._id}
                                        </h3>
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
                                                    {item.name ||
                                                        item.foodId?.dishName ||
                                                        item.foodId?.name ||
                                                        "Food item"}
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
                                            Payment: {order.paymentMethod || "COD"} ·{" "}
                                            {order.paymentStatus || "Pending"}
                                        </p>
                                    </div>

                                    <p className="text-lg font-bold text-orange-500">
                                        Total: ₹{Number(order.totalAmount || 0).toFixed(2)}
                                    </p>
                                </div>

                                <div className="mt-5 flex flex-wrap gap-3">
                                    {order.orderStatus === "Confirmed" && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateOrderStatus(order._id, "Preparing")
                                            }
                                            disabled={updatingOrderId === order._id}
                                            className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                                        >
                                            {updatingOrderId === order._id
                                                ? "Updating..."
                                                : "Start Preparing"}
                                        </button>
                                    )}

                                    {order.orderStatus === "Preparing" && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateOrderStatus(order._id, "Ready for Pickup")
                                            }
                                            disabled={updatingOrderId === order._id}
                                            className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-60"
                                        >
                                            {updatingOrderId === order._id
                                                ? "Updating..."
                                                : "Ready for Pickup"}
                                        </button>
                                    )}
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