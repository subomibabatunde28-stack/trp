
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  status: string;
  image_urls?: string[] | null;
};

const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

function getFallbackImage(propertyType: string) {
  return propertyType.toLowerCase().includes("house")
    ? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400"
    : "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1400";
}

function getPropertyImages(property: Property) {
  const uploadedImages = property.image_urls?.filter(
    (image) => typeof image === "string" && image.trim() !== ""
  );

  return uploadedImages && uploadedImages.length > 0
    ? uploadedImages
    : [getFallbackImage(property.property_type)];
}

export default function PropertyDetailsClient({ id }: { id: string }) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);

  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [enquiryFeedback, setEnquiryFeedback] = useState("");
  const [enquirySuccess, setEnquirySuccess] = useState(false);

  useEffect(() => {
    async function loadProperty() {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .eq("status", "approved")
        .single();

      if (error || !data) {
        setError(
          "This property could not be found or is no longer available."
        );
      } else {
        setProperty(data as Property);
        setActiveImage(0);
      }

      setLoading(false);
    }

    if (id) loadProperty();
  }, [id]);

  const images = property ? getPropertyImages(property) : [];

  const showPreviousImage = () => {
    setActiveImage((current) =>
      current === 0 ? images.length - 1 : current - 1
    );
  };

  const showNextImage = () => {
    setActiveImage((current) =>
      current === images.length - 1 ? 0 : current + 1
    );
  };

  const sendEnquiry = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!property) return;

    setEnquiryFeedback("");
    setEnquirySuccess(false);

    if (!message.trim()) {
      setEnquiryFeedback("Please enter a message before sending.");
      return;
    }

    setSending(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setEnquiryFeedback(
          "Please log in with your tenant account before contacting the property owner."
        );
        setSending(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", user.id)
        .single();

      if (profileError || profile?.account_type !== "tenant") {
        setEnquiryFeedback(
          "Only registered tenant accounts can send property enquiries."
        );
        setSending(false);
        return;
      }

      if (!property.owner_id || property.owner_id === user.id) {
        setEnquiryFeedback(
          "The property contact details are currently unavailable."
        );
        setSending(false);
        return;
      }

      const { data: enquiry, error: enquiryError } = await supabase
        .from("property_enquiries")
        .insert({
          property_id: property.id,
          tenant_id: user.id,
          recipient_id: property.owner_id,
          subject: subject.trim() || `Enquiry about ${property.title}`,
          initial_message: message.trim(),
        })
        .select("id")
        .single();

      if (enquiryError || !enquiry) {
        throw new Error(
          enquiryError?.message || "Your enquiry could not be created."
        );
      }

      const { error: messageError } = await supabase
        .from("property_enquiry_messages")
        .insert({
          enquiry_id: enquiry.id,
          sender_id: user.id,
          message: message.trim(),
        });

      if (messageError) {
        throw new Error(
          "Your enquiry was created, but the conversation message could not be saved. Please contact support."
        );
      }

      setEnquirySuccess(true);
      setEnquiryFeedback(
        "Your enquiry has been sent successfully. The property owner or agent can now respond."
      );
      setSubject("");
      setMessage("");
    } catch (err) {
      setEnquiryFeedback(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  const totalCost = property
    ? Number(property.rent_amount) + Number(property.additional_costs)
    : 0;

  return (
    <>
      <Navbar />

      <main className="property-details-page">
        <div className="property-details-container">
          <Link href="/properties" className="property-details-back">
            ← Back to properties
          </Link>

          {loading ? (
            <div className="property-details-message">
              Loading property details...
            </div>
          ) : error ? (
            <div className="property-details-message">
              <p>{error}</p>
              <Link href="/properties" className="property-details-button">
                Browse properties
              </Link>
            </div>
          ) : property ? (
            <>
              <div className="property-gallery">
                <div className="property-details-image">
                  <img
                    key={images[activeImage]}
                    src={images[activeImage]}
                    alt={`${property.title} - Photo ${activeImage + 1}`}
                    onClick={() => setViewerOpen(true)}
                    onError={(event) => {
                      event.currentTarget.src = getFallbackImage(
                        property.property_type
                      );
                    }}
                  />

                  <span className="property-details-badge">
                    TRP Approved
                  </span>

                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        className="property-gallery-arrow property-gallery-previous"
                        onClick={showPreviousImage}
                        aria-label="Previous photo"
                      >
                        &#10094;
                      </button>

                      <button
                        type="button"
                        className="property-gallery-arrow property-gallery-next"
                        onClick={showNextImage}
                        aria-label="Next photo"
                      >
                        &#10095;
                      </button>
                    </>
                  )}

                  <span className="property-gallery-count">
                    {activeImage + 1} / {images.length}
                  </span>

                  <span className="property-gallery-enlarge">
                    Click photo to enlarge
                  </span>
                </div>

                {images.length > 1 && (
                  <div className="property-gallery-thumbnails">
                    {images.map((image, index) => (
                      <button
                        type="button"
                        key={`${image}-${index}`}
                        className={`property-gallery-thumbnail ${
                          activeImage === index ? "active" : ""
                        }`}
                        onClick={() => setActiveImage(index)}
                        aria-label={`View photo ${index + 1}`}
                        aria-pressed={activeImage === index}
                      >
                        <img
                          src={image}
                          alt={`${property.title} thumbnail ${index + 1}`}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <section className="property-details-content">
                <div className="property-details-heading">
                  <div>
                    <p>
                      {property.city}, {property.state}
                    </p>
                    <h1>{property.title}</h1>
                    <span>{property.area}</span>
                  </div>

                  <div className="property-details-price">
                    <strong>{formatNaira(property.rent_amount)}</strong>
                    <span>per {property.payment_period}</span>
                  </div>
                </div>

                <div className="property-details-features">
                  <div>
                    <strong>{property.bedrooms}</strong>
                    <span>Bedrooms</span>
                  </div>
                  <div>
                    <strong>{property.bathrooms}</strong>
                    <span>Bathrooms</span>
                  </div>
                  <div>
                    <strong>{property.property_type}</strong>
                    <span>Property type</span>
                  </div>
                </div>

                <section className="property-details-section">
                  <h2>About this property</h2>
                  <p>{property.description}</p>
                </section>

                <section className="property-details-section">
                  <h2>Move-in cost breakdown</h2>

                  <div className="property-details-costs">
                    <p>
                      <span>Rent</span>
                      <strong>{formatNaira(property.rent_amount)}</strong>
                    </p>
                    <p>
                      <span>Additional costs</span>
                      <strong>
                        {formatNaira(property.additional_costs)}
                      </strong>
                    </p>
                    <p className="property-details-total">
                      <span>Total listed cost</span>
                      <strong>{formatNaira(totalCost)}</strong>
                    </p>
                  </div>

                  <p>
                    Confirm all charges with the property owner or agent
                    before making any payment.
                  </p>
                </section>

                <section className="property-enquiry-section">
                  <h2>Interested in this property?</h2>
                  <p>
                    Send an enquiry to the property owner or agent to ask
                    questions or request more information.
                  </p>

                  {!showEnquiryForm && !enquirySuccess && (
                    <button
                      type="button"
                      className="property-enquiry-button"
                      onClick={() => {
                        setShowEnquiryForm(true);
                        setEnquiryFeedback("");
                      }}
                    >
                      Contact Landlord / Agent
                    </button>
                  )}

                  {showEnquiryForm && !enquirySuccess && (
                    <form
                      className="property-enquiry-form"
                      onSubmit={sendEnquiry}
                    >
                      <label htmlFor="enquiry-subject">
                        Subject
                      </label>
                      <input
                        id="enquiry-subject"
                        type="text"
                        value={subject}
                        onChange={(event) => setSubject(event.target.value)}
                        placeholder="e.g. Property viewing"
                      />

                      <label htmlFor="enquiry-message">
                        Your message
                      </label>
                      <textarea
                        id="enquiry-message"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder="Hello, I am interested in this property. Please provide more information..."
                        rows={5}
                        required
                      />

                      {enquiryFeedback && (
                        <p className="property-enquiry-feedback">
                          {enquiryFeedback}
                        </p>
                      )}

                      <button
                        type="submit"
                        className="property-enquiry-button"
                        disabled={sending}
                      >
                        {sending ? "Sending..." : "Send Enquiry"}
                      </button>

                      <button
                        type="button"
                        className="property-enquiry-cancel"
                        onClick={() => {
                          setShowEnquiryForm(false);
                          setEnquiryFeedback("");
                        }}
                        disabled={sending}
                      >
                        Cancel
                      </button>

                      <p className="property-enquiry-note">
                        You must be logged in with a tenant account to send
                        an enquiry.
                        {" "}
                        <Link href="/login">Log in here</Link>.
                      </p>
                    </form>
                  )}

                  {enquirySuccess && (
                    <div className="property-enquiry-success">
                      <p>{enquiryFeedback}</p>
                      <Link
                        href="/tenant/dashboard"
                        className="property-enquiry-dashboard-link"
                      >
                        Go to tenant dashboard
                      </Link>
                    </div>
                  )}

                  {!showEnquiryForm && enquiryFeedback && !enquirySuccess && (
                    <p className="property-enquiry-feedback">
                      {enquiryFeedback}
                    </p>
                  )}
                </section>
              </section>
            </>
          ) : null}
        </div>
      </main>

      {viewerOpen && property && (
        <div
          className="property-lightbox"
          onClick={() => setViewerOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Full-screen property photo viewer"
        >
          <button
            type="button"
            className="property-lightbox-close"
            onClick={() => setViewerOpen(false)}
            aria-label="Close photo viewer"
          >
            &times;
          </button>

          {images.length > 1 && (
            <button
              type="button"
              className="property-lightbox-arrow left"
              onClick={(event) => {
                event.stopPropagation();
                showPreviousImage();
              }}
              aria-label="Previous photo"
            >
              &#10094;
            </button>
          )}

          <img
            src={images[activeImage]}
            alt={`${property.title} - Photo ${activeImage + 1}`}
            className="property-lightbox-image"
            onClick={(event) => event.stopPropagation()}
          />

          {images.length > 1 && (
            <button
              type="button"
              className="property-lightbox-arrow right"
              onClick={(event) => {
                event.stopPropagation();
                showNextImage();
              }}
              aria-label="Next photo"
            >
              &#10095;
            </button>
          )}

          <span className="property-lightbox-count">
            {activeImage + 1} / {images.length}
          </span>
        </div>
      )}

      <Footer />
    </>
  );
}
