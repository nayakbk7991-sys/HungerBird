
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AppContext from "../context/AppContext";

const portalDetails = {
    customer: {
        title: "Customer Login",
        role: "customer",
        destination: "/menu",
        registerRole: "customer",
    },
    restaurant: {
        title: "Restaurant Login",
        role: "restaurant",
        destination: "/restaurant-dashboard",
        registerRole: "restaurant",
    },
    deliveryPartner: {
        title: "Delivery Partner Login",
        role: "deliveryPartner",
        destination: "/delivery-dashboard",
        registerRole: "deliveryPartner",
    },
};

const roleNames = {
    customer: "Customer",
    restaurant: "Restaurant",
    deliveryPartner: "Delivery Partner",
};

const Login = ({ portal = "customer" }) => {
    const navigate = useNavigate();
    const { loginUser, logoutUser } = useContext(AppContext);

    const selectedPortal = portalDetails[portal] || portalDetails.customer;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!email.trim() || !password) {
            toast.error("Please enter your email and password.");
            return;
        }

        setLoading(true);

        try {
            const res = await loginUser(
                email.trim(),
                password,
                selectedPortal.role
            );

            const actualRole = res?.user?.role || res?.role || "";

            console.log("Selected login portal:", selectedPortal.role);
            console.log("Role returned by backend:", actualRole);
            console.log("Login response:", res);

            if (res?.success !== true) {
                toast.error(res?.message || "Login failed.");
                return;
            }

            if (actualRole !== selectedPortal.role) {
                try {
                    await logoutUser();
                } catch (logoutError) {
                    console.error(
                        "Logout after role mismatch failed:",
                        logoutError
                    );
                }

                toast.error(
                    `This is a ${roleNames[actualRole] || actualRole || "different"} account. Please use the correct login portal.`
                );

                return;
            }

            const destinations = {
                customer: "/menu",
                restaurant: "/restaurant-dashboard",
                deliveryPartner: "/delivery-dashboard",
            };

            navigate(destinations[actualRole], { replace: true });
            toast.success("Login successful.");
        } catch (error) {
            console.error(
                "Login error:",
                error.response?.data || error.message
            );

            toast.error(
                error.response?.data?.message ||
                    "Unable to log in. Please check your connection and credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center bg-orange-50 px-4 py-10">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg sm:p-8">
                <h1 className="mb-2 text-2xl font-bold text-gray-800">
                    {selectedPortal.title}
                </h1>

                <p className="mb-6 text-sm text-gray-600">
                    Sign in using the account registered for this portal.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Email address
                        </label>

                        <input
                            id="email"
                            type="email"
                            autoComplete="username"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="Enter your email"
                            className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-orange-500"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>

                        <div className="flex items-center gap-2">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                placeholder="Enter your password"
                                className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-orange-500"
                                required
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword((current) => !current)
                                }
                                className="rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-700"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Signing in..." : "Login"}
                    </button>
                </form>

                <p className="mt-6 text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link
                        to={`/register?role=${selectedPortal.registerRole}`}
                        className="font-semibold text-orange-600 hover:underline"
                    >
                        Register here
                    </Link>
                </p>

                <div className="mt-4 text-sm">
                    <Link
                        to="/choose-login"
                        className="text-orange-600 hover:underline"
                    >
                        Back to portal selection
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
