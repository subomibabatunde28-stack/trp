
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

      if (loginError) throw loginError;

      if (!data.user) {
        throw new Error("Unable to verify your account.");
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", data.user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.account_type === "tenant") {
        router.replace("/tenant/dashboard");
      } else if (profile.account_type === "agent") {
        router.replace("/agent/dashboard");
      } else if (profile.account_type === "landlord") {
        router.replace("/dashboard");
      } else {
        throw new Error("Your account type could not be recognised.");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="trp-login-page">
        <div className="trp-login-container">
          <section className="trp-login-intro">
            <span className="trp-login-eyebrow">
              TRUSTED RENTAL PROPERTY
            </span>

            <h1>
              Renting should feel like <span>trust.</span>
            </h1>

            <p>
              Welcome back to TRP. Access your account and continue
              towards a safer, clearer and more transparent rental
              experience.
            </p>

            <div className="trp-login-benefits">
              <div>
                <span>01</span>
                <p>
                  <strong>Verified identities</strong>
                  <small>Build confidence in who you rent from.</small>
                </p>
              </div>

              <div>
                <span>02</span>
                <p>
                  <strong>Transparent costs</strong>
                  <small>Know what to expect before moving in.</small>
                </p>
              </div>

              <div>
                <span>03</span>
                <p>
                  <strong>One trusted platform</strong>
                  <small>Manage your rental activities with TRP.</small>
                </p>
              </div>
            </div>

            <div className="trp-login-note">
              <span>✓</span>
              <p>
                Your account is personal. Your verification status
                is managed separately.
              </p>
            </div>
          </section>

          <section className="trp-login-card">
            <div className="trp-login-card-heading">
              <span className="trp-login-eyebrow">ACCOUNT ACCESS</span>
              <h2>Welcome back</h2>
              <p>Sign in to your TRP account.</p>
            </div>

            <form onSubmit={handleSubmit} className="trp-login-form">
              <div className="trp-login-field">
                <label htmlFor="login-email">Email address</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email address"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="trp-login-field">
                <label htmlFor="login-password">Password</label>

                <div className="trp-password-wrapper">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />

                  <button
                    type="button"
                    className="trp-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="trp-login-error" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="trp-login-submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in to TRP"}
                {!loading && <span>→</span>}
              </button>
            </form>

            <div className="trp-login-divider">
              <span>NEW TO TRP?</span>
            </div>

            <p className="trp-login-register">
              Don't have an account?
              <Link href="/signup"> Create an account</Link>
            </p>

            <p className="trp-login-security">
              Your information is protected by your TRP account
              authentication.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
