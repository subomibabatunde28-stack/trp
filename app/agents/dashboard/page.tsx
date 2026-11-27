
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { supabase } from "@/lib/supabase";

type AgentProfile = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  account_type: "landlord" | "agent";
  agency_name: string | null;
  state: string;
  verification_status: string;
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
  propertyTitle: string;
  propertyLocation: string;
};

type EnquiryMessage = {
  id: string;
  enquiry_id: string;
  sender_id: string;
  message: string;
  created_at: string;
};

export default function AgentDashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] =
    useState<Enquiry | null>(null);
  const [messages, setMessages] = useState<EnquiryMessage[]>([]);
  const [reply, setReply] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [inboxError, setInboxError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadAgentDashboard() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw new Error(authError.message);

        if (!user) {
          router.replace("/login");
          return;
        }

        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) throw new Error(profileError.message);

        if (data.account_type !== "agent") {
          router.replace("/dashboard");
          return;
        }

        setProfile(data as AgentProfile);
        await loadEnquiries(user.id);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your agent dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAgentDashboard();
  }, [router]);

  async function loadEnquiries(agentId: string) {
    setInboxError("");

    const { data, error: enquiryError } = await supabase
      .from("property_enquiries")
      .select("*")
      .eq("recipient_id", agentId)
      .order("created_at", { ascending: false });

    if (enquiryError) {
      setInboxError(enquiryError.message);
      return;
    }

    const enquiryRows = data || [];

    if (enquiryRows.length === 0) {
      setEnquiries([]);
      return;
    }

    const propertyIds = [
      ...new Set(enquiryRows.map((item) => item.property_id)),
    ];

    const { data: properties, error: propertyError } = await supabase
      .from("properties")
      .select("id, title, city, state")
      .in("id", propertyIds);

    if (propertyError) {
      setInboxError(propertyError.message);
      return;
    }

    const propertyMap = new Map(
      (properties || []).map((property) => [
        property.id,
        {
          title: property.title,
          location: `${property.city || ""}, ${property.state || ""}`.trim(),
        },
      ])
    );

    const formattedEnquiries: Enquiry[] = enquiryRows.map((item) => {
      const property = propertyMap.get(item.property_id);

      return {
        ...item,
        propertyTitle: property?.title || "Rental property",
        propertyLocation: property?.location || "Location unavailable",
      };
    });

    setEnquiries(formattedEnquiries);
  }

  async function openEnquiry(enquiry: Enquiry) {
    setSelectedEnquiry(enquiry);
    setMessages([]);
    setReply("");
    setInboxError("");
    setSuccessMessage("");
    setLoadingMessages(true);

    const { data, error: messageError } = await supabase
      .from("property_enquiry_messages")
      .select("*")
      .eq("enquiry_id", enquiry.id)
      .order("created_at", { ascending: true });

    if (messageError) {
      setInboxError(messageError.message);
    } else {
      setMessages(data || []);
    }

    setLoadingMessages(false);
  }

  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile || !selectedEnquiry || !reply.trim()) return;

    setSendingReply(true);
    setInboxError("");
    setSuccessMessage("");

    const messageText = reply.trim();

    const { data: newMessage, error: messageError } = await supabase
      .from("property_enquiry_messages")
      .insert({
        enquiry_id: selectedEnquiry.id,
        sender_id: profile.id,
        message: messageText,
      })
      .select()
      .single();

    if (messageError) {
      setInboxError(messageError.message);
      setSendingReply(false);
      return;
    }

    const { error: statusError } = await supabase
      .from("property_enquiries")
      .update({ status: "responded" })
      .eq("id", selectedEnquiry.id);

    if (statusError) {
      setInboxError(
        "Your reply was sent, but the enquiry status could not be updated."
      );
    } else {
      setSuccessMessage("Your reply has been sent.");
    }

    setMessages((current) => [...current, newMessage as EnquiryMessage]);
    setReply("");

    setEnquiries((current) =>
      current.map((item) =>
        item.id === selectedEnquiry.id
          ? { ...item, status: "responded" }
          : item
      )
    );

    setSelectedEnquiry((current) =>
      current ? { ...current, status: "responded" } : current
    );

    setSendingReply(false);
  }

  async function handleLogout() {
    const { error: logoutError } = await supabase.auth.signOut();

    if (logoutError) {
      setError(logoutError.message);
      return;
    }

    router.replace("/login");
  }

  return (
    <>
      <Navbar />

      <main className="dashboard-page">
        <div className="dashboard-container">
          {loading ? (
            <div className="dashboard-card">
              <p>Loading your agent dashboard...</p>
            </div>
          ) : error ? (
            <div className="dashboard-card">
              <h2>Unable to load dashboard</h2>
              <p>{error}</p>
              <button
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
                  <p className="dashboard-eyebrow">AGENT WORKSPACE</p>
                  <h1>Welcome, {profile.full_name}</h1>
                  <p>
                    Manage your agency profile and rental activities
                    from your TRP workspace.
                  </p>
                </div>

                <button
                  className="dashboard-logout"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </section>

              <section className="dashboard-status-card">
                <div>
                  <span className="dashboard-status-label">
                    Agent verification
                  </span>
                  <h2>
                    {profile.verification_status === "verified"
                      ? "Verified agent"
                      : "Verification pending"}
                  </h2>
                  <p>
                    {profile.verification_status === "verified"
                      ? "Your agent account has been verified."
                      : "Your agent profile is awaiting verification."}
                  </p>
                </div>

                <span className="dashboard-status-badge">
                  {profile.verification_status || "Pending"}
                </span>
              </section>

              <section className="dashboard-grid">
                <div className="dashboard-card">
                  <h3>My listings</h3>
                  <p>
                    Add and manage rental properties assigned to your
                    agency.
                  </p>
                  <span className="dashboard-coming-soon">
                    Coming soon
                  </span>
                </div>

                <div className="dashboard-card">
                  <h3>Applications</h3>
                  <p>
                    View and manage applications from prospective
                    tenants.
                  </p>
                  <span className="dashboard-coming-soon">
                    Coming soon
                  </span>
                </div>

                <div className="dashboard-card">
                  <h3>Verification</h3>
                  <p>
                    TRP verification helps build confidence in your
                    identity and agency.
                  </p>
                  <span className="dashboard-coming-soon">
                    {profile.verification_status === "verified"
                      ? "Verified"
                      : "Pending"}
                  </span>
                </div>
              </section>

              <section className="landlord-inbox">
                <div className="landlord-inbox-header">
                  <div>
                    <p className="dashboard-eyebrow">COMMUNICATIONS</p>
                    <h2>Property enquiries</h2>
                    <p>
                      Read messages from prospective tenants and respond
                      to their enquiries.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="landlord-inbox-refresh"
                    onClick={() => loadEnquiries(profile.id)}
                  >
                    Refresh
                  </button>
                </div>

                {inboxError && (
                  <p className="landlord-inbox-error">{inboxError}</p>
                )}

                <div className="landlord-inbox-layout">
                  <div className="landlord-enquiry-list">
                    {enquiries.length === 0 ? (
                      <div className="landlord-inbox-empty">
                        <h3>No enquiries yet</h3>
                        <p>
                          Enquiries sent about properties assigned to
                          your account will appear here.
                        </p>
                      </div>
                    ) : (
                      enquiries.map((enquiry) => (
                        <button
                          type="button"
                          key={enquiry.id}
                          className={`landlord-enquiry-item ${
                            selectedEnquiry?.id === enquiry.id
                              ? "active"
                              : ""
                          }`}
                          onClick={() => openEnquiry(enquiry)}
                        >
                          <div className="landlord-enquiry-top">
                            <strong>
                              {enquiry.subject || "Property enquiry"}
                            </strong>
                            <span
                              className={`landlord-enquiry-status ${enquiry.status}`}
                            >
                              {enquiry.status}
                            </span>
                          </div>

                          <p>{enquiry.propertyTitle}</p>
                          <small>{enquiry.propertyLocation}</small>
                          <small>
                            {new Date(enquiry.created_at).toLocaleDateString()}
                          </small>
                        </button>
                      ))
                    )}
                  </div>

                  <div className="landlord-conversation">
                    {!selectedEnquiry ? (
                      <div className="landlord-inbox-empty">
                        <h3>Select an enquiry</h3>
                        <p>
                          Choose an enquiry to read the conversation
                          and reply to the tenant.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="landlord-conversation-header">
                          <h3>
                            {selectedEnquiry.subject || "Property enquiry"}
                          </h3>
                          <p>{selectedEnquiry.propertyTitle}</p>
                          <small>
                            {selectedEnquiry.propertyLocation}
                          </small>
                        </div>

                        <div className="landlord-message-list">
                          {loadingMessages ? (
                            <p>Loading conversation...</p>
                          ) : messages.length === 0 ? (
                            <p>No messages in this conversation yet.</p>
                          ) : (
                            messages.map((message) => (
                              <div
                                key={message.id}
                                className={`landlord-message ${
                                  message.sender_id === profile.id
                                    ? "sent"
                                    : "received"
                                }`}
                              >
                                <span>
                                  {message.sender_id === profile.id
                                    ? "You"
                                    : "Tenant"}
                                </span>
                                <p>{message.message}</p>
                                <small>
                                  {new Date(
                                    message.created_at
                                  ).toLocaleString()}
                                </small>
                              </div>
                            ))
                          )}
                        </div>

                        <form
                          className="landlord-reply-form"
                          onSubmit={sendReply}
                        >
                          <textarea
                            value={reply}
                            onChange={(event) =>
                              setReply(event.target.value)
                            }
                            placeholder="Write your reply to the tenant..."
                            rows={3}
                            required
                          />

                          <button
                            type="submit"
                            disabled={sendingReply || !reply.trim()}
                          >
                            {sendingReply ? "Sending..." : "Send reply"}
                          </button>
                        </form>

                        {successMessage && (
                          <p className="landlord-inbox-success">
                            {successMessage}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </section>

              <section className="dashboard-card dashboard-profile">
                <h2>Agent profile</h2>

                <div className="dashboard-details">
                  <div>
                    <span>Full name</span>
                    <strong>{profile.full_name}</strong>
                  </div>

                  <div>
                    <span>Email address</span>
                    <strong>{profile.email}</strong>
                  </div>

                  <div>
                    <span>Phone number</span>
                    <strong>{profile.phone}</strong>
                  </div>

                  <div>
                    <span>Agency name</span>
                    <strong>{profile.agency_name || "Not provided"}</strong>
                  </div>

                  <div>
                    <span>Account type</span>
                    <strong>Real Estate Agent</strong>
                  </div>

                  <div>
                    <span>Operating state</span>
                    <strong>{profile.state}</strong>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <div className="dashboard-card">
              <h2>Agent profile not found</h2>
              <p>Please sign in again or contact TRP support.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
