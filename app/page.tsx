
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const states = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const features = [
  {
    number: "01",
    icon: "✓",
    title: "Verified properties",
    description:
      "We aim to verify agent identities, landlord mandates and property information before listings are trusted on the platform.",
  },
  {
    number: "02",
    icon: "₦",
    title: "Transparent pricing",
    description:
      "See rent, agency fees, legal fees and caution deposits together, so you understand the full move-in cost before proceeding.",
  },
  {
    number: "03",
    icon: "◇",
    title: "Fair allocation",
    description:
      "Where eligible applicants exceed available spaces, a pre-defined and auditable ballot can support fair selection.",
  },
  {
    number: "04",
    icon: "⌑",
    title: "Protected handover",
    description:
      "Our proposed escrow-backed process connects payment release with confirmed key handover.",
  },
];

const steps = [
  {
    number: "01",
    title: "Discover",
    description:
      "Explore rental properties across Nigeria and review their listing information.",
  },
  {
    number: "02",
    title: "Calculate",
    description:
      "Understand the complete move-in cost before making a commitment.",
  },
  {
    number: "03",
    title: "Apply fairly",
    description:
      "Follow the property's eligibility requirements and allocation process.",
  },
  {
    number: "04",
    title: "Move in with confidence",
    description:
      "Complete the agreed handover process and receive your keys.",
  },
];

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="hero-overlay" />

          <div className="hero-content">
            <div className="eyebrow hero-eyebrow">
              A BETTER WAY TO RENT IN NIGERIA
            </div>

            <h1>
              Find a home.
              <br />
              <span>Not another rental scam.</span>
            </h1>

            <p className="hero-description">
              Discover rental properties across Nigeria with
              clearer pricing, stronger verification and a
              safer path from application to key handover.
            </p>

            <div className="hero-actions">
              <Link href="/properties" className="button button-gold">
                Explore properties <span>↗</span>
              </Link>

              <Link href="/how-it-works" className="button button-outline">
                How TRP works
              </Link>
            </div>

            <div className="hero-note">
              <span className="status-dot" />
              Connecting renters, landlords and agents across Nigeria
            </div>
          </div>

          <div className="hero-bottom">
            <span>RENT WITH MORE CONFIDENCE</span>
            <span>BUILT FOR NIGERIA</span>
          </div>
        </section>

        {/* PROPERTY SEARCH */}
        <section className="search-section">
          <div className="search-heading">
            <div>
              <span className="eyebrow">START YOUR SEARCH</span>
              <h2>Find a place anywhere in Nigeria.</h2>
            </div>

            <p>
              Choose your preferred state, city, property type
              and budget.
            </p>
          </div>

          <form
            action="/properties"
            method="GET"
            className="search-box"
          >
            <label>
              State
              <select name="state" defaultValue="">
                <option value="">All Nigerian states</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
                <option value="FCT">Federal Capital Territory</option>
              </select>
            </label>

            <label>
              City or area
              <input
                type="text"
                name="location"
                placeholder="e.g. Ikeja, Wuse, Ibadan"
              />
            </label>

            <label>
              Property type
              <select name="type" defaultValue="">
                <option value="">Any property</option>
                <option value="Apartment">Apartment</option>
                <option value="House">Residential house</option>
                <option value="Shop">Commercial shop</option>
                <option value="Hostel">Student hostel</option>
              </select>
            </label>

            <label>
              Maximum budget
              <select name="budget" defaultValue="">
                <option value="">Any budget</option>
                <option value="500000">Up to ₦500,000</option>
                <option value="1000000">Up to ₦1,000,000</option>
                <option value="2000000">Up to ₦2,000,000</option>
                <option value="5000000">Up to ₦5,000,000</option>
                <option value="10000000">Up to ₦10,000,000</option>
              </select>
            </label>

            <button type="submit" className="search-button">
              Search properties <span>→</span>
            </button>
          </form>
        </section>

        {/* WHY TRP */}
        <section className="trust-section" id="about">
          <div className="section-intro">
            <span className="eyebrow">WHY TRP EXISTS</span>

            <h2>
              Renting shouldn't
              <br />
              feel like gambling.
            </h2>

            <p>
              Fake listings, unexpected charges and deposit
              fraud make finding a home unnecessarily stressful.
              TRP is designed to bring more transparency and
              accountability into the rental process across
              Nigeria.
            </p>

            <Link href="/how-it-works" className="text-link">
              Discover our approach <span>↗</span>
            </Link>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <article className="feature-card" key={feature.number}>
                <span className="feature-number">
                  {feature.number}
                </span>

                <div className="feature-icon">
                  {feature.icon}
                </div>

                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="process-section">
          <div className="process-heading">
            <span className="eyebrow">THE TRP EXPERIENCE</span>

            <h2>From property search to key handover.</h2>

            <p>
              A clearer rental journey, with trust built into
              each important step.
            </p>
          </div>

          <div className="steps-grid">
            {steps.map((step) => (
              <article className="step-card" key={step.number}>
                <span className="step-number">
                  {step.number}
                </span>

                <div className="step-line" />

                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* COST CALCULATOR */}
        <section className="calculator-section">
          <div className="calculator-copy">
            <span className="eyebrow">NO HIDDEN SURPRISES</span>

            <h2>
              Know the full cost
              <br />
              before you commit.
            </h2>

            <p>
              A ₦1.2 million rent should not suddenly become
              a ₦1.9 million move-in bill. TRP's proposed
              move-in calculator brings expected charges
              together upfront, helping renters understand
              what they are paying for.
            </p>

            <Link href="/calculator" className="button button-gold">
              Calculate move-in cost <span>→</span>
            </Link>
          </div>

          <div className="cost-card">
            <div className="cost-card-header">
              <div>
                <span className="eyebrow">MOVE-IN ESTIMATE</span>
                <h3>Cost breakdown</h3>
              </div>

              <span className="cost-tag">ILLUSTRATIVE</span>
            </div>

            <div className="cost-row">
              <span>Base rent</span>
              <strong>₦1,200,000</strong>
            </div>

            <div className="cost-row">
              <span>Legal fee</span>
              <strong>₦80,000</strong>
            </div>

            <div className="cost-row">
              <span>Agency fee</span>
              <strong>₦100,000</strong>
            </div>

            <div className="cost-row">
              <span>Caution deposit</span>
              <strong>₦40,000</strong>
            </div>

            <div className="cost-total">
              <span>Total move-in cost</span>
              <strong>₦1,420,000</strong>
            </div>

            <p className="cost-disclaimer">
              Example figures from the TRP proposal.
              Actual charges depend on the property and agreement.
            </p>
          </div>
        </section>

        {/* NATIONWIDE VISION */}
        <section className="launch-section">
          <span className="eyebrow">OUR VISION</span>

          <h2>Built for Nigeria. Designed to reach everywhere.</h2>

          <p>
            From Lagos to Abuja, Port Harcourt, Ibadan, Kano,
            Enugu and beyond, TRP aims to make renting safer,
            clearer and more transparent for people searching
            for homes, shops and student accommodation across
            the country.
          </p>

          <div className="location-pills">
            <span>Lagos</span>
            <span>Abuja</span>
            <span>Port Harcourt</span>
            <span>Ibadan</span>
            <span>Kano</span>
            <span>Enugu</span>
            <span>And beyond</span>
          </div>

          <p className="launch-note">
            Initial rollout: selected Lagos communities,
            followed by expansion into other Nigerian cities.
          </p>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section className="cta-section">
          <div>
            <span className="eyebrow">A BETTER RENTAL EXPERIENCE</span>

            <h2>
              It's time to make renting more trustworthy.
            </h2>

            <p>
              Wherever you are in Nigeria, finding a place
              to call home should come with more confidence.
            </p>
          </div>

          <Link href="/properties" className="button button-dark">
            Explore properties <span>↗</span>
          </Link>
        </section>
      </main>

      <Footer />
    </>
  );
}
