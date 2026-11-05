import React, { useContext } from "react";
import { Link } from "react-router-dom";
import AppContext from "../context/AppContext";

const Home = () => {
  const { dish } = useContext(AppContext)
  return (
    <div className="bg-white text-gray-900">

      {/* ================= HERO SECTION ================= */}
      <section
        id="home"
        className="relative overflow-hidden bg-orange-50"
      >
        <div className="mx-auto grid min-h-[650px] max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:px-8">

          {/* Hero Content */}
          <div>
            <span className="mb-5 inline-block rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600">
              🔥 Delicious food, made with love
            </span>

            <h1 className="max-w-xl text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl">
              Taste the
              <span className="text-orange-500"> Difference </span>
              in Every Bite.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-gray-600">
              Enjoy delicious meals made with fresh ingredients and
              authentic flavors. Your favorite food is just a click away.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/menu" className="rounded-xl bg-orange-500 px-7 py-3.5 font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600">
                Explore Menu →
              </Link>

              <button className="rounded-xl border border-gray-300 bg-white px-7 py-3.5 font-semibold text-gray-700 transition hover:border-orange-500 hover:text-orange-500">
                Book a Table
              </button>
            </div>

            {/* Stats */}
            <div className="mt-10 flex gap-8">
              <div>
                <h3 className="text-2xl font-bold">10+</h3>
                <p className="text-sm text-gray-500">Years Experience</p>
              </div>

              <div>
                <h3 className="text-2xl font-bold">50+</h3>
                <p className="text-sm text-gray-500">Food Items</p>
              </div>

              <div>
                <h3 className="text-2xl font-bold">4.9 ⭐</h3>
                <p className="text-sm text-gray-500">Customer Rating</p>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80"
                alt="Delicious restaurant food"
                className="h-[500px] w-full object-cover"
              />
            </div>

            {/* Floating Card */}
            <div className="absolute bottom-6 left-6 rounded-2xl bg-white p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-xl">
                  ⭐
                </div>

                <div>
                  <p className="text-sm font-bold">Highly Rated</p>
                  <p className="text-xs text-gray-500">
                    Loved by 10,000+ customers
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="mb-10 text-center">
            <p className="font-semibold text-orange-500">
              Explore Our Menu
            </p>

            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              What are you craving?
            </h2>
          </div>


        </div>
      </section>

      {/* ================= POPULAR DISHES ================= */}
      <section className="bg-gray-50 py-20" id="menu">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-semibold text-orange-500">
                Customer Favorites
              </p>

              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
                Popular Dishes
              </h2>
            </div>

            <button className="font-semibold text-orange-500 hover:text-orange-600">
              View Full Menu →
            </button>
          </div>

          <div className="mt-10 grid gap-7 md:grid-cols-3">

            {dish?.map((d) => (
              <div
                key={d._id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative">
                  <img
                    src={d.imgSrc}
                    alt={d.dishName}
                    className="h-60 w-full object-cover"
                  />

                  <span className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-bold shadow">
                    ⭐ 4.9
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">
                      {dish.name}
                    </h3>

                    <span className="font-bold text-orange-500">
                      {dish.price}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    Fresh ingredients, delicious flavors and prepared
                    specially for you.
                  </p>

                  <button className="mt-5 w-full cursor-pointer rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600">
                    order Now
                  </button>
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-orange-500 px-8 py-14 text-center text-white shadow-xl sm:px-16">

          <h2 className="text-3xl font-bold sm:text-4xl">
            Hungry? Let's fix that! 🍽️
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-orange-100">
            Order your favorite dishes today and enjoy a delicious
            restaurant experience from the comfort of your home.
          </p>

          <button className="mt-8 rounded-xl bg-white px-8 py-3.5 font-bold text-orange-500 transition hover:bg-gray-100">
            Order Now →
          </button>

        </div>
      </section>

    </div>
  );
};

export default Home;
