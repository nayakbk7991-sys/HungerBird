import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import AppContext from "../context/AppContext";
import LocationPickerMap from "./LocationPickerMap";

const API_URL = "http://localhost:5000";

const Checkout = () => {
  const { cart, clearCart } = useContext(AppContext);
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    phoneNo: "",
    savedAddress: ""
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/user/profile`, {
          withCredentials: true
        });

        if (response.data.success && response.data.profile) {
          const customerProfile = response.data.profile;

          setProfile({
            name: customerProfile.name || "",
            phoneNo: customerProfile.phoneNo || "",
            savedAddress: customerProfile.savedAddress || ""
          });

          setDeliveryAddress(customerProfile.savedAddress || "");
        }
      } catch (error) {
        console.error(
          "Unable to load customer profile:",
          error.response?.data?.message || error.message
        );
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  const totalAmount = cart.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  const handleSaveAddress = async () => {
    if (!deliveryAddress.trim()) {
      toast.error("Please enter your delivery address");
      return;
    }

    if (!profile.name.trim() || !profile.phoneNo.trim()) {
      toast.error(
        "Please complete your name and phone number in My Profile first"
      );
      return;
    }

    try {
      setIsSavingAddress(true);

      const response = await axios.patch(
        `${API_URL}/user/profile`,
        {
          name: profile.name,
          phoneNo: profile.phoneNo,
          savedAddress: deliveryAddress.trim()
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        setProfile((previous) => ({
          ...previous,
          savedAddress: deliveryAddress.trim()
        }));

        toast.success("Delivery address saved to your profile");
      } else {
        toast.error(response.data.message || "Unable to save address");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to save delivery address"
      );
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleLocationSelect = (location) => {
    setDeliveryLocation(location);
    toast.success("Map location selected");
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      navigate("/menu");
      return;
    }

    if (!deliveryAddress.trim()) {
      toast.error("Please enter your delivery address");
      return;
    }

    if (paymentMethod === "Online") {
      toast.error("Online payment is not integrated yet");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await axios.post(
        `${API_URL}/order/place`,
        {
          items: cart.map((item) => ({
            foodId: item._id,
            quantity: item.quantity
          })),
          deliveryAddress: deliveryAddress.trim(),
          deliveryLocation: deliveryLocation
            ? {
                latitude: deliveryLocation.lat,
                longitude: deliveryLocation.lng
              }
            : null,
          paymentMethod
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        clearCart();

        navigate("/order-confirmed", {
          state: { order: response.data.order }
        });
      } else {
        toast.error(response.data.message || "Unable to place your order");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to place your order. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <section className="min-h-screen bg-gray-50 px-5 py-12">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Your cart is empty
          </h1>

          <p className="mt-3 text-gray-600">
            Add food items before checking out.
          </p>

          <button
            onClick={() => navigate("/menu")}
            className="mt-6 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
          >
            Browse Menu
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 px-5 py-12 md:px-10">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
        <form
          onSubmit={handlePlaceOrder}
          className="rounded-2xl bg-white p-6 shadow-sm md:p-8"
        >
          <h1 className="mb-6 text-2xl font-bold text-gray-900">
            Checkout
          </h1>

          <label className="mb-2 block font-medium text-gray-700">
            Delivery address
          </label>

          <textarea
            value={deliveryAddress}
            onChange={(event) => setDeliveryAddress(event.target.value)}
            placeholder={
              isLoadingProfile
                ? "Loading your saved address..."
                : "Enter your complete delivery address"
            }
            rows={4}
            required
            maxLength={500}
            className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-orange-500"
          />

          <button
            type="button"
            onClick={handleSaveAddress}
            disabled={isSavingAddress || isLoadingProfile}
            className="mt-3 rounded-xl border border-orange-500 px-4 py-2 font-medium text-orange-600 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingAddress ? "Saving address..." : "Save address to profile"}
          </button>

          <p className="mt-2 text-sm text-gray-500">
            Save your address once and it will be filled in automatically the
            next time you check out.
          </p>

          <div className="mt-6">
            <h2 className="mb-2 font-medium text-gray-700">
              Select your delivery location
            </h2>

            <p className="mb-3 text-sm text-gray-500">
              Zoom into your delivery area and click the map to mark your
              location.
            </p>

            <LocationPickerMap
              location={deliveryLocation}
              onLocationSelect={handleLocationSelect}
            />

            {deliveryLocation ? (
              <div className="mt-3 rounded-xl bg-orange-50 p-3 text-sm text-gray-700">
                <p className="font-medium text-orange-700">
                  Selected delivery coordinates
                </p>

                <p className="mt-1">
                  Latitude: {deliveryLocation.lat}
                </p>

                <p>
                  Longitude: {deliveryLocation.lng}
                </p>

                <button
                  type="button"
                  onClick={() => setDeliveryLocation(null)}
                  className="mt-2 font-medium text-orange-700 underline"
                >
                  Clear selected location
                </button>
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">
                No map location selected yet.
              </p>
            )}
          </div>

          <fieldset className="mt-6">
            <legend className="mb-3 font-medium text-gray-700">
              Payment method
            </legend>

            <label className="flex items-center gap-3 rounded-xl border p-4">
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === "COD"}
                onChange={(event) => setPaymentMethod(event.target.value)}
              />

              <span>Cash on Delivery</span>
            </label>

            <label className="mt-3 flex items-center gap-3 rounded-xl border p-4">
              <input
                type="radio"
                name="paymentMethod"
                value="Online"
                checked={paymentMethod === "Online"}
                onChange={(event) => setPaymentMethod(event.target.value)}
              />

              <span>Online payment</span>
            </label>

            {paymentMethod === "Online" && (
              <p className="mt-2 text-sm text-gray-500">
                Online payment is not integrated yet. Select Cash on Delivery
                to place an order for now.
              </p>
            )}
          </fieldset>

          <button
            type="submit"
            disabled={
              isSubmitting ||
              isLoadingProfile ||
              paymentMethod === "Online"
            }
            className="mt-8 w-full rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Placing order..." : "Place order"}
          </button>
        </form>

        <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-5 text-xl font-bold text-gray-900">
            Order summary
          </h2>

          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item._id} className="flex justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-800">
                    {item.dishName || item.name || "Food item"}
                  </p>

                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                </div>

                <p className="font-medium text-gray-800">
                  ₹{Number(item.price) * item.quantity}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between border-t pt-5 text-lg font-bold">
            <span>Total</span>
            <span className="text-orange-500">₹{totalAmount}</span>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default Checkout;