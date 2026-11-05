
import React from "react";

const About = () => {
    return (
        <section className="bg-white py-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">

                {/* Heading */}
                <div className="mx-auto max-w-2xl text-center">
                    <p className="font-semibold text-orange-500">
                        About HungerBird
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
                        Good Food. Great Moments.
                    </h2>

                    <p className="mt-4 text-gray-600">
                        We believe that great food brings people together. At HungerBird,
                        every dish is prepared with fresh ingredients, authentic flavors,
                        and lots of passion.
                    </p>
                </div>

                {/* Content */}
                <div className="mt-14 grid items-center gap-12 lg:grid-cols-2">

                    {/* Image */}
                    <div className="overflow-hidden rounded-3xl">
                        <img
                            src="https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1000&q=80"
                            alt="Restaurant food"
                            className="h-[450px] w-full object-cover transition duration-500 hover:scale-105"
                        />
                    </div>

                    {/* Text */}
                    <div>
                        <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600">
                            ❤️ Made With Love
                        </span>

                        <h3 className="mt-6 text-3xl font-bold text-gray-900">
                            We serve happiness on every plate.
                        </h3>

                        <p className="mt-5 leading-7 text-gray-600">
                            HungerBird started with a simple idea — to create a place where
                            people can enjoy delicious food in a warm and comfortable
                            environment.
                        </p>

                        <p className="mt-4 leading-7 text-gray-600">
                            From our kitchen to your table, we carefully select fresh
                            ingredients and prepare every meal with attention to detail.
                            Whether you're having a quick lunch, a family dinner, or
                            celebrating a special occasion, we're here to make it memorable.
                        </p>

                        {/* Features */}
                        <div className="mt-8 grid grid-cols-2 gap-5">

                            <div className="rounded-xl bg-orange-50 p-5">
                                <div className="text-2xl">🥗</div>
                                <h4 className="mt-2 font-bold">Fresh Ingredients</h4>
                                <p className="mt-1 text-sm text-gray-500">
                                    Fresh and quality ingredients every day.
                                </p>
                            </div>

                            <div className="rounded-xl bg-orange-50 p-5">
                                <div className="text-2xl">👨‍🍳</div>
                                <h4 className="mt-2 font-bold">Expert Chefs</h4>
                                <p className="mt-1 text-sm text-gray-500">
                                    Delicious food prepared by skilled chefs.
                                </p>
                            </div>

                            <div className="rounded-xl bg-orange-50 p-5">
                                <div className="text-2xl">⚡</div>
                                <h4 className="mt-2 font-bold">Fast Service</h4>
                                <p className="mt-1 text-sm text-gray-500">
                                    Quick service without compromising quality.
                                </p>
                            </div>

                            <div className="rounded-xl bg-orange-50 p-5">
                                <div className="text-2xl">❤️</div>
                                <h4 className="mt-2 font-bold">Customer First</h4>
                                <p className="mt-1 text-sm text-gray-500">
                                    Your happiness is our priority.
                                </p>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default About;
