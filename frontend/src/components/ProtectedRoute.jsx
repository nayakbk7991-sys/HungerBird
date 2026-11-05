
import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AppContext from "../context/AppContext";

const getLoginPath = (role) => {
    if (role === "restaurant") return "/restaurant-login";
    if (role === "deliveryPartner") return "/delivery-login";
    return "/login";
};

const getPortalPath = (role) => {
    if (role === "restaurant") return "/restaurant-dashboard";
    if (role === "deliveryPartner") return "/delivery-dashboard";
    return "/";
};

const ProtectedRoute = ({ allowedRoles = [], children }) => {
    const context = useContext(AppContext);
    const location = useLocation();

    const authLoading = context?.authLoading ?? true;
    const isUserLogin = context?.isUserLogin ?? false;
    const userRole = context?.userRole ?? "";

    if (authLoading) {
        return (
            <div
                style={{
                    minHeight: "60vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: "12px",
                }}
            >
                <p>Restoring your session...</p>
            </div>
        );
    }

    if (!isUserLogin || !userRole) {
        const requiredRole = allowedRoles[0] || "customer";

        return (
            <Navigate
                to={getLoginPath(requiredRole)}
                replace
                state={{ from: location }}
            />
        );
    }

    if (!allowedRoles.includes(userRole)) {
        return <Navigate to={getPortalPath(userRole)} replace />;
    }

    return children;
};

export default ProtectedRoute;
