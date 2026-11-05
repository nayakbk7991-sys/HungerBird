
import React, { useCallback, useEffect, useState } from "react";
import AppContext from "./AppContext";
import axios from "axios";

const url = "http://localhost:5000";

const validRoles = ["customer", "restaurant", "deliveryPartner"];

const AppState = ({ children }) => {
    const [dish, setDish] = useState([]);
    const [isUserLogin, setIsUserLogin] = useState(false);
    const [userRole, setUserRole] = useState("");
    const [authLoading, setAuthLoading] = useState(true);
    const [cart, setCart] = useState([]);

    const clearAuthentication = useCallback(() => {
        setIsUserLogin(false);
        setUserRole("");
    }, []);

    const getAllDishes = useCallback(async () => {
        try {
            const response = await axios.get(`${url}/dish/all`, {
                withCredentials: true,
            });

            const data = response.data;

            if (Array.isArray(data)) {
                setDish(data);
            } else if (Array.isArray(data?.dishes)) {
                setDish(data.dishes);
            } else if (Array.isArray(data?.dish)) {
                setDish(data.dish);
            } else if (Array.isArray(data?.data)) {
                setDish(data.data);
            } else {
                console.error("Unexpected dishes response:", data);
            }
        } catch (error) {
            console.error(
                "Unable to load dishes:",
                error.response?.data || error.message
            );
        }
    }, []);

    const checkAuthentication = useCallback(async () => {
        setAuthLoading(true);

        try {
            const response = await axios.get(`${url}/user/check-auth`, {
                withCredentials: true,
            });

            const data = response.data;

            const actualUser =
                data?.user ||
                data?.data?.user ||
                data?.data ||
                null;

            const role =
                actualUser?.role ||
                data?.role ||
                data?.userRole ||
                "";

            if (data?.success === true && validRoles.includes(role)) {
                setUserRole(role);
                setIsUserLogin(true);
            } else {
                clearAuthentication();
            }
        } catch (error) {
            clearAuthentication();

            if (error.response?.status !== 401) {
                console.error(
                    "Session restoration failed:",
                    error.response?.data || error.message
                );
            }
        } finally {
            setAuthLoading(false);
        }
    }, [clearAuthentication]);

    useEffect(() => {
        getAllDishes();
        checkAuthentication();
    }, [getAllDishes, checkAuthentication]);

    const registerUser = async (
        name,
        email,
        password,
        phoneNo,
        role = "customer",
        locationData = null
    ) => {
        const payload = {
            name,
            email,
            password,
            phoneNo,
            role,
        };

        if (locationData && role === "restaurant") {
            payload.savedAddress = locationData.savedAddress;
            payload.restaurantLocation = locationData.restaurantLocation;
        }

        const response = await axios.post(
            `${url}/user/register`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            }
        );

        return response.data;
    };

    const loginUser = async (email, password, role = "customer") => {
        setAuthLoading(true);

        try {
            const response = await axios.post(
                `${url}/user/login`,
                { email, password, role },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );

            const data = response.data;

            const actualUser =
                data?.user ||
                data?.data?.user ||
                data?.data ||
                null;

            const actualRole =
                actualUser?.role ||
                data?.role ||
                data?.userRole ||
                "";

            if (
                data?.success === true &&
                validRoles.includes(actualRole) &&
                actualRole === role
            ) {
                setUserRole(actualRole);
                setIsUserLogin(true);
            } else {
                clearAuthentication();
            }

            return data;
        } catch (error) {
            clearAuthentication();
            throw error;
        } finally {
            setAuthLoading(false);
        }
    };

    const logoutUser = async () => {
        setAuthLoading(true);

        try {
            const response = await axios.post(
                `${url}/user/logout`,
                {},
                { withCredentials: true }
            );

            return response.data;
        } catch (error) {
            console.error(
                "Logout request failed:",
                error.response?.data || error.message
            );

            throw error;
        } finally {
            clearAuthentication();
            setCart([]);
            setAuthLoading(false);
        }
    };

    const addToCart = (item, quantity = 1) => {
        if (!item) return;

        const itemId = item._id || item.id;
        if (!itemId) return;

        const amount = Math.max(1, Number(quantity) || 1);

        setCart((previousCart) => {
            const existing = previousCart.find(
                (entry) => (entry._id || entry.id) === itemId
            );

            if (existing) {
                return previousCart.map((entry) =>
                    (entry._id || entry.id) === itemId
                        ? {
                              ...entry,
                              quantity: (Number(entry.quantity) || 1) + amount,
                          }
                        : entry
                );
            }

            return [
                ...previousCart,
                { ...item, quantity: amount },
            ];
        });
    };

    const removeFromCart = (itemId) => {
        setCart((previousCart) =>
            previousCart.filter(
                (item) => (item._id || item.id) !== itemId
            )
        );
    };

    const updateCartQuantity = (itemId, quantity) => {
        const amount = Number(quantity);

        if (!Number.isFinite(amount) || amount <= 0) {
            removeFromCart(itemId);
            return;
        }

        setCart((previousCart) =>
            previousCart.map((item) =>
                (item._id || item.id) === itemId
                    ? { ...item, quantity: amount }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartTotal = cart.reduce((total, item) => {
        const price = Number(item.price ?? item.dishPrice ?? 0);
        const quantity = Number(item.quantity ?? 1);

        return total + price * quantity;
    }, 0);

    return (
        <AppContext.Provider
            value={{
                url,
                dish,
                setDish,
                isUserLogin,
                setIsUserLogin,
                userRole,
                setUserRole,
                authLoading,
                registerUser,
                loginUser,
                logoutUser,
                checkAuthentication,
                getAllDishes,
                cart,
                setCart,
                addToCart,
                removeFromCart,
                updateCartQuantity,
                clearCart,
                cartTotal,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export default AppState;
