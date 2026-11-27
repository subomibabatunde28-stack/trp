
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function VerifiedPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProperties() {
      try {
        const { data, error: fetchError } = await supabase
          .from("properties")
          .select("*")
          .eq("status", "approved")
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;

        setProperties((data || []) as Property[]);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load verified properties."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, []);

  function formatPrice(amount: number) {
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

    return property.property_type.toLowerCase().includes("house")
      ? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900"
      : "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=900";
  }

  return (
    <>
      <Navbar />

      <main className="verified-page">
        <section className="verified-hero">
          <span className="verified-eyebrow">TRP VERIFIED LISTINGS</span>
          <h1>Find a home you can feel confident about.</h1>
          <p>
            Explore properties that have passed the TRP admin review
            process. Browse available listings with clear details and
            transparent rental costs.
          </p>

          <div className="verified-hero-stats">
            <div>
              <strong>{properties.length}</strong>
              <span>Approved listings</span>
            </div>
            <div>
              <strong>36 + FCT</strong>
              <span>Our nationwide vision</span>
            </div>
          </div>
        </section>

        <section className="verified-content">
          <div className="verified-heading">
            <div>
              <span className="verified-eyebrow">EXPLORE HOMES</span>
              <h2>Approved properties</h2>
              <p>Listings reviewed and approved by the TRP admin.</p>
            </div>

            <Link href="/properties" className="verified-browse-link">
              Browse all properties →
            </Link>
          </div>

          {loading ? (
            <div className="verified-state">
              <div className="verified-loader" />
              <p>Loading approved properties...</p>
            </div>
          ) : error ? (
            <div className="verified-state verified-error">
              <h3>Unable to load properties</h3>
              <p>{error}</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="verified-empty">
              <div className="verified-empty-mark">TRP</div>
              <h3>No approved properties yet</h3>
              <p>
                There are currently no approved listings. Please check
                again soon as new properties are reviewed and added.
              </p>
              <Link href="/properties" className="verified-empty-button">
                Explore properties
              </Link>
            </div>
          ) : (
            <div className="verified-grid">
              {properties.map((property) => (
                <article className="verified-card" key={property.id}>
                  <div className="verified-card-top">
                    <span className="verified-badge">
                      <span>✓</span> TRP Approved
                    </span>
                    <span className="verified-type">
                      {property.property_type}
                    </span>
                  </div>

                  <img
                    className="verified-property-image"
                    src={getPropertyImage(property)}
                    alt={property.title}
                    onError={(event) => {
                      event.currentTarget.src =
                        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900";
                    }}
                  />

                  <div className="verified-card-body">
                    <h3>{property.title}</h3>

                    <p className="verified-location">
                      <span>⌖</span>
                      {property.area}, {property.city}, {property.state}
                    </p>

                    <p className="verified-description">
                      {property.description}
                    </p>

                    <div className="verified-features">
                      <span>{property.bedrooms} Bedrooms</span>
                      <span>{property.bathrooms} Bathrooms</span>
                    </div>

                    <div className="verified-price">
                      <div>
                        <strong>{formatPrice(property.rent_amount)}</strong>
                        <span> / {property.payment_period}</span>
                      </div>
                    </div>

                    <div className="verified-cost-note">
                      Additional costs:{" "}
                      <strong>
                        {formatPrice(property.additional_costs)}
                      </strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
