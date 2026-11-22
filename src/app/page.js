
"use client";

import { useMemo, useState } from "react";

const services = [
  {
    id: 1,
    name: "Timeless Wedding Photography",
    category: "Photography",
    location: "Dhaka",
    price: 25000,
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=900",
  },
  {
    id: 2,
    name: "Elegant Wedding Venue",
    category: "Venues",
    location: "Dhaka",
    price: 85000,
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=900",
  },
  {
    id: 3,
    name: "Dream Floral Decoration",
    category: "Decoration",
    location: "Chattogram",
    price: 35000,
    image: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=900",
  },
  {
    id: 4,
    name: "Luxury Wedding Catering",
    category: "Catering",
    location: "Sylhet",
    price: 45000,
    image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=900",
  },
  {
    id: 5,
    name: "Bridal Makeup & Styling",
    category: "Makeup",
    location: "Dhaka",
    price: 12000,
    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=900",
  },
  {
    id: 6,
    name: "Wedding Fashion Collection",
    category: "Fashion",
    location: "Rajshahi",
    price: 18000,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900",
  },
];

const categories = ["All", "Photography", "Venues", "Decoration", "Catering", "Makeup", "Fashion"];

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [selected, setSelected] = useState(null);

  const filteredServices = useMemo(() => {
    const result = services.filter((service) => {
      const matchesSearch = `${service.name} ${service.location}`
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesSearch && (category === "All" || service.category === category);
    });

    if (sort === "low") result.sort((a, b) => a.price - b.price);
    if (sort === "high") result.sort((a, b) => b.price - a.price);
    return result;
  }, [search, category, sort]);

  return (
    <main className="min-h-screen bg-[#fffaf7] text-[#352421]">
      <header className="sticky top-0 z-30 border-b border-rose-100 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row sm:px-5">
          <a href="#" className="text-3xl font-bold text-rose-700">
            WedPlan<span className="text-amber-600">.</span>
          </a>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium sm:gap-7">
            <a href="#services" className="hover:text-rose-700">Services</a>
            <a href="#about" className="hover:text-rose-700">About</a>
            <a href="#contact" className="hover:text-rose-700">Contact</a>
          </div>
        </nav>
      </header>

      <section
        className="relative flex min-h-[510px] items-center justify-center bg-cover bg-center px-6 text-center text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(40,20,26,.64),rgba(40,20,26,.66)),url('https://images.unsplash.com/photo-1519741497674-611481863552?w=1800')",
        }}
      >
        <div className="max-w-3xl">
          <p className="mb-5 font-semibold uppercase tracking-[.3em] text-rose-200">
            Your Love Story Begins Here
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
            Plan Your Dream Wedding with WedPlan
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-rose-50">
            Discover talented wedding professionals, beautiful venues,
            and unforgettable experiences in one place.
          </p>
          <a
            href="#services"
            className="mt-9 inline-block rounded-full bg-rose-700 px-8 py-4 font-semibold text-white transition hover:bg-rose-800"
          >
            Explore Wedding Services
          </a>
        </div>
      </section>

      <section id="services" className="mx-auto max-w-7xl px-5 py-20">
        <div className="mb-10 text-center">
          <p className="font-semibold uppercase tracking-widest text-rose-700">
            Wedding Marketplace
          </p>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Explore Our Wedding Services
          </h2>
          <p className="mt-3 text-gray-600">
            Find everything you need for your special day.
          </p>
        </div>

        <div className="mb-9 grid gap-3 rounded-2xl border border-rose-100 bg-white p-5 shadow-sm md:grid-cols-3">
          <input
            aria-label="Search services"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search services or locations..."
            className="rounded-xl border border-gray-200 p-3 outline-rose-600"
          />
          <select
            aria-label="Filter category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-xl border border-gray-200 p-3"
          >
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <select
            aria-label="Sort by price"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="rounded-xl border border-gray-200 p-3"
          >
            <option value="default">Default Sorting</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>
        </div>

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <article
              key={service.id}
              className="overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className="h-56 bg-rose-100 bg-cover bg-center"
                style={{ backgroundImage: `url("${service.image}")` }}
              />
              <div className="p-6">
                <p className="text-sm font-semibold text-rose-700">
                  {service.category}
                </p>
                <h3 className="mt-2 text-xl font-bold">{service.name}</h3>
                <p className="mt-2 text-gray-500">{service.location}, Bangladesh</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xl font-bold text-rose-700">
                    ৳{service.price.toLocaleString()}
                  </span>
                  <button
                    onClick={() => setSelected(service)}
                    className="rounded-lg bg-rose-700 px-5 py-2.5 font-semibold text-white hover:bg-rose-800"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <p className="py-16 text-center text-gray-500">
            No services found. Try another search.
          </p>
        )}
      </section>

      <section id="about" className="bg-[#faeceb] px-5 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Why Choose WedPlan?</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              ["Trusted Professionals", "Explore quality wedding services from talented vendors."],
              ["Easy Planning", "Discover services and compare options in one convenient place."],
              ["Memorable Experiences", "Make your special celebration truly unforgettable."],
            ].map(([title, description]) => (
              <div key={title} className="rounded-2xl bg-white p-9 shadow-sm">
                <h3 className="text-xl font-bold text-rose-800">{title}</h3>
                <p className="mt-4 text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 text-center">
        <h2 className="text-3xl font-bold">How WedPlan Works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            ["01", "Explore Services", "Find your favorite wedding professionals."],
            ["02", "Compare Options", "Choose services that match your vision and budget."],
            ["03", "Plan Your Day", "Bring your wedding ideas to life."],
          ].map(([number, title, description]) => (
            <div key={number} className="rounded-2xl border border-rose-100 p-7">
              <p className="text-4xl font-bold text-rose-300">{number}</p>
              <h3 className="mt-4 text-xl font-bold">{title}</h3>
              <p className="mt-3 text-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer id="contact" className="bg-[#332326] px-5 py-10 text-center text-white">
        <h2 className="text-3xl font-bold">WedPlan.</h2>
        <p className="mt-3 text-rose-100">
          Your wedding, your vision, our passion.
        </p>
        <p className="mt-5 text-sm text-gray-300">
          Contact: hello@wedplan.example
        </p>
        <p className="mt-6 text-xs text-gray-400">
          © 2026 WedPlan. All Rights Reserved.
        </p>
      </footer>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Service details"
            className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl"
          >
            <button
              onClick={() => setSelected(null)}
              className="float-right text-2xl text-gray-500"
              aria-label="Close details"
            >
              ×
            </button>
            <h2 className="pr-8 text-2xl font-bold">{selected.name}</h2>
            <p className="mt-4 text-gray-600">Category: {selected.category}</p>
            <p className="mt-2 text-gray-600">Location: {selected.location}</p>
            <p className="mt-4 text-2xl font-bold text-rose-700">
              ৳{selected.price.toLocaleString()}
            </p>
            <p className="mt-5 text-sm text-gray-500">
              Online booking will be available after authentication and
              booking API integration.
            </p>
            <button
              onClick={() => setSelected(null)}
              className="mt-6 w-full rounded-lg bg-rose-700 py-3 font-semibold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
