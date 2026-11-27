
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const steps = [
  {
    number: "01",
    title: "Create your account",
    description:
      "Sign up as a renter, landlord or property agent. TRP introduces identity verification to help build confidence between everyone involved in a rental transaction.",
    tag: "Identity and trust",
  },
  {
    number: "02",
    title: "Discover verified properties",
    description:
      "Explore rental listings with property details, locations and transparent information. Properties are reviewed before receiving verified status.",
    tag: "Verified listings",
  },
  {
    number: "03",
    title: "Understand the full cost",
    description:
      "Review rent and additional move-in expenses before making a decision. TRP is designed to make hidden charges easier to identify and understand.",
    tag: "Cost transparency",
  },
  {
    number: "04",
    title: "Apply for a property",
    description:
      "Choose a property that suits your needs and submit your application through the platform. Your application becomes part of a more organised rental process.",
    tag: "Fair applications",
  },
  {
    number: "05",
    title: "Fair property allocation",
    description:
      "Where eligible applicants exceed available supply, TRP proposes a fair ballot process to reduce arbitrary selection and improve transparency.",
    tag: "Fair allocation",
  },
  {
    number: "06",
    title: "Complete a trusted handover",
    description:
      "TRP's proposed handover process uses a secure payment arrangement and documented key handover to help protect both renters and property owners.",
    tag: "Secure handover",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />

      <main className="how-page">
        <section className="how-hero">
          <div className="how-hero-content">
            <span className="how-eyebrow">
              THE TRP PROCESS
            </span>

            <h1>
              A better way to rent.
              <span> Built around trust.</span>
            </h1>

            <p>
              Renting a property should not feel like a gamble.
              TRP is designed to make the rental journey clearer,
              fairer and more transparent for people across Nigeria.
            </p>

            <Link href="/properties" className="how-primary-button">
              Explore properties <span>→</span>
            </Link>
          </div>

          <div className="how-hero-visual">
            <div className="how-visual-card">
              <span className="how-visual-label">
                THE TRP PROMISE
              </span>
              <div className="how-visual-symbol">T</div>
              <h2>Trust at every step.</h2>
              <p>
                From the first search to the final key handover.
              </p>
              <div className="how-visual-line">
                <span>Transparency</span>
                <span>Fairness</span>
                <span>Security</span>
              </div>
            </div>
          </div>
        </section>

        <section className="how-intro">
          <span className="how-eyebrow">HOW IT WORKS</span>
          <h2>Six steps towards a better rental experience.</h2>
          <p>
            TRP brings important parts of the rental journey
            together in one organised process.
          </p>
        </section>

        <section className="how-steps">
          {steps.map((step, index) => (
            <article className="how-step" key={step.number}>
              <div className="how-step-number">
                {step.number}
              </div>

              <div className="how-step-content">
                <span className="how-step-tag">
                  {step.tag}
                </span>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>

              <div className="how-step-arrow">
                {index === steps.length - 1 ? "✓" : "→"}
              </div>
            </article>
          ))}
        </section>

        <section className="how-values">
          <div>
            <span className="how-eyebrow">WHY TRP?</span>
            <h2>Renting deserves more trust.</h2>
            <p>
              TRP is being developed to address uncertainty,
              hidden charges, questionable listings and unfair
              rental practices.
            </p>
          </div>

          <div className="how-value-grid">
            <article>
              <span>01</span>
              <h3>Transparency</h3>
              <p>Clearer property information and rental costs.</p>
            </article>

            <article>
              <span>02</span>
              <h3>Accountability</h3>
              <p>Greater confidence through identity and property checks.</p>
            </article>

            <article>
              <span>03</span>
              <h3>Fairness</h3>
              <p>A proposed allocation process for oversubscribed properties.</p>
            </article>

            <article>
              <span>04</span>
              <h3>Security</h3>
              <p>A planned, documented and protected handover process.</p>
            </article>
          </div>
        </section>

        <section className="how-cta">
          <span className="how-eyebrow">YOUR NEXT MOVE</span>
          <h2>Ready for a more trusted rental experience?</h2>
          <p>
            Join TRP as we work towards making renting safer,
            clearer and more predictable across Nigeria.
          </p>

          <div className="how-cta-actions">
            <Link href="/signup" className="how-primary-button">
              Get started <span>→</span>
            </Link>

            <Link href="/properties" className="how-secondary-button">
              Browse properties
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
