
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  account_type: "landlord" | "agent" | null;
  agency_name: string | null;
  state: string | null;
  verification_status: string | null;
};

type Enquiry = {
  id: string;
  property_id: string;
  tenant_id: string;
  recipient_id: string;
  subject: string | null;
  initial_message: string;
  status: string;
  created_at: string;
  property_title: string;
  property_location: string;
  tenant_name: string;
  tenant_email: string;
};

type EnquiryMessage = {
  id: string;
  enquiry_id: string;
  sender_id: string;
  message: string;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [messages, setMessages] = useState<EnquiryMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [reply, setReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [inboxError, setInboxError] = useState("");
  const [inboxSuccess, setInboxSuccess] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      let currentStep = "Checking your login";

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw new Error(`Login check failed: ${authError.message}`);
        }

        if (!user) {
          router.replace("/login");
          return;
        }

        currentStep = "Loading your TRP profile";

        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          throw new Error(
            `Profile loading failed: ${profileError.message} (Code: ${profileError.code})`
          );
        }

        if (!data) {
          throw new Error("No profile was found for this account.");
        }

        const accountProfile = {
          ...(data as Profile),
          full_name:
            data.full_name ||
            (typeof user.user_metadata?.full_name === "string"
              ? user.user_metadata.full_name
              : null),
          email: data.email || user.email || null,
          phone:
            data.phone ||
            (typeof user.user_metadata?.phone === "string"
              ? user.user_metadata.phone
              : null),
          agency_name: data.agency_name || null,
          state: data.state || null,
          verification_status: data.verification_status || "pending",
        };

        if (accountProfile.account_type !== "landlord") {
          if (accountProfile.account_type === "agent") {
            router.replace("/agent/dashboard");
          } else {
            router.replace("/tenant/dashboard");
          }
          return;
        }

        setProfile(accountProfile);

        currentStep = "Loading property enquiries";
        await loadEnquiries(user.id);
      } catch (err: unknown) {
        console.error("TRP Dashboard Error:", err);

        const message =
          err instanceof Error ? err.message : JSON.stringify(err);

        setError(`${currentStep}: ${message || "Unknown error"}`);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  async function loadEnquiries(userId: string) {
    setLoadingEnquiries(true);
    setInboxError("");

    try {
      const { data, error: enquiryError } = await supabase
        .from("property_enquiries")
        .select("*")
        .eq("recipient_id", userId)
        .order("created_at", { ascending: false });

      if (enquiryError) throw enquiryError;

      const enquiryRows = data || [];

      if (enquiryRows.length === 0) {
        setEnquiries([]);
        return;
      }

      const propertyIds = [
        ...new Set(enquiryRows.map((item) => item.property_id)),
      ];

      const tenantIds = [
        ...new Set(enquiryRows.map((item) => item.tenant_id)),
      ];

      const [
        { data: properties, error: propertyError },
        { data: tenants, error: tenantError },
      ] = await Promise.all([
        supabase
          .from("properties")
          .select("id, title, city, state")
          .in("id", propertyIds),

        supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", tenantIds),
      ]);

      if (propertyError) throw propertyError;
      if (tenantError) throw tenantError;

      const propertyMap = new Map(
        (properties || []).map((property) => [property.id, property])
      );

      const tenantMap = new Map(
        (tenants || []).map((tenant) => [tenant.id, tenant])
      );

      const formattedEnquiries: Enquiry[] = enquiryRows.map((item) => {
        const property = propertyMap.get(item.property_id);
        const tenant = tenantMap.get(item.tenant_id);

        return {
          ...item,
          property_title: property?.title || "Property listing",
          property_location: property
            ? `${property.city}, ${property.state}`
            : "Location unavailable",
          tenant_name: tenant?.full_name || "TRP tenant",
          tenant_email: tenant?.email || "",
        };
      });

      setEnquiries(formattedEnquiries);
    } catch (err) {
      console.error("Enquiry loading error:", err);
      setInboxError(
        err instanceof Error
          ? err.message
          : "Could not load property enquiries."
      );
    } finally {
      setLoadingEnquiries(false);
    }
  }

  async function openEnquiry(enquiry: Enquiry) {
    setSelectedEnquiry(enquiry);
    setMessages([]);
    setReply("");
    setInboxError("");
    setInboxSuccess("");
    setLoadingMessages(true);

    try {
      const { data, error: messageError } = await supabase
        .from("property_enquiry_messages")
        .select("*")
        .eq("enquiry_id", enquiry.id)
        .order("created_at", { ascending: true });

      if (messageError) throw messageError;

      setMessages(data || []);
    } catch (err) {
      console.error("Conversation loading error:", err);
      setInboxError(
        err instanceof Error
          ? err.message
          : "Could not load this conversation."
      );
    } finally {
      setLoadingMessages(false);
    }
  }

  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedEnquiry || !reply.trim()) return;

    setSendingReply(true);
    setInboxError("");
    setInboxSuccess("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please log in again to send your reply.");
      }

      const { data: newMessage, error: messageError } = await supabase
        .from("property_enquiry_messages")
        .insert({
          enquiry_id: selectedEnquiry.id,
          sender_id: user.id,
          message: reply.trim(),
        })
        .select("*")
        .single();

      if (messageError) throw messageError;

      const { error: updateError } = await supabase
        .from("property_enquiries")
        .update({ status: "responded" })
        .eq("id", selectedEnquiry.id);

      if (updateError) {
        throw new Error(
          "Your reply was sent, but the enquiry status could not be updated. Please refresh."
        );
      }

      setMessages((current) => [...current, newMessage]);
      setReply("");
      setInboxSuccess("Your reply has been sent successfully.");

      setEnquiries((current) =>
        current.map((item) =>
          item.id === selectedEnquiry.id
            ? { ...item, status: "responded" }
            : item
        )
      );

      setSelectedEnquiry((current) =>
        current ? { ...current, status: "responded" } : null
      );
    } catch (err) {
      setInboxError(
        err instanceof Error
          ? err.message
          : "Your reply could not be sent. Please try again."
      );
    } finally {
      setSendingReply(false);
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

  function formatDate(date: string) {
    return new Date(date).toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return (
    <>
      <Navbar />

      <main className="dashboard-page">
        <div className="dashboard-container">
          {loading ? (
            <div className="dashboard-card">
              <p>Loading your dashboard...</p>
            </div>
          ) : error ? (
            <div className="dashboard-card">
              <h2>Dashboard error</h2>
              <p>{error}</p>
              <button
                type="button"
                className="dashboard-button"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </div>
          ) : profile ? (
            <>
              <section className="dashboard-welcome">
                <div>
                  <p className="dashboard-eyebrow">LANDLORD DASHBOARD</p>
                  <h1>Welcome, {profile.full_name || "Landlord"}</h1>
                  <p>
                    Manage your rental activity and keep track of your
                    TRP account.
                  </p>
                </div>

                <button
                  type="button"
                  className="dashboard-logout"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </section>

              <section className="dashboard-status-card">
                <div>
                  <span className="dashboard-status-label">
                    Account verification
                  </span>
                  <h2>
                    {profile.verification_status === "verified"
                      ? "Verified account"
                      : "Verification pending"}
                  </h2>
                  <p>
                    {profile.verification_status === "verified"
                      ? "Your account has been verified."
                      : "Your profile is registered and awaiting verification."}
                  </p>
                </div>

                <span className="dashboard-status-badge">
                  {profile.verification_status || "Pending"}
                </span>
              </section>

              <section className="dashboard-grid">
                <div className="dashboard-card">
                  <h3>My properties</h3>
                  <p>Your listed rental properties will appear here.</p>
                  <span className="dashboard-coming-soon">Coming soon</span>
                </div>

                <div className="dashboard-card">
                  <h3>Rental activity</h3>
                  <p>Keep track of applications and property activity.</p>
                  <span className="dashboard-coming-soon">Coming soon</span>
                </div>

                <div className="dashboard-card">
                  <h3>Account security</h3>
                  <p>Your TRP account is connected to your registered email.</p>
                  <span className="dashboard-coming-soon">Active</span>
                </div>
              </section>

              <section className="dashboard-card landlord-inbox">
                <div className="landlord-inbox-heading">
                  <div>
                    <p className="dashboard-eyebrow">TENANT COMMUNICATION</p>
                    <h2>Property enquiries</h2>
                    <p>
                      Read enquiries and respond to people interested in
                      your properties.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="inbox-refresh-button"
                    onClick={() => loadEnquiries(profile.id)}
                    disabled={loadingEnquiries}
                  >
                    {loadingEnquiries ? "Refreshing..." : "Refresh"}
                  </button>
                </div>

                {inboxError && !selectedEnquiry && (
                  <p className="inbox-error">{inboxError}</p>
                )}

                {loadingEnquiries ? (
                  <p className="inbox-empty">Loading enquiries...</p>
                ) : enquiries.length === 0 ? (
                  <div className="inbox-empty">
                    <h3>No enquiries yet</h3>
                    <p>
                      When tenants contact you about your properties,
                      their messages will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="landlord-inbox-list">
                    {enquiries.map((enquiry) => (
                      <button
                        type="button"
                        key={enquiry.id}
                        className={`landlord-enquiry-item ${
                          selectedEnquiry?.id === enquiry.id ? "selected" : ""
                        }`}
                        onClick={() => openEnquiry(enquiry)}
                      >
                        <div className="landlord-enquiry-top">
                          <strong>{enquiry.tenant_name}</strong>
                          <span
                            className={`enquiry-status ${
                              enquiry.status === "responded"
                                ? "responded"
                                : ""
                            }`}
                          >
                            {enquiry.status}
                          </span>
                        </div>

                        <h3>{enquiry.property_title}</h3>
                        <p>{enquiry.property_location}</p>
                        <span className="landlord-enquiry-subject">
                          {enquiry.subject || "Property enquiry"}
                        </span>
                        <span className="landlord-enquiry-date">
                          {formatDate(enquiry.created_at)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {selectedEnquiry && (
                  <div className="landlord-conversation">
                    <div className="landlord-conversation-heading">
                      <div>
                        <button
                          type="button"
                          className="conversation-back"
                          onClick={() => {
                            setSelectedEnquiry(null);
                            setMessages([]);
                            setInboxError("");
                            setInboxSuccess("");
                          }}
                        >
                          ← Back to enquiries
                        </button>

                        <h3>{selectedEnquiry.subject || "Property enquiry"}</h3>
                        <p>
                          {selectedEnquiry.tenant_name} ·{" "}
                          {selectedEnquiry.property_title}
                        </p>
                        {selectedEnquiry.tenant_email && (
                          <p>{selectedEnquiry.tenant_email}</p>
                        )}
                      </div>

                      <span
                        className={`enquiry-status ${
                          selectedEnquiry.status === "responded"
                            ? "responded"
                            : ""
                        }`}
                      >
                        {selectedEnquiry.status}
                      </span>
                    </div>

                    <div className="landlord-message-list">
                      {loadingMessages ? (
                        <p>Loading conversation...</p>
                      ) : (
                        <>
                          {messages.map((item) => (
                            <div
                              key={item.id}
                              className={`landlord-message ${
                                item.sender_id === profile.id
                                  ? "sent"
                                  : "received"
                              }`}
                            >
                              <span>
                                {item.sender_id === profile.id
                                  ? "You"
                                  : selectedEnquiry.tenant_name}
                              </span>
                              <p>{item.message}</p>
                              <small>{formatDate(item.created_at)}</small>
                            </div>
                          ))}
                        </>
                      )}
                    </div>

                    {inboxError && (
                      <p className="inbox-error">{inboxError}</p>
                    )}

                    {inboxSuccess && (
                      <p className="inbox-success">{inboxSuccess}</p>
                    )}

                    <form
                      className="landlord-reply-form"
                      onSubmit={sendReply}
                    >
                      <label htmlFor="landlord-reply">
                        Write your reply
                      </label>
                      <textarea
                        id="landlord-reply"
                        value={reply}
                        onChange={(event) => setReply(event.target.value)}
                        placeholder="Write a message to the tenant..."
                        rows={4}
                        required
                      />

                      <button
                        type="submit"
                        className="dashboard-button"
                        disabled={sendingReply || !reply.trim()}
                      >
                        {sendingReply ? "Sending..." : "Send Reply"}
                      </button>
                    </form>
                  </div>
                )}
              </section>

              <section className="dashboard-card dashboard-profile">
                <h2>My profile</h2>

                <div className="dashboard-details">
                  <div>
                    <span>Full name</span>
                    <strong>{profile.full_name || "Not provided"}</strong>
                  </div>

                  <div>
                    <span>Email address</span>
                    <strong>{profile.email || "Not provided"}</strong>
                  </div>

                  <div>
                    <span>Phone number</span>
                    <strong>{profile.phone || "Not provided"}</strong>
                  </div>

                  <div>
                    <span>Account type</span>
                    <strong>Landlord</strong>
                  </div>

                  <div>
                    <span>State</span>
                    <strong>{profile.state || "Not provided"}</strong>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <div className="dashboard-card">
              <h2>No profile found</h2>
              <p>No TRP profile is connected to this account.</p>
              <button
                type="button"
                className="dashboard-button"
                onClick={() => router.replace("/signup")}
              >
                Create an account
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
