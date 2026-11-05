import React, { useContext, useState } from "react";
import AppContext from "../context/AppContext";
import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

const Login = () => {
  const { loginUser, isUserLogin } = useContext(AppContext);
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = formData;

    try {
      const res = await loginUser(email, password);
      if (res.success) {
        navigate('/menu')
        toast.success("login Successfylly")
      }
      return
    } catch (error) {
toast.error(
  error.response?.data?.message ||
  error.response?.data?.msg ||
  error.message ||
  "Login failed"
);     
 console.log("Login Error:", error);
    }
  };

  return (

    <div className="flex min-h-screen items-center justify-center bg-orange-50 px-4 py-10">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

        {/* Header */}
        <div className="mb-8 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-3xl">
            🍽️
          </div>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Login to your HungerBird account
          </p>

        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {/* Password */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>


            </div>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full rounded-xl bg-orange-500 py-3.5 font-semibold text-white transition hover:bg-orange-600"
          >
            Login
          </button>

        </form>

        {/* Register */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}

          <a
            href="/register"
            className="font-semibold text-orange-500 hover:text-orange-600"
          >
            Create Account
          </a>
        </p>

      </div>

    </div>
  );
};

export default Login;