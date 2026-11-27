
"use client";

import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const categories = [
  {
    value: "all",
    label: "All properties",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=700",
  },
  {
    value: "self-contained",
    label: "Self-contained",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=700",
  },
  {
    value: "apartments",
    label: "Apartments",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=700",
  },
  {
    value: "room",
    label: "Single rooms",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=700",
  },
  {
    value: "duplex",
    label: "Duplexes",
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=700",
  },
  {
    value: "bungalow",
    label: "Bungalows",
    image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=700",
  },
  {
    value: "detached-house",
    label: "Detached houses",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=700",
  },
  {
    value: "terraced-house",
    label: "Terraced houses",
    image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=700",
  },
];

export default function PropertiesPage() {
  return (
    <>
      <Navbar />

      <main className="properties-page">
        <section className="properties-hero">
          <div className="properties-hero-content">
            <span className="properties-eyebrow">
              RENT WITH MORE CONFIDENCE
            </span>

            <h1>
              Find a place
              <br />
              <span>you can trust.</span>
            </h1>

            <p>
              Explore rental properties across Nigeria. Compare options,
              understand costs and make more informed rental decisions.
            </p>

            <a href="#property-categories" className="properties-hero-button">
              Explore properties
            </a>
          </div>
        </section>

        <section
          className="properties-search-section"
          id="property-categories"
        >
          <div className="properties-section-heading">
            <div>
              <span className="properties-eyebrow">PROPERTY SEARCH</span>
              <h2>Find your next home</h2>
              <p>
                Choose a property category to explore available rentals.
              </p>
            </div>
          </div>

          <div className="properties-category-section">
            <div className="properties-category-heading">
              <h3>Explore by property type</h3>
              <p>
                Select a category to view all approved properties in that
                category.
              </p>
            </div>

            <div className="properties-category-grid">
              {categories.map((category) => (
                <Link
                  href={`/properties/category/${category.value}`}
                  key={category.value}
                  className="properties-category-card"
                >
                  <div className="properties-category-image">
                    <img
                      src={category.image}
                      alt={category.label}
                      loading="lazy"
                    />
                  </div>

                  <span>{category.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="properties-trust-section">
          <div>
            <span className="properties-eyebrow">THE TRP DIFFERENCE</span>
            <h2>Finding a home should come with peace of mind.</h2>
            <p>
              TRP is being designed to make rental transactions more
              transparent through property checks, clear costs and a
              protected handover process.
            </p>
          </div>

          <Link href="/how-it-works" className="properties-trust-button">
            Discover how TRP works
          </Link>
        </section>
      </main>

      <Footer />
    </>
  );
}
