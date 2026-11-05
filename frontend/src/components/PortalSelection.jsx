
import React from "react";
import { Link } from "react-router-dom";

const PortalSelection = () => {
    return (
        <section className="min-h-screen bg-orange-50 px-5 py-12 md:px-10">
            <div className="mx-auto max-w-6xl">
                <div className="mb-10 text-center">
                    <div className="text-5xl">🍽️</div>

                    <h1 className="mt-4 text-3xl font-bold text-gray-900 md:text-4xl">
                        Welcome to HungerBird
                    </h1>

                    <p className="mt-3 text-gray-600">
                        Select the portal you want to access.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <article className="rounded-2xl bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                        <div className="text-4xl">🛍️</div>

                        <h2 className="mt-5 text-xl font-bold text-gray-900">
                            Customer Portal
                        </h2>

                        <p className="mt-3 min-h-16 text-gray-600">
                            Explore food, add items to your cart, place
                            orders, and track your deliveries.
                        </p>

                        <Link
                            to="/login"
                            className="mt-6 block rounded-xl bg-orange-500 px-5 py-3 text-center font-semibold text-white hover:bg-orange-600"
                        >
                            Customer Login
                        </Link>

                        <Link
                            to="/register?role=customer"
                            className="mt-3 block text-center font-medium text-orange-600 hover:text-orange-700"
                        >
                            Create Customer Account
                        </Link>
                    </article>

                    <article className="rounded-2xl bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                        <div className="text-4xl">🏪</div>

                        <h2 className="mt-5 text-xl font-bold text-gray-900">
                            Restaurant Portal
                        </h2>

                        <p className="mt-3 min-h-16 text-gray-600">
                            Add food items, manage your menu, and update
                            restaurant order preparation status.
                        </p>

                        <Link
                            to="/restaurant-login"
                            className="mt-6 block rounded-xl bg-gray-900 px-5 py-3 text-center font-semibold text-white hover:bg-gray-800"
                        >
                            Restaurant Login
                        </Link>

                        <Link
                            to="/register?role=restaurant"
                            className="mt-3 block text-center font-medium text-orange-600 hover:text-orange-700"
                        >
                            Create Restaurant Account
                        </Link>
                    </article>

                    <article className="rounded-2xl bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                        <div className="text-4xl">🛵</div>

                        <h2 className="mt-5 text-xl font-bold text-gray-900">
                            Delivery Partner Portal
                        </h2>

                        <p className="mt-3 min-h-16 text-gray-600">
                            Accept available deliveries, confirm pickups,
                            and update delivery progress.
                        </p>

                        <Link
                            to="/delivery-login"
                            className="mt-6 block rounded-xl bg-green-600 px-5 py-3 text-center font-semibold text-white hover:bg-green-700"
                        >
                            Delivery Partner Login
                        </Link>

                        <Link
                            to="/register?role=deliveryPartner"
                            className="mt-3 block text-center font-medium text-orange-600 hover:text-orange-700"
                        >
                            Create Delivery Partner Account
                        </Link>
                    </article>
                </div>

                <div className="mt-8 text-center">
                    <Link
                        to="/"
                        className="font-medium text-gray-600 hover:text-orange-600"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default PortalSelection;
