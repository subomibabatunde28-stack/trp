
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export default function MyPropertiesPage() {
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProperties() {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError) throw authError;

        const user = authData.user;

        if (!user) {
          router.replace("/login");
          return;
        }

        const { data, error: propertyError } = await supabase
          .from("properties")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });

        if (propertyError) throw propertyError;

        setProperties((data || []) as Property[]);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your properties."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, [router]);

  function formatPrice(amount: number) {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <>
      <Navbar />

      <main className="my-properties-page">
        <div className="my-properties-container">
          <div className="my-properties-heading">
            <div>
              <span className="dashboard-eyebrow">
                PROPERTY MANAGEMENT
              </span>
              <h1>My properties</h1>
              <p>
                View and keep track of the properties you have
                submitted to TRP.
              </p>
            </div>

            <Link
              href="/properties/add"
              className="my-properties-add-button"
            >
              + Add a property
            </Link>
          </div>

          <div className="my-properties-summary">
            <div>
              <span>Total properties</span>
              <strong>{properties.length}</strong>
            </div>
            <div>
              <span>Pending review</span>
              <strong>
                {properties.filter((p) => p.status === "pending").length}
              </strong>
            </div>
            <div>
              <span>Approved</span>
              <strong>
                {properties.filter((p) => p.status === "approved").length}
              </strong>
            </div>
          </div>

          {loading ? (
            <div className="my-properties-message">
              Loading your properties...
            </div>
          ) : error ? (
            <div className="my-properties-message my-properties-error">
              {error}
            </div>
          ) : properties.length === 0 ? (
            <div className="my-properties-empty">
              <div className="my-properties-empty-icon">⌂</div>
              <h2>No properties submitted yet</h2>
              <p>
                Your submitted properties will appear here so you can
                monitor their verification status.
              </p>
              <Link
                href="/properties/add"
                className="my-properties-add-button"
              >
                Submit your first property
              </Link>
            </div>
          ) : (
            <div className="my-properties-list">
              {properties.map((property) => (
                <article
                  className="my-property-card"
                  key={property.id}
                >
                  <div className="my-property-top">
                    <div>
                      <span className="my-property-type">
                        {property.property_type}
                      </span>
                      <h2>{property.title}</h2>
                      <p>
                        {property.area}, {property.city}, {property.state}
                      </p>
                    </div>

                    <span
                      className={`my-property-status status-${property.status}`}
                    >
                      {property.status}
                    </span>
                  </div>

                  <p className="my-property-description">
                    {property.description}
                  </p>

                  <div className="my-property-details">
                    <span>{property.bedrooms} Bedrooms</span>
                    <span>{property.bathrooms} Bathrooms</span>
                    <span>
                      {property.payment_period === "yearly"
                        ? "Per year"
                        : property.payment_period === "monthly"
                        ? "Per month"
                        : property.payment_period}
                    </span>
                  </div>

                  <div className="my-property-bottom">
                    <div>
                      <strong>
                        {formatPrice(Number(property.rent_amount))}
                      </strong>
                      <small>
                        Submitted {formatDate(property.created_at)}
                      </small>
                    </div>

                    <span className="my-property-review">
                      {property.status === "pending"
                        ? "Awaiting verification"
                        : property.status === "approved"
                        ? "Verified listing"
                        : "Review required"}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
