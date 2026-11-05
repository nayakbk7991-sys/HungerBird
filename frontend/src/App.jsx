
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppState from "./context/AppState";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./components/Home";
import About from "./components/About";
import Contact from "./components/Contact";
import Menu from "./components/Menu";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import MyOrders from "./components/MyOrders";
import RestaurantDashboard from "./components/RestaurantDashboard";
import DeliveryDashboard from "./components/DeliveryDashboard";
import Register from "./components/Register";
import Login from "./components/Login";
import Profile from "./components/Profile";
import OrderConfirmed from "./components/OrderConfirmed";
import PortalSelection from "./components/PortalSelection";

const App = () => {
    return (
        <BrowserRouter>
            <AppState>
                <Navbar />

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />

                    <Route
                        path="/choose-login"
                        element={<PortalSelection />}
                    />

                    <Route
                        path="/login"
                        element={<Login portal="customer" />}
                    />

                    <Route
                        path="/restaurant-login"
                        element={<Login portal="restaurant" />}
                    />

                    <Route
                        path="/delivery-login"
                        element={<Login portal="deliveryPartner" />}
                    />

                    <Route path="/register" element={<Register />} />

                    <Route
                        path="/menu"
                        element={
                            <ProtectedRoute allowedRoles={["customer"]}>
                                <Menu />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/cart"
                        element={
                            <ProtectedRoute allowedRoles={["customer"]}>
                                <Cart />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/checkout"
                        element={
                            <ProtectedRoute allowedRoles={["customer"]}>
                                <Checkout />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/order-confirmed"
                        element={
                            <ProtectedRoute allowedRoles={["customer"]}>
                                <OrderConfirmed />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/my-orders"
                        element={
                            <ProtectedRoute allowedRoles={["customer"]}>
                                <MyOrders />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute allowedRoles={["customer"]}>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/restaurant-dashboard"
                        element={
                            <ProtectedRoute allowedRoles={["restaurant"]}>
                                <RestaurantDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/delivery-dashboard"
                        element={
                            <ProtectedRoute allowedRoles={["deliveryPartner"]}>
                                <DeliveryDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="*" element={<Home />} />
                </Routes>
            </AppState>
        </BrowserRouter>
    );
};

export default App;
