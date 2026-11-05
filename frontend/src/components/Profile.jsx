
import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import AppContext from "../context/AppContext";

const API_URL = "http://localhost:5000";

const EMPTY_PROFILE = {
    name: "",
    email: "",
    phoneNo: "",
    role: "customer",
    savedAddress: ""
};

const ROLE_LABELS = {
    customer: "Customer",
    restaurant: "Restaurant",
    deliveryPartner: "Delivery Partner"
};

const Profile = () => {
    const { isUserLogin, userRole } = useContext(AppContext);
    const navigate = useNavigate();

    const [profile, setProfile] = useState(EMPTY_PROFILE);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchProfile = async () => {
            if (!isUserLogin) {
                if (isMounted) {
                    setLoading(false);
                }
                return;
            }

            try {
                const response = await axios.get(
                    `${API_URL}/user/profile`,
                    { withCredentials: true }
                );

                if (isMounted && response.data.success) {
                    setProfile({
                        ...EMPTY_PROFILE,
                        ...response.data.profile
                    });
                }
            } catch (error) {
                if (isMounted) {
                    toast.error(
                        error.response?.data?.message ||
                        "Unable to load your profile."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchProfile();

        return () => {
            isMounted = false;
        };
    }, [isUserLogin]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setProfile((currentProfile) => ({
            ...currentProfile,
            [name]: value
        }));
    };

    const handleSave = async (event) => {
        event.preventDefault();

        if (!profile.name.trim() || !profile.phoneNo.trim()) {
            toast.error("Name and phone number are required.");
            return;
        }

        try {
            setSaving(true);

            const response = await axios.patch(
                `${API_URL}/user/profile`,
                {
                    name: profile.name.trim(),
                    phoneNo: profile.phoneNo.trim(),
                    savedAddress: profile.savedAddress.trim()
                },
                { withCredentials: true }
            );

            if (response.data.success) {
                setProfile((currentProfile) => ({
                    ...currentProfile,
                    ...response.data.profile
                }));

                toast.success(
                    response.data.message || "Profile updated successfully."
                );
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to update your profile."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete your account? You will be logged out, and you will not be able to log in to this account again. Existing order records will be retained."
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeleting(true);

            const response = await axios.delete(
                `${API_URL}/user/account`,
                { withCredentials: true }
            );

            if (response.data.success) {
                toast.success(
                    response.data.message || "Account deleted successfully."
                );

                window.location.replace("/login");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to delete your account."
            );
            setDeleting(false);
        }
    };

    if (!isUserLogin) {
        return (
            <div className="mx-auto max-w-xl px-4 py-16 text-center">
                <h1 className="mb-3 text-2xl font-bold text-gray-800">
                    Your Account
                </h1>

                <p className="mb-6 text-gray-600">
                    Please log in to view and manage your account.
                </p>

                <Link
                    to="/login"
                    className="inline-block rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700"
                >
                    Go to Login
                </Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="px-4 py-16 text-center text-gray-600">
                Loading your profile...
            </div>
        );
    }

    const currentRole = profile.role || userRole || "customer";

    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Account Settings
                </h1>

                <p className="mt-2 text-gray-600">
                    Manage your HungerBird account details.
                </p>
            </div>

            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Profile Information
                    </h2>

                    <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800">
                        {ROLE_LABELS[currentRole] || currentRole}
                    </span>
                </div>

                <form onSubmit={handleSave} className="space-y-5">
                    <div>
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Full Name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={profile.name}
                            onChange={handleChange}
                            required
                            autoComplete="name"
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
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
                            name="email"
                            type="email"
                            value={profile.email}
                            readOnly
                            className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-gray-600"
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
                            name="phoneNo"
                            type="tel"
                            value={profile.phoneNo}
                            onChange={handleChange}
                            required
                            autoComplete="tel"
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="savedAddress"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Saved Address
                        </label>

                        <textarea
                            id="savedAddress"
                            name="savedAddress"
                            value={profile.savedAddress}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Enter your address if applicable"
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving || deleting}
                        className="rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </form>
            </section>

            <section className="mt-8 rounded-xl border border-red-200 bg-white p-6">
                <h2 className="text-xl font-semibold text-red-700">
                    Delete Account
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                    This will deactivate your HungerBird account and log you
                    out. You will no longer be able to sign in to this
                    account. Existing order records will be retained.
                </p>

                <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deleting || saving}
                    className="mt-5 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {deleting ? "Deleting Account..." : "Delete My Account"}
                </button>
            </section>
        </div>
    );
};

export default Profile;
