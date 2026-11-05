import React from "react";

const Contact = () => {
    return (
        <section className="bg-gray-50 py-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">

                {/* Heading */}
                <div className="mx-auto max-w-2xl text-center">
                    <p className="font-semibold text-orange-500">
                        Get In Touch
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
                        We'd Love To Hear From You
                    </h2>

                    <p className="mt-4 text-gray-600">
                        Have a question, feedback, or want to make a reservation?
                        Send us a message and we'll get back to you.
                    </p>
                </div>

                {/* Contact Content */}
                <div className="mt-14 grid gap-10 lg:grid-cols-2">

                    {/* Contact Information */}
                    <div className="rounded-3xl bg-orange-500 p-8 text-white sm:p-10">

                        <h3 className="text-2xl font-bold">
                            Contact Information
                        </h3>

                        <p className="mt-3 text-orange-100">
                            We're always happy to help. Reach out to us using any of
                            the following options.
                        </p>

                        <div className="mt-10 space-y-7">

                            {/* Address */}
                            <div className="flex gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-xl">
                                    📍
                                </div>

                                <div>
                                    <h4 className="font-bold">Our Location</h4>
                                    <p className="mt-1 text-sm text-orange-100">
                                        123 Food Street, City Center
                                        <br />
                                        New Delhi, India
                                    </p>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-xl">
                                    📞
                                </div>

                                <div>
                                    <h4 className="font-bold">Phone</h4>
                                    <p className="mt-1 text-sm text-orange-100">
                                        +91 98765 43210
                                    </p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-xl">
                                    ✉️
                                </div>

                                <div>
                                    <h4 className="font-bold">Email</h4>
                                    <p className="mt-1 text-sm text-orange-100">
                                        hello@hungerbird.com
                                    </p>
                                </div>
                            </div>

                            {/* Opening Hours */}
                            <div className="flex gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-xl">
                                    🕐
                                </div>

                                <div>
                                    <h4 className="font-bold">Opening Hours</h4>
                                    <p className="mt-1 text-sm text-orange-100">
                                        Monday - Sunday
                                        <br />
                                        10:00 AM - 11:00 PM
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="rounded-3xl bg-white p-8 shadow-sm sm:p-10">

                        <h3 className="text-2xl font-bold text-gray-900">
                            Send Us A Message
                        </h3>

                        <form className="mt-7 space-y-5">

                            {/* Name */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Your Name
                                </label>

                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Phone Number
                                </label>

                                <input
                                    type="tel"
                                    placeholder="Enter your phone number"
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Message
                                </label>

                                <textarea
                                    rows="5"
                                    placeholder="Write your message..."
                                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                ></textarea>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="w-full rounded-xl bg-orange-500 py-3.5 font-semibold text-white transition hover:bg-orange-600"
                            >
                                Send Message →
                            </button>

                        </form>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Contact;