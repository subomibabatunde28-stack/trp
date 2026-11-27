
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { supabase } from "@/lib/supabase";

type Property = {
  id: string;
  owner_id: string;
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

export default function AdminDashboard() {
  const router = useRouter();

  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("all");

  const loadProperties = useCallback(async () => {
    setError("");

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) throw authError;

      const user = authData.user;

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile?.is_admin) {
        router.replace("/dashboard");
        return;
      }

      const { data, error: propertyError } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (propertyError) throw propertyError;

      setProperties((data || []) as Property[]);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load the admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  async function updateStatus(
    propertyId: string,
    newStatus: "approved" | "rejected"
  ) {
    const action = newStatus === "approved" ? "approve" : "reject";

    if (!window.confirm(`Are you sure you want to ${action} this property?`)) {
      return;
    }

    setUpdatingId(propertyId);
    setError("");
    setNotice("");

    try {
      const { error: updateError } = await supabase
        .from("properties")
        .update({ status: newStatus })
        .eq("id", propertyId);

      if (updateError) throw updateError;

      setProperties((current) =>
        current.map((property) =>
          property.id === propertyId
            ? { ...property, status: newStatus }
            : property
        )
      );

      setNotice(
        newStatus === "approved"
          ? "Property approved successfully."
          : "Property rejected successfully."
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update property status."
      );
    } finally {
      setUpdatingId("");
    }
  }

  async function handleLogout() {
    const { error: logoutError } = await supabase.auth.signOut();

    if (logoutError) {
      setError(logoutError.message);
      return;
    }

    router.replace("/login");
  }

  function formatPrice(amount: number) {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  }

  const pendingCount = properties.filter(
    (property) => property.status === "pending"
  ).length;

  const approvedCount = properties.filter(
    (property) => property.status === "approved"
  ).length;

  const rejectedCount = properties.filter(
    (property) => property.status === "rejected"
  ).length;

  const filteredProperties =
    filter === "all"
      ? properties
      : properties.filter((property) => property.status === filter);

  return (
    <>
      <Navbar />

      <main className="admin-page">
        <div className="admin-container">
          <div className="admin-heading">
            <div>
              <span className="dashboard-eyebrow">
                TRP ADMINISTRATION
              </span>
              <h1>Admin dashboard</h1>
              <p>
                Manage property submissions and monitor verification.
              </p>
            </div>

            <button
              className="admin-logout"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>

          <div className="admin-stats">
            <div className="admin-stat-card">
              <span>Total submissions</span>
              <strong>{properties.length}</strong>
            </div>

            <div className="admin-stat-card">
              <span>Pending review</span>
              <strong>{pendingCount}</strong>
            </div>

            <div className="admin-stat-card">
              <span>Approved</span>
              <strong>{approvedCount}</strong>
            </div>

            <div className="admin-stat-card">
              <span>Rejected</span>
              <strong>{rejectedCount}</strong>
            </div>
          </div>

          {error && (
            <div className="admin-message admin-error">
              {error}
            </div>
          )}

          {notice && (
            <div className="admin-message admin-success">
              {notice}
            </div>
          )}

          <section className="admin-properties-section">
            <div className="admin-section-heading">
              <div>
                <h2>Property submissions</h2>
                <p>Review listings submitted by landlords and agents.</p>
              </div>

              <button
                className="admin-refresh"
                onClick={loadProperties}
                disabled={loading}
              >
                Refresh
              </button>
            </div>

            <div className="admin-filters">
              {["all", "pending", "approved", "rejected"].map(
                (status) => (
                  <button
                    key={status}
                    className={filter === status ? "active" : ""}
                    onClick={() => setFilter(status)}
                  >
                    {status === "all"
                      ? "All properties"
                      : status.charAt(0).toUpperCase() +
                        status.slice(1)}
                  </button>
                )
              )}
            </div>

            {loading ? (
              <div className="admin-empty">
                Loading property submissions...
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="admin-empty">
                <h3>No properties found</h3>
                <p>
                  There are currently no properties in this category.
                </p>
              </div>
            ) : (
              <div className="admin-property-list">
                {filteredProperties.map((property) => (
                  <article
                    className="admin-property-card"
                    key={property.id}
                  >
                    <div className="admin-property-header">
                      <div>
                        <span className="admin-property-type">
                          {property.property_type}
                        </span>
                        <h3>{property.title}</h3>
                        <p>
                          {property.area}, {property.city},{" "}
                          {property.state}
                        </p>
                      </div>

                      <span
                        className={`my-property-status status-${property.status}`}
                      >
                        {property.status}
                      </span>
                    </div>

                    <p className="admin-property-description">
                      {property.description}
                    </p>

                    <div className="admin-property-details">
                      <span>{property.bedrooms} Bedrooms</span>
                      <span>{property.bathrooms} Bathrooms</span>
                      <span>{formatPrice(property.rent_amount)}</span>
                      <span>
                        {property.payment_period}
                      </span>
                    </div>

                    <div className="admin-property-actions">
                      {property.status !== "approved" && (
                        <button
                          className="admin-approve"
                          onClick={() =>
                            updateStatus(property.id, "approved")
                          }
                          disabled={updatingId === property.id}
                        >
                          {updatingId === property.id
                            ? "Updating..."
                            : "Approve property"}
                        </button>
                      )}

                      {property.status !== "rejected" && (
                        <button
                          className="admin-reject"
                          onClick={() =>
                            updateStatus(property.id, "rejected")
                          }
                          disabled={updatingId === property.id}
                        >
                          {updatingId === property.id
                            ? "Updating..."
                            : "Reject property"}
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
