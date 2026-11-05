
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import DeliveryGoogleMap from "./DeliveryGoogleMap";
import "./DeliveryDashboard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const getOrderId = (order) => order?._id || order?.id || "";

const getOrderStatus = (order) =>
  order?.orderStatus || order?.status || "Ready for Pickup";

const getOrderItems = (order) =>
  Array.isArray(order?.items) ? order.items : [];

const getItemName = (item) =>
  item?.dish?.name ||
  item?.dish?.title ||
  item?.product?.name ||
  item?.name ||
  item?.title ||
  "Food item";

const getItemQuantity = (item) =>
  Number(item?.quantity || item?.qty || 1);

const getItemPrice = (item) =>
  Number(item?.price ?? item?.dish?.price ?? item?.product?.price ?? 0);

const getAddressText = (value) => {
  if (!value) return "";

  if (typeof value === "string") return value.trim();

  if (typeof value === "object") {
    return [
      value.addressLine1,
      value.addressLine2,
      value.addressLine,
      value.address,
      value.street,
      value.area,
      value.landmark,
      value.city,
      value.state,
      value.pincode || value.postalCode || value.zipCode,
    ]
      .filter(Boolean)
      .join(", ");
  }

  return String(value);
};

const getRestaurantAddress = (order) =>
  getAddressText(
    order?.restaurant?.address ||
      order?.restaurant?.location ||
      order?.restaurantAddress ||
      order?.pickupAddress
  );

const getCustomerAddress = (order) =>
  getAddressText(
    order?.deliveryAddress ||
      order?.customerAddress ||
      order?.address
  );

const getOrderNumber = (order) =>
  order?.orderNumber || getOrderId(order).slice(-8).toUpperCase();

const getAmount = (order) =>
  Number(order?.totalAmount ?? order?.totalPrice ?? order?.amount ?? 0);

const getMapSearchUrl = (address) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

const getDirectionsUrl = (address) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    address
  )}&travelmode=driving`;

const DeliveryDashboard = () => {
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("available");
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedMap, setSelectedMap] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [availableResponse, myResponse] = await Promise.all([
        api.get("/delivery/available-orders"),
        api.get("/delivery/orders"),
      ]);

      const availableData =
        availableResponse.data?.orders ??
        availableResponse.data?.data ??
        availableResponse.data;

      const myData =
        myResponse.data?.orders ??
        myResponse.data?.data ??
        myResponse.data;

      setAvailableOrders(Array.isArray(availableData) ? availableData : []);
      setMyOrders(Array.isArray(myData) ? myData : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load delivery orders. Check your login and backend server."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const activeOrders = useMemo(
    () => myOrders.filter((order) => getOrderStatus(order) !== "Delivered"),
    [myOrders]
  );

  const completedOrders = useMemo(
    () => myOrders.filter((order) => getOrderStatus(order) === "Delivered"),
    [myOrders]
  );

  const stats = useMemo(
    () => [
      { label: "Available orders", value: availableOrders.length },
      { label: "My active deliveries", value: activeOrders.length },
      { label: "Completed deliveries", value: completedOrders.length },
    ],
    [availableOrders.length, activeOrders.length, completedOrders.length]
  );

  const showMessage = (message) => {
    setSuccess(message);
    setError("");
  };

  const claimOrder = async (order) => {
    const orderId = getOrderId(order);

    if (!orderId) {
      setError("This order has no valid ID.");
      return;
    }

    setActionId(orderId);
    setError("");
    setSuccess("");

    try {
      await api.post(`/delivery/orders/${orderId}/claim`);

      showMessage("Order accepted successfully.");
      setSelectedMap(null);
      await loadOrders();
      setActiveTab("mine");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to accept this order. It may have already been claimed."
      );
    } finally {
      setActionId("");
    }
  };

  const updateStatus = async (order, nextStatus) => {
    const orderId = getOrderId(order);

    if (!orderId) {
      setError("This order has no valid ID.");
      return;
    }

    setActionId(orderId);
    setError("");
    setSuccess("");

    try {
      await api.patch(`/delivery/orders/${orderId}/status`, {
        orderStatus: nextStatus,
      });

      showMessage(
        nextStatus === "Delivered"
          ? "Delivery marked as completed."
          : `Order status updated to ${nextStatus}.`
      );

      await loadOrders();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update order status. Check the backend status rules."
      );
    } finally {
      setActionId("");
    }
  };

  const openMap = (order, destinationType) => {
    const address =
      destinationType === "pickup"
        ? getRestaurantAddress(order)
        : getCustomerAddress(order);

    const location =
      destinationType === "pickup"
        ? order?.restaurant?.location ||
          order?.restaurantLocation ||
          order?.pickupLocation
        : order?.deliveryLocation || order?.customerLocation;

    if (!address && !location) {
      setError(
        destinationType === "pickup"
          ? "The restaurant pickup address and coordinates are missing."
          : "The customer delivery address and coordinates are missing."
      );
      return;
    }

    setError("");

    setSelectedMap({
      order,
      orderId: getOrderId(order),
      destinationType,
      address,
      title:
        destinationType === "pickup"
          ? "Restaurant pickup location"
          : "Customer delivery location",
      directionsUrl: getDirectionsUrl(address),
      searchUrl: getMapSearchUrl(address),
    });
  };

  const renderOrder = (order, isAvailable = false) => {
    const orderId = getOrderId(order);
    const status = getOrderStatus(order);
    const restaurantAddress = getRestaurantAddress(order);
    const customerAddress = getCustomerAddress(order);
    const isBusy = actionId === orderId;
    const items = getOrderItems(order);

    return (
      <article className="delivery-order-card" key={orderId}>
        <div className="delivery-order-heading">
          <div>
            <span className="delivery-eyebrow">ORDER</span>
            <h3>#{getOrderNumber(order)}</h3>
          </div>

          <span
            className={`delivery-status ${
              status === "Delivered"
                ? "delivery-status-complete"
                : "delivery-status-active"
            }`}
          >
            {status}
          </span>
        </div>

        <div className="delivery-order-info">
          <div className="delivery-info-row">
            <span className="delivery-info-icon">₹</span>
            <div>
              <div className="delivery-info-label">Order total</div>
              <strong>₹{getAmount(order).toFixed(2)}</strong>
            </div>
          </div>

          <div className="delivery-info-row">
            <span className="delivery-info-icon">#</span>
            <div>
              <div className="delivery-info-label">Items</div>
              <strong>
                {items.reduce(
                  (total, item) => total + getItemQuantity(item),
                  0
                )}
              </strong>
            </div>
          </div>
        </div>

        <div className="delivery-items">
          <strong>Order items</strong>

          {items.length > 0 ? (
            items.map((item, index) => (
              <div
                className="delivery-item"
                key={item?._id || index}
              >
                <span>
                  {getItemName(item)} × {getItemQuantity(item)}
                </span>
                <span>
                  ₹
                  {(
                    getItemPrice(item) * getItemQuantity(item)
                  ).toFixed(2)}
                </span>
              </div>
            ))
          ) : (
            <p className="delivery-muted">Item details unavailable.</p>
          )}
        </div>

        <div className="delivery-location-block">
          <span className="delivery-location-marker">P</span>

          <div className="delivery-location-content">
            <strong>Pickup from restaurant</strong>
            <p className="delivery-address">
              {restaurantAddress || "Pickup address unavailable"}
            </p>

            <button
              type="button"
              className="delivery-directions-button"
              onClick={() => openMap(order, "pickup")}
              disabled={
                !restaurantAddress &&
                !order?.restaurant?.location &&
                !order?.restaurantLocation &&
                !order?.pickupLocation
              }
            >
              View pickup map
            </button>
          </div>
        </div>

        <div className="delivery-location-block">
          <span className="delivery-location-marker customer-marker">
            D
          </span>

          <div className="delivery-location-content">
            <strong>Deliver to customer</strong>
            <p className="delivery-address">
              {customerAddress || "Customer address unavailable"}
            </p>

            <button
              type="button"
              className="delivery-directions-button"
              onClick={() => openMap(order, "customer")}
              disabled={
                !customerAddress &&
                !order?.deliveryLocation &&
                !order?.customerLocation
              }
            >
              View customer map
            </button>
          </div>
        </div>

        {isAvailable ? (
          <button
            type="button"
            className="delivery-primary-button"
            onClick={() => claimOrder(order)}
            disabled={isBusy}
          >
            {isBusy ? "Accepting order..." : "Accept delivery"}
          </button>
        ) : (
          <>
            {status === "Ready for Pickup" && (
              <button
                type="button"
                className="delivery-primary-button"
                onClick={() => updateStatus(order, "Out for Delivery")}
                disabled={isBusy}
              >
                {isBusy ? "Updating..." : "Picked up — start delivery"}
              </button>
            )}

            {status === "Out for Delivery" && (
              <button
                type="button"
                className="delivery-primary-button"
                onClick={() => updateStatus(order, "Delivered")}
                disabled={isBusy}
              >
                {isBusy ? "Updating..." : "Mark as delivered"}
              </button>
            )}

            {status === "Delivered" && (
              <p className="delivery-completed-message">
                Delivery completed successfully.
              </p>
            )}

            {![
              "Ready for Pickup",
              "Out for Delivery",
              "Delivered",
            ].includes(status) && (
              <p className="delivery-waiting-message">
                Waiting for the restaurant to prepare the order.
              </p>
            )}
          </>
        )}
      </article>
    );
  };

  const ordersToDisplay =
    activeTab === "available"
      ? availableOrders
      : activeTab === "mine"
        ? activeOrders
        : completedOrders;

  return (
    <main className="delivery-dashboard">
      <header className="delivery-header">
        <div>
          <span className="delivery-eyebrow">HUNGERBIRD PARTNER</span>
          <h1>Delivery dashboard</h1>
          <p>Manage your deliveries and navigate to each destination.</p>
        </div>

        <button
          type="button"
          className="delivery-refresh-button"
          onClick={loadOrders}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh orders"}
        </button>
      </header>

      {error && (
        <div className="delivery-alert delivery-alert-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            Dismiss
          </button>
        </div>
      )}

      {success && (
        <div className="delivery-alert delivery-alert-success" role="status">
          <span>{success}</span>
          <button type="button" onClick={() => setSuccess("")}>
            Dismiss
          </button>
        </div>
      )}

      <section className="delivery-summary" aria-label="Delivery summary">
        {stats.map((stat) => (
          <div className="delivery-summary-card" key={stat.label}>
            <span className="delivery-summary-number">{stat.value}</span>
            <span className="delivery-summary-label">{stat.label}</span>
          </div>
        ))}
      </section>

      {selectedMap && (
        <section className="delivery-map-panel">
          <div className="delivery-map-heading">
            <div>
              <span className="delivery-eyebrow">GOOGLE MAPS</span>
              <h2>{selectedMap.title}</h2>
              <p>
                {selectedMap.address || "Using saved location coordinates"}
              </p>
            </div>

            <button
              type="button"
              className="delivery-map-close"
              onClick={() => setSelectedMap(null)}
              aria-label="Close map"
            >
              ×
            </button>
          </div>

          <DeliveryGoogleMap
            pickupAddress={getRestaurantAddress(selectedMap.order)}
            pickupLocation={
              selectedMap.order?.restaurant?.location ||
              selectedMap.order?.restaurantLocation ||
              selectedMap.order?.pickupLocation
            }
            customerAddress={getCustomerAddress(selectedMap.order)}
            customerLocation={
              selectedMap.order?.deliveryLocation ||
              selectedMap.order?.customerLocation
            }
            orderStatus={getOrderStatus(selectedMap.order)}
            destinationType={selectedMap.destinationType}
          />

          <div className="delivery-map-actions">
            {selectedMap.address && (
              <>
                <a
                  className="delivery-primary-button delivery-map-navigation"
                  href={selectedMap.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Google Maps directions
                </a>

                <a
                  className="delivery-secondary-link"
                  href={selectedMap.searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View location in Google Maps
                </a>
              </>
            )}
          </div>
        </section>
      )}

      <nav className="delivery-tabs" aria-label="Order categories">
        <button
          type="button"
          className={activeTab === "available" ? "active" : ""}
          onClick={() => setActiveTab("available")}
        >
          Available ({availableOrders.length})
        </button>

        <button
          type="button"
          className={activeTab === "mine" ? "active" : ""}
          onClick={() => setActiveTab("mine")}
        >
          My deliveries ({activeOrders.length})
        </button>

        <button
          type="button"
          className={activeTab === "completed" ? "active" : ""}
          onClick={() => setActiveTab("completed")}
        >
          Completed ({completedOrders.length})
        </button>
      </nav>

      {loading ? (
        <div className="delivery-empty-state">
          Loading delivery orders...
        </div>
      ) : ordersToDisplay.length === 0 ? (
        <div className="delivery-empty-state">
          <h2>No orders here yet</h2>
          <p>
            {activeTab === "available"
              ? "New orders will appear here when they are ready for pickup."
              : activeTab === "mine"
                ? "Accept an available order to begin a delivery."
                : "Your completed deliveries will appear here."}
          </p>

          <button
            type="button"
            className="delivery-refresh-button"
            onClick={loadOrders}
          >
            Check again
          </button>
        </div>
      ) : (
        <section className="delivery-orders-grid">
          {ordersToDisplay.map((order) =>
            renderOrder(order, activeTab === "available")
          )}
        </section>
      )}
    </main>
  );
};

export default DeliveryDashboard;
