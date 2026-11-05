
import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import AppContext from "../context/AppContext";
import toast from "react-hot-toast";

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [20.5937, 78.9629];

const MapClickHandler = ({ onPick }) => {
    useMapEvents({
        click(event) {
            onPick(event.latlng.lat, event.latlng.lng);
        },
    });

    return null;
};

const MapCenterUpdater = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, 16, { duration: 0.7 });
        }
    }, [map, position]);

    return null;
};

const Register = () => {
    const { registerUser } = useContext(AppContext);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const requestedRole = searchParams.get("role");
    const validRoles = ["customer", "restaurant", "deliveryPartner"];

    const initialRole = validRoles.includes(requestedRole)
        ? requestedRole
        : "customer";

    const roleIsLocked = validRoles.includes(requestedRole);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phoneNo: "",
        role: initialRole,
    });

    const [restaurantAddress, setRestaurantAddress] = useState("");
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [addressSearch, setAddressSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchingAddress, setSearchingAddress] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const roleDetails = {
        customer: {
            title: "Create Customer Account",
            description: "Join HungerBird and order your favourite food",
            destination: "/login",
        },
        restaurant: {
            title: "Register Your Restaurant",
            description: "Create an account to manage your restaurant",
            destination: "/restaurant-login",
        },
        deliveryPartner: {
            title: "Join as a Delivery Partner",
            description: "Create an account to start your delivery journey",
            destination: "/delivery-login",
        },
    };

    const selectedRole = roleDetails[formData.role];
    const position =
        latitude !== null && longitude !== null
            ? [latitude, longitude]
            : null;

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleMapPick = (lat, lng) => {
        setLatitude(Number(lat.toFixed(7)));
        setLongitude(Number(lng.toFixed(7)));
    };

    const searchForAddress = async (event) => {
        event.preventDefault();

        const query = addressSearch.trim();

        if (!query) {
            toast.error("Enter an address or restaurant name to search.");
            return;
        }

        try {
            setSearchingAddress(true);
            setSearchResults([]);

            const params = new URLSearchParams({
                format: "jsonv2",
                limit: "5",
                q: query,
            });

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?${params.toString()}`
            );

            if (!response.ok) {
                throw new Error("Map search is temporarily unavailable.");
            }

            const results = await response.json();

            setSearchResults(results);

            if (results.length === 0) {
                toast.error(
                    "No matching location found. Try a more complete address."
                );
            }
        } catch (error) {
            toast.error(error.message || "Unable to search this address.");
        } finally {
            setSearchingAddress(false);
        }
    };

    const chooseSearchResult = (result) => {
        const lat = Number(result.lat);
        const lng = Number(result.lon);

        setRestaurantAddress(result.display_name || "");
        setAddressSearch(result.display_name || "");
        setLatitude(lat);
        setLongitude(lng);
        setSearchResults([]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (isSubmitting) return;

        const { name, email, password, phoneNo, role } = formData;

        if (role === "restaurant") {
            if (!restaurantAddress.trim()) {
                toast.error("Enter your restaurant's full address.");
                return;
            }

            if (latitude === null || longitude === null) {
                toast.error(
                    "Search for your restaurant and select its map location, or click its exact position on the map."
                );
                return;
            }

            if (
                !Number.isFinite(latitude) ||
                !Number.isFinite(longitude) ||
                latitude < -90 ||
                latitude > 90 ||
                longitude < -180 ||
                longitude > 180
            ) {
                toast.error("Please select a valid map location.");
                return;
            }
        }

        try {
            setIsSubmitting(true);

            const locationData =
                role === "restaurant"
                    ? {
                          savedAddress: restaurantAddress.trim(),
                          restaurantLocation: {
                              latitude,
                              longitude,
                          },
                      }
                    : null;

            const res = await registerUser(
                name.trim(),
                email.trim(),
                password,
                phoneNo.trim(),
                role,
                locationData
            );

            if (res?.success === false) {
                toast.error(res.message || "Registration failed.");
                return;
            }

            toast.success(
                res?.message || "Account registered successfully."
            );

            navigate(selectedRole.destination);
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Unable to register your account.";

            toast.error(message);

            console.error(
                "Registration Error:",
                error.response?.data || error.message
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-orange-50 px-4 py-10">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl">
                <div className="mb-8 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-3xl">
                        🍽️
                    </div>

                    <h1 className="mt-4 text-3xl font-bold text-gray-900">
                        {selectedRole.title}
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        {selectedRole.description}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="role"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Account type
                        </label>

                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                            disabled={roleIsLocked}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                        >
                            <option value="customer">Customer</option>
                            <option value="restaurant">Restaurant</option>
                            <option value="deliveryPartner">
                                Delivery Partner
                            </option>
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            {formData.role === "restaurant"
                                ? "Restaurant Name"
                                : "Full Name"}
                        </label>

                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder={
                                formData.role === "restaurant"
                                    ? "e.g. Hotel Paradise"
                                    : "Enter your name"
                            }
                            autoComplete="name"
                            required
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Email Address
                        </label>

                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            autoComplete="email"
                            required
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="phoneNo"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Phone Number
                        </label>

                        <input
                            id="phoneNo"
                            type="tel"
                            name="phoneNo"
                            value={formData.phoneNo}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                            autoComplete="tel"
                            required
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            autoComplete="new-password"
                            minLength={6}
                            required
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />
                    </div>

                    {formData.role === "restaurant" && (
                        <div className="space-y-4 rounded-xl border border-orange-200 bg-orange-50/50 p-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Restaurant location
                                </h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    This address will be saved as your
                                    restaurant's pickup location.
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="restaurantAddress"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Full Restaurant Address
                                </label>

                                <textarea
                                    id="restaurantAddress"
                                    value={restaurantAddress}
                                    onChange={(event) =>
                                        setRestaurantAddress(event.target.value)
                                    }
                                    placeholder="Building, street, area, city, state and PIN code"
                                    rows={3}
                                    required
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="addressSearch"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Find your restaurant on the map
                                </label>

                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <input
                                        id="addressSearch"
                                        type="search"
                                        value={addressSearch}
                                        onChange={(event) =>
                                            setAddressSearch(event.target.value)
                                        }
                                        placeholder="Search restaurant, street or landmark"
                                        className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                    />

                                    <button
                                        type="button"
                                        onClick={searchForAddress}
                                        disabled={searchingAddress}
                                        className="rounded-xl bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-700 disabled:opacity-60"
                                    >
                                        {searchingAddress
                                            ? "Searching..."
                                            : "Search map"}
                                    </button>
                                </div>
                            </div>

                            {searchResults.length > 0 && (
                                <div className="space-y-2 rounded-xl border border-gray-200 bg-white p-3">
                                    <p className="text-sm font-medium text-gray-700">
                                        Select the correct result:
                                    </p>

                                    {searchResults.map((result) => (
                                        <button
                                            key={result.place_id}
                                            type="button"
                                            onClick={() =>
                                                chooseSearchResult(result)
                                            }
                                            className="block w-full rounded-lg border border-gray-100 p-3 text-left text-sm text-gray-700 hover:border-orange-400 hover:bg-orange-50"
                                        >
                                            {result.display_name}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="overflow-hidden rounded-xl border border-gray-200">
                                <MapContainer
                                    center={position || DEFAULT_CENTER}
                                    zoom={position ? 16 : 5}
                                    scrollWheelZoom
                                    style={{
                                        height: "350px",
                                        width: "100%",
                                    }}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />

                                    <MapClickHandler onPick={handleMapPick} />
                                    <MapCenterUpdater position={position} />

                                    {position && <Marker position={position} />}
                                </MapContainer>
                            </div>

                            <p className="text-sm text-gray-600">
                                Search for the address and select a result, or
                                click the exact restaurant entrance on the map.
                                You can move the pin by clicking another point.
                            </p>

                            {position ? (
                                <div className="rounded-lg bg-white p-3 text-sm text-gray-700">
                                    <p className="font-medium text-green-700">
                                        Map location selected
                                    </p>
                                    <p>Latitude: {latitude}</p>
                                    <p>Longitude: {longitude}</p>
                                </div>
                            ) : (
                                <p className="text-sm font-medium text-red-600">
                                    Select the restaurant's exact location
                                    before creating the account.
                                </p>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-orange-500 py-3.5 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSubmitting
                            ? "Creating account..."
                            : "Create Account"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link
                        to={selectedRole.destination}
                        className="font-semibold text-orange-500 hover:text-orange-600"
                    >
                        Login
                    </Link>
                </p>

                <p className="mt-4 text-center text-sm">
                    <Link
                        to="/choose-login"
                        className="font-medium text-gray-600 hover:text-orange-600"
                    >
                        Back to portal selection
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
