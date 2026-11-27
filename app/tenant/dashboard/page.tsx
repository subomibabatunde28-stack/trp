
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { supabase } from "@/lib/supabase";

export default function TenantDashboard() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTenant() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, account_type")
        .eq("id", user.id)
        .single();

      if (profileError || profile?.account_type !== "tenant") {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      setFullName(profile.full_name || "Tenant");
      setLoading(false);
    }

    loadTenant();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <>
      <Navbar />

      <main className="tenant-dashboard">
        <div className="tenant-dashboard-container">
          {loading ? (
            <div className="tenant-loading">Loading your dashboard...</div>
          ) : (
            <>
              <section className="tenant-welcome">
                <div>
                  <span className="tenant-eyebrow">TENANT DASHBOARD</span>
                  <h1>Welcome back, {fullName}.</h1>
                  <p>
                    Your next home starts with the right information.
                    Explore properties and manage your rental journey with TRP.
                  </p>
                </div>

                <button
                  type="button"
                  className="tenant-logout"
                  onClick={handleLogout}
                >
                  Sign out
                </button>
              </section>

              <section className="tenant-dashboard-grid">
                <Link
                  href="/properties"
                  className="tenant-dashboard-card tenant-primary-card"
                >
                  <span className="tenant-card-number">01</span>
                  <h2>Browse properties</h2>
                  <p>
                    Explore available rental properties across Nigeria.
                  </p>
                  <span className="tenant-card-link">
                    Explore properties →
                  </span>
                </Link>

                <div className="tenant-dashboard-card">
                  <span className="tenant-card-number">02</span>
                  <h2>My enquiries</h2>
                  <p>
                    Your property enquiries and conversations will appear here.
                  </p>
                  <span className="tenant-card-status">Coming next</span>
                </div>

                <div className="tenant-dashboard-card">
                  <span className="tenant-card-number">03</span>
                  <h2>Saved properties</h2>
                  <p>
                    Keep track of properties you are interested in.
                  </p>
                  <span className="tenant-card-status">Coming next</span>
                </div>
              </section>

              <section className="tenant-dashboard-note">
                <h2>Rent with more confidence.</h2>
                <p>
                  Take time to review property details and ask questions
                  before making rental decisions.
                </p>
                <Link href="/properties">Find a property →</Link>
              </section>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
