
"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { supabase } from "@/lib/supabase";

const states = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi",
  "Bayelsa", "Benue", "Borno", "Cross River", "Delta",
  "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
  "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger",
  "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
  "Federal Capital Territory"
];

const MAX_PHOTOS = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function AddPropertyPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    property_type: "",
    state: "",
    city: "",
    area: "",
    bedrooms: "1",
    bathrooms: "1",
    rent_amount: "",
    payment_period: "yearly",
    additional_costs: "0",
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const urls = selectedImages.map((file) =>
      URL.createObjectURL(file)
    );

    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedImages]);

  function updateField(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    setError("");

    const files = Array.from(event.target.files || []);

    if (selectedImages.length + files.length > MAX_PHOTOS) {
      setError(`You can upload a maximum of ${MAX_PHOTOS} photos.`);
      event.target.value = "";
      return;
    }

    const invalidFile = files.find(
      (file) => !file.type.startsWith("image/")
    );

    if (invalidFile) {
      setError("Please select image files only.");
      event.target.value = "";
      return;
    }

    const oversizedFile = files.find(
      (file) => file.size > MAX_FILE_SIZE
    );

    if (oversizedFile) {
      setError("Each photo must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setSelectedImages((previous) => [...previous, ...files]);
    event.target.value = "";
  }

  function removeImage(index: number) {
    setSelectedImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index)
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    let propertyId = "";
    let propertyCreated = false;
    const uploadedPaths: string[] = [];

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.push("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (
        profile.account_type !== "landlord" &&
        profile.account_type !== "agent"
      ) {
        throw new Error(
          "Only landlords and agents can submit properties."
        );
      }

      propertyId = crypto.randomUUID();

      const { error: insertError } = await supabase
        .from("properties")
        .insert({
          id: propertyId,
          owner_id: user.id,
          title: form.title.trim(),
          description: form.description.trim(),
          property_type: form.property_type,
          state: form.state,
          city: form.city.trim(),
          area: form.area.trim(),
          bedrooms: Number(form.bedrooms),
          bathrooms: Number(form.bathrooms),
          rent_amount: Number(form.rent_amount),
          payment_period: form.payment_period,
          additional_costs: Number(form.additional_costs),
          image_urls: [],
          status: "pending",
        });

      if (insertError) throw insertError;

      propertyCreated = true;

      const imageUrls: string[] = [];

      for (let index = 0; index < selectedImages.length; index++) {
        const file = selectedImages[index];

        const fileExtension =
          file.name.split(".").pop()?.toLowerCase() || "jpg";

        const filePath =
          `${user.id}/${propertyId}/${crypto.randomUUID()}.${fileExtension}`;

        const { error: uploadError } = await supabase.storage
          .from("property-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

        if (uploadError) throw uploadError;

        uploadedPaths.push(filePath);

        const { data: publicUrlData } = supabase.storage
          .from("property-images")
          .getPublicUrl(filePath);

        imageUrls.push(publicUrlData.publicUrl);
      }

      const { error: updateError } = await supabase
        .from("properties")
        .update({ image_urls: imageUrls })
        .eq("id", propertyId)
        .eq("owner_id", user.id);

      if (updateError) throw updateError;

      setSuccess(
        "Your property and photos have been submitted for verification."
      );

      setTimeout(() => {
        router.push("/dashboard");
      }, 1800);
    } catch (err: unknown) {
      console.error("Property submission error:", err);

      // Clean up uploaded files and the pending record if submission fails.
      if (uploadedPaths.length > 0) {
        await supabase.storage
          .from("property-images")
          .remove(uploadedPaths);
      }

      if (propertyCreated && propertyId) {
        await supabase
          .from("properties")
          .delete()
          .eq("id", propertyId);
      }

      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your property. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="add-property-page">
        <div className="add-property-container">
          <div className="add-property-heading">
            <span>TRP PROPERTY MANAGEMENT</span>
            <h1>List your property</h1>
            <p>
              Provide accurate information about your rental property.
              Your listing will be reviewed before approval.
            </p>
          </div>

          <form className="add-property-form" onSubmit={handleSubmit}>
            <section className="property-form-section">
              <h2>Property information</h2>

              <div className="property-form-field">
                <label htmlFor="title">Property title</label>
                <input
                  id="title"
                  name="title"
                  placeholder="e.g. Spacious 3-bedroom apartment"
                  value={form.title}
                  onChange={updateField}
                  required
                />
              </div>

              <div className="property-form-field">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe the property and its features..."
                  rows={5}
                  value={form.description}
                  onChange={updateField}
                  required
                />
              </div>

              <div className="property-form-field">
                <label htmlFor="property_type">Property type</label>
                <select
                  id="property_type"
                  name="property_type"
                  value={form.property_type}
                  onChange={updateField}
                  required
                >
                  <option value="">Select property type</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Flat">Flat</option>
                  <option value="Detached house">Detached house</option>
                  <option value="Duplex">Duplex</option>
                  <option value="Bungalow">Bungalow</option>
                  <option value="Self-contained">Self-contained</option>
                  <option value="Room">Single room</option>
                  <option value="Terraced house">Terraced house</option>
                </select>
              </div>
            </section>

            <section className="property-form-section">
              <h2>Property photos</h2>
              <p className="property-photo-description">
                Upload clear photos of the property. You can select up to
                six images, with a maximum size of 5 MB each.
              </p>

              <label
                htmlFor="property-images"
                className="property-photo-upload"
              >
                <span className="property-photo-upload-icon">+</span>
                <strong>Add property photos</strong>
                <span>Choose images from your device</span>
                <input
                  id="property-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={selectedImages.length >= MAX_PHOTOS}
                />
              </label>

              <p className="property-photo-count">
                {selectedImages.length} of {MAX_PHOTOS} photos selected
              </p>

              {previewUrls.length > 0 && (
                <div className="property-photo-preview-grid">
                  {previewUrls.map((url, index) => (
                    <div className="property-photo-preview" key={url}>
                      <img
                        src={url}
                        alt={`Property preview ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        aria-label={`Remove photo ${index + 1}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="property-form-section">
              <h2>Property location</h2>

              <div className="property-form-grid">
                <div className="property-form-field">
                  <label htmlFor="state">State</label>
                  <select
                    id="state"
                    name="state"
                    value={form.state}
                    onChange={updateField}
                    required
                  >
                    <option value="">Select state</option>
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="property-form-field">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    name="city"
                    placeholder="e.g. Ikeja"
                    value={form.city}
                    onChange={updateField}
                    required
                  />
                </div>

                <div className="property-form-field property-full-width">
                  <label htmlFor="area">Area or neighbourhood</label>
                  <input
                    id="area"
                    name="area"
                    placeholder="e.g. Allen Avenue"
                    value={form.area}
                    onChange={updateField}
                    required
                  />
                </div>
              </div>
            </section>

            <section className="property-form-section">
              <h2>Property details</h2>

              <div className="property-form-grid">
                <div className="property-form-field">
                  <label htmlFor="bedrooms">Bedrooms</label>
                  <input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    min="0"
                    max="100"
                    value={form.bedrooms}
                    onChange={updateField}
                    required
                  />
                </div>

                <div className="property-form-field">
                  <label htmlFor="bathrooms">Bathrooms</label>
                  <input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    min="0"
                    max="100"
                    value={form.bathrooms}
                    onChange={updateField}
                    required
                  />
                </div>
              </div>
            </section>

            <section className="property-form-section">
              <h2>Rental pricing</h2>

              <div className="property-form-grid">
                <div className="property-form-field">
                  <label htmlFor="rent_amount">Rent amount (₦)</label>
                  <input
                    id="rent_amount"
                    name="rent_amount"
                    type="number"
                    min="1"
                    placeholder="e.g. 1500000"
                    value={form.rent_amount}
                    onChange={updateField}
                    required
                  />
                </div>

                <div className="property-form-field">
                  <label htmlFor="payment_period">Payment period</label>
                  <select
                    id="payment_period"
                    name="payment_period"
                    value={form.payment_period}
                    onChange={updateField}
                  >
                    <option value="yearly">Yearly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="property-form-field property-full-width">
                  <label htmlFor="additional_costs">
                    Additional costs (₦)
                  </label>
                  <input
                    id="additional_costs"
                    name="additional_costs"
                    type="number"
                    min="0"
                    placeholder="e.g. 200000"
                    value={form.additional_costs}
                    onChange={updateField}
                    required
                  />
                  <small>
                    Include known agency, legal or other move-in fees.
                  </small>
                </div>
              </div>
            </section>

            <div className="property-pending-note">
              <strong>Verification notice</strong>
              <p>
                Your property will remain pending until TRP reviews
                the submitted information. Submission does not mean
                the property has been verified.
              </p>
            </div>

            {error && (
              <div className="property-form-error" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="property-form-success" role="status">
                {success}
              </div>
            )}

            <button
              type="submit"
              className="property-submit-button"
              disabled={loading}
            >
              {loading ? "Submitting property..." : "Submit property"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}
