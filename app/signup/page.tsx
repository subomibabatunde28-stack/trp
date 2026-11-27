
"use client";

import { useState, type FormEvent } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { supabase } from "@/lib/supabase";

type AccountType = "tenant" | "landlord" | "agent";

const states = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa",
  "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo",
  "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano",
  "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
  "Sokoto", "Taraba", "Yobe", "Zamfara", "Federal Capital Territory",
];

export default function SignupPage() {
  const [accountType, setAccountType] = useState<AccountType>("landlord");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const fullName = String(form.get("fullName") || "").trim();
    const email = String(form.get("email") || "").trim().toLowerCase();
    const phone = String(form.get("phone") || "").trim();
    const password = String(form.get("password") || "");
    const state = String(form.get("state") || "");
    const agencyName = String(form.get("agency") || "").trim();

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            account_type: accountType,
            agency_name: accountType === "agent" ? agencyName : null,
            state,
          },
        },
      });

      if (signupError) {
        throw signupError;
      }

      if (data.session) {
        setMessage(
          "Your account has been created successfully! Your TRP profile is awaiting verification."
        );
      } else {
        setMessage(
          "Registration received! Please check your email for a confirmation link. Your profile will be created and marked pending when Supabase confirms your account."
        );
      }

      formElement.reset();
      setAccountType("landlord");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="signup-page">
        <section className="signup-shell">
          <div className="signup-intro">
            <span className="signup-eyebrow">JOIN THE TRP NETWORK</span>

            <h1>
              {accountType === "tenant" ? (
                <>
                  Find your place.
                  <br />
                  Rent with confidence.
                </>
              ) : (
                <>
                  Build trust.
                  <br />
                  Rent with confidence.
                </>
              )}
            </h1>

            <p>
              {accountType === "tenant"
                ? "Join TRP as a tenant. Discover rental properties, connect with landlords and agents, and make more informed rental decisions."
                : "Join TRP as a landlord or property agent. Submit your details and take the first step towards listing properties on a platform built around transparency and trust."}
            </p>

            <div className="signup-points">
              <div>
                <span>01</span>
                <p>
                  <strong>
                    {accountType === "tenant"
                      ? "Create your account"
                      : "Create your account"}
                  </strong>{" "}
                  with your correct details.
                </p>
              </div>

              <div>
                <span>02</span>
                <p>
                  <strong>
                    {accountType === "tenant"
                      ? "Explore properties"
                      : "Complete verification"}
                  </strong>{" "}
                  {accountType === "tenant"
                    ? "and find a place that suits you."
                    : "by providing the required documents."}
                </p>
              </div>

              <div>
                <span>03</span>
                <p>
                  <strong>
                    {accountType === "tenant"
                      ? "Connect with property owners"
                      : "Submit properties"}
                  </strong>{" "}
                  {accountType === "tenant"
                    ? "to make rental enquiries."
                    : "for TRP review and approval."}
                </p>
              </div>
            </div>

            <div className="signup-trust-note">
              <span className="signup-trust-icon">✓</span>
              <p>
                Registration does not automatically verify an account or
                approve a property. Every submission will go through review.
              </p>
            </div>
          </div>

          <div className="signup-form-card">
            <div className="signup-form-heading">
              <span className="signup-eyebrow">GET STARTED</span>
              <h2>Create your account</h2>
              <p>First, tell us how you want to use TRP.</p>
            </div>

            <div className="account-type-options">
              <button
                type="button"
                className={`account-type-option ${
                  accountType === "tenant" ? "selected" : ""
                }`}
                onClick={() => {
                  setAccountType("tenant");
                  setMessage("");
                  setError("");
                }}
              >
                <span className="account-type-symbol">⌂</span>
                <span>
                  <strong>I'm a tenant</strong>
                  <small>I'm looking for a property</small>
                </span>
                <span className="account-type-check">
                  {accountType === "tenant" ? "✓" : ""}
                </span>
              </button>

              <button
                type="button"
                className={`account-type-option ${
                  accountType === "landlord" ? "selected" : ""
                }`}
                onClick={() => {
                  setAccountType("landlord");
                  setMessage("");
                  setError("");
                }}
              >
                <span className="account-type-symbol">⌂</span>
                <span>
                  <strong>I'm a landlord</strong>
                  <small>I own a property</small>
                </span>
                <span className="account-type-check">
                  {accountType === "landlord" ? "✓" : ""}
                </span>
              </button>

              <button
                type="button"
                className={`account-type-option ${
                  accountType === "agent" ? "selected" : ""
                }`}
                onClick={() => {
                  setAccountType("agent");
                  setMessage("");
                  setError("");
                }}
              >
                <span className="account-type-symbol">▤</span>
                <span>
                  <strong>I'm an agent</strong>
                  <small>I represent property owners</small>
                </span>
                <span className="account-type-check">
                  {accountType === "agent" ? "✓" : ""}
                </span>
              </button>
            </div>

            <form className="signup-form" onSubmit={handleSubmit}>
              <div className="signup-field">
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="signup-field">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="signup-field">
                <label htmlFor="phone">Phone number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="e.g. 08012345678"
                  autoComplete="tel"
                  required
                />
              </div>

              {accountType === "agent" && (
                <div className="signup-field">
                  <label htmlFor="agency">Agency or business name</label>
                  <input
                    id="agency"
                    name="agency"
                    type="text"
                    placeholder="Enter your agency name"
                    required
                  />
                </div>
              )}

              <div className="signup-field">
                <label htmlFor="state">
                  {accountType === "tenant"
                    ? "State you're looking to rent in"
                    : "Primary state of operation"}
                </label>
                <select
                  id="state"
                  name="state"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select a state
                  </option>
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div className="signup-field">
                <label htmlFor="password">Create password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>

              <label className="signup-terms">
                <input type="checkbox" required />
                <span>
                  I confirm that the information provided is accurate and
                  agree to TRP's registration and verification process.
                </span>
              </label>

              <button
                className="signup-submit"
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create account"}
                {!loading && <span>→</span>}
              </button>

              {message && (
                <div className="signup-message" role="status">
                  {message}
                </div>
              )}

              {error && (
                <div className="signup-message" role="alert">
                  {error}
                </div>
              )}
            </form>

            <p className="signup-login-note">
              Already have an account? <a href="/login">Log in</a>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
