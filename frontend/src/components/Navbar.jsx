
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppContext from "../context/AppContext";
import toast from "react-hot-toast";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const {
        isUserLogin,
        logoutUser,
        cart = [],
        userRole,
        authLoading
    } = useContext(AppContext);

    const navigate = useNavigate();

    const cartCount = cart.reduce(
        (total, item) => total + (Number(item.quantity) || 1),
        0
    );

    const roleHome = {
        customer: "/menu",
        restaurant: "/restaurant-dashboard",
        deliveryPartner: "/delivery-dashboard"
    };

    const dashboardLabel = {
        restaurant: "Restaurant Dashboard",
        deliveryPartner: "Delivery Dashboard"
    };

    const closeMenu = () => setMenuOpen(false);

    const navLinkClass =
        "font-medium text-gray-600 transition hover:text-red-500";

    const handleLogout = async () => {
        try {
            await logoutUser();
            closeMenu();
            navigate("/choose-login", { replace: true });
            toast.success("Logout successful");
        } catch (error) {
            toast.error("Logout failed. Please try again.");
        }
    };

    const renderLink = (to, label, className = navLinkClass) => (
        <Link
            key={to + label}
            to={to}
            className={className}
            onClick={closeMenu}
        >
            {label}
        </Link>
    );

    const renderAuthAction = (mobile = false) => {
        if (authLoading) {
            return (
                <span className="text-sm text-gray-500">
                    Checking session...
                </span>
            );
        }

        if (isUserLogin) {
            return (
                <button
                    type="button"
                    onClick={handleLogout}
                    className={
                        mobile
                            ? "w-full rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white hover:bg-gray-800"
                            : "rounded-lg bg-gray-900 px-5 py-2.5 font-semibold text-white transition hover:bg-gray-800"
                    }
                >
                    Logout
                </button>
            );
        }

        return (
            <Link
                to="/choose-login"
                onClick={closeMenu}
                className={
                    mobile
                        ? "w-full rounded-lg bg-red-500 px-5 py-3 text-center font-semibold text-white hover:bg-red-600"
                        : "rounded-lg bg-red-500 px-5 py-2.5 text-center font-semibold text-white transition hover:bg-red-600"
                }
            >
                Login
            </Link>
        );
    };

    const renderRoleLinks = () => {
        if (isUserLogin && userRole === "customer") {
            return (
                <>
                    {renderLink("/menu", "Menu")}
                    {renderLink("/cart", `Cart (${cartCount})`)}
                    {renderLink("/my-orders", "My Orders")}
                    {renderLink("/profile", "Account Settings")}
                </>
            );
        }

        if (
            isUserLogin &&
            (userRole === "restaurant" || userRole === "deliveryPartner")
        ) {
            return renderLink(
                roleHome[userRole],
                dashboardLabel[userRole]
            );
        }

        return (
            <>
                {renderLink("/", "Home")}
                {renderLink("/about", "About")}
                {renderLink("/contact", "Contact")}
            </>
        );
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
            <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
                <Link
                    to={isUserLogin && roleHome[userRole] ? roleHome[userRole] : "/"}
                    className="flex items-center gap-2"
                    onClick={closeMenu}
                >
                    <span className="text-3xl">🍽️</span>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            HungerBird
                        </h1>
                        <p className="text-xs text-gray-500">
                            {userRole === "restaurant"
                                ? "Restaurant Portal"
                                : userRole === "deliveryPartner"
                                    ? "Delivery Partner Portal"
                                    : "Food Delivery"}
                        </p>
                    </div>
                </Link>

                <div className="hidden items-center gap-6 md:flex">
                    {!authLoading && renderRoleLinks()}

                    {renderLink(
                        "/choose-login",
                        "Portals",
                        navLinkClass
                    )}

                    {renderAuthAction()}
                </div>

                <button
                    type="button"
                    onClick={() => setMenuOpen((open) => !open)}
                    className="text-2xl text-gray-700 md:hidden"
                    aria-label="Toggle menu"
                    aria-expanded={menuOpen}
                >
                    {menuOpen ? "✕" : "☰"}
                </button>
            </div>

            {menuOpen && (
                <div className="border-t border-gray-100 bg-white px-6 py-5 md:hidden">
                    <div className="flex flex-col gap-5">
                        {!authLoading && renderRoleLinks()}

                        {renderLink(
                            "/choose-login",
                            "All Portals"
                        )}

                        {renderAuthAction(true)}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
