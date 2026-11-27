
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { supabase } from "@/lib/supabase";

type Property = {
  id: string;
  title: string;
  description: string;
  property_type: string;
  state: string;
  city: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  rent_amount: number;
  payment_period: string;
  additional_costs: number;
  status: string;
  image_urls?: string[] | null;
};

const categories: Record<string, { label: string; types: string[] }> = {
  "self-contained": {
    label: "Self-contained",
    types: ["self contained", "self contain", "selfcon"],
  },
  apartments: {
    label: "Apartments",
    types: ["apartment", "apartments", "flat", "flats", "mini flat", "miniflat"],
  },
  room: {
    label: "Single rooms",
    types: ["room", "single room", "single rooms"],
  },
  duplex: {
    label: "Duplexes",
    types: ["duplex", "duplexes"],
  },
  bungalow: {
    label: "Bungalows",
    types: ["bungalow", "bungalows"],
  },
  "detached-house": {
    label: "Detached houses",
    types: ["detached house", "detached houses"],
  },
  "terraced-house": {
    label: "Terraced houses",
    types: ["terraced house", "terraced houses"],
  },
};

function normalizeType(type: string) {
  return (type || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ");
}

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

function getPropertyImage(property: Property) {
  if (property.image_urls?.length) {
    return property.image_urls[0];
  }

  return "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900";
}

function PropertyCard({ property }: { property: Property }) {
  return (
    <Link
      href={`/properties/${property.id}`}
      className="property-card"
    >
      <div className="property-card-image">
        <img
          src={getPropertyImage(property)}
          alt={property.title}
          onError={(event) => {
            event.currentTarget.src =
              "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900";
          }}
        />

        <span className="property-demo-label">
          TRP Approved
        </span>
      </div>

      <div className="property-card-content">
        <div className="property-card-location">
          <span>⌖</span> {property.area}, {property.city},{" "}
          {property.state}
        </div>

        <h3>{property.title}</h3>
        <p>{property.description}</p>

        <div className="property-card-details">
          <span>{property.bedrooms} bedroom(s)</span>
          <span>{property.bathrooms} bathroom(s)</span>
          <span>{property.property_type}</span>
        </div>

        <div className="property-card-bottom">
          <div>
            <strong>{formatNaira(property.rent_amount)}</strong>
            <small>per {property.payment_period}</small>
          </div>

          <span className="property-view-link">
            View property details →
          </span>
        </div>

        {Number(property.additional_costs) > 0 && (
          <p className="property-additional-cost">
            Additional costs: {formatNaira(property.additional_costs)}
          </p>
        )}
      </div>
    </Link>
  );
}

function PropertyCategoryContent() {
  const params = useParams<{ type: string }>();
  const type = params.type;

  const category = categories[type];
  const isAll = type === "all";

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("All states");
  const [maxBudget, setMaxBudget] = useState("Any budget");
  const [bedrooms, setBedrooms] = useState("Any");

  useEffect(() => {
    async function loadProperties() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Properties loading error:", error);
        setError("We couldn't load properties right now. Please try again.");
        setProperties([]);
      } else {
        setProperties((data || []) as Property[]);
      }

      setLoading(false);
    }
    

    loadProperties();
  }, []);

  const categoryProperties = useMemo(() => {
    if (isAll) return properties;
    if (!category) return [];

    return properties.filter((property) =>
      category.types.includes(normalizeType(property.property_type))
    );
  }, [properties, category, isAll]);

  const states = useMemo(
    () =>
      Array.from(
        new Set(
          categoryProperties
            .map((property) => property.state)
            .filter(Boolean)
        )
      ).sort(),
    [categoryProperties]
  );

  const filteredProperties = useMemo(() => {
    return categoryProperties.filter((property) => {
      const searchTerm = search.trim().toLowerCase();

      const location =
        `${property.area}, ${property.city}, ${property.state}`.toLowerCase();

      const matchesSearch =
        !searchTerm ||
        property.title.toLowerCase().includes(searchTerm) ||
        location.includes(searchTerm) ||
        property.description.toLowerCase().includes(searchTerm);

      const matchesState =
        selectedState === "All states" ||
        property.state === selectedState;

      const matchesBudget =
        maxBudget === "Any budget" ||
        Number(property.rent_amount) <= Number(maxBudget);

      const matchesBedrooms =
        bedrooms === "Any" ||
        Number(property.bedrooms) === Number(bedrooms);

      return (
        matchesSearch &&
        matchesState &&
        matchesBudget &&
        matchesBedrooms
      );
    });
  }, [categoryProperties, search, selectedState, maxBudget, bedrooms]);

  function clearFilters() {
    setSearch("");
    setSelectedState("All states");
    setMaxBudget("Any budget");
    setBedrooms("Any");
  }

  return (
    <>
      <Navbar />

      <main className="properties-page">
        <section className="properties-listings-section">
          <div className="properties-listings-heading">
            <div>
              <span className="properties-eyebrow">EXPLORE RENTALS</span>

              <h1>
                {isAll ? "All Properties" : category?.label || "Category"}
              </h1>

              <p>
                Browse properties approved by the TRP administration team.
              </p>
            </div>

            <Link href="/properties" className="properties-trust-button">
              ← All Categories
            </Link>
          </div>

          {!category && !isAll ? (
            <div className="properties-empty-state">
              <h3>Category not found</h3>
              <p>Please select a valid property category.</p>
              <Link href="/properties">Return to Properties</Link>
            </div>
          ) : (
            <>
              <div className="properties-filter-panel">
                <div className="properties-filter">
                  <label htmlFor="category-search">Search properties</label>
                  <input
                    id="category-search"
                    type="text"
                    placeholder="Search title, location or area..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <div className="properties-filter">
                  <label htmlFor="category-state">State</label>
                  <select
                    id="category-state"
                    value={selectedState}
                    onChange={(event) => setSelectedState(event.target.value)}
                  >
                    <option value="All states">All states</option>
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="properties-filter">
                  <label htmlFor="category-budget">Maximum rent</label>
                  <select
                    id="category-budget"
                    value={maxBudget}
                    onChange={(event) => setMaxBudget(event.target.value)}
                  >
                    <option value="Any budget">Any budget</option>
                    <option value="500000">₦500,000</option>
                    <option value="1000000">₦1,000,000</option>
                    <option value="1500000">₦1,500,000</option>
                    <option value="2000000">₦2,000,000</option>
                    <option value="3000000">₦3,000,000</option>
                  </select>
                </div>

                <div className="properties-filter">
                  <label htmlFor="category-bedrooms">Bedrooms</label>
                  <select
                    id="category-bedrooms"
                    value={bedrooms}
                    onChange={(event) => setBedrooms(event.target.value)}
                  >
                    <option value="Any">Any</option>
                    <option value="1">1 bedroom</option>
                    <option value="2">2 bedrooms</option>
                    <option value="3">3 bedrooms</option>
                    <option value="4">4 bedrooms</option>
                  </select>
                </div>

                <button
                  type="button"
                  className="properties-clear-button"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              </div>

              <div className="properties-listings-heading">
                <p className="properties-result-count">
                  {loading
                    ? "Loading..."
                    : `${filteredProperties.length} approved properties`}
                </p>
              </div>

              {loading ? (
                <div className="properties-empty-state">
                  <h3>Loading properties...</h3>
                  <p>Please wait while we find available listings.</p>
                </div>
              ) : error ? (
                <div className="properties-empty-state">
                  <h3>Unable to load properties</h3>
                  <p>{error}</p>
                  <button onClick={() => window.location.reload()}>
                    Try again
                  </button>
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="properties-empty-state">
                  <h3>No matching properties found</h3>
                  <p>
                    There are currently no approved properties matching
                    your search in this category.
                  </p>
                  <button onClick={clearFilters}>Clear filters</button>
                </div>
              ) : (
                <div className="properties-grid">
                  {filteredProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
export default function PropertyCategorPage() {
  return (
    <Suspense
      fallback={
        <main className="properties-page">
          <div className="properties-empty-state">
            <h3>Loading properties...</h3>
            <p>Please wait.</p>
          </div>
        </main>
      }
    >
      <PropertyCategoryContent />
    </Suspense>
  );
}
