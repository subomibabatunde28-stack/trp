
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const values = [
  {
    number: "01",
    title: "Transparency",
    description:
      "We believe renters deserve clear property information, honest pricing and a better understanding of every cost before making a commitment.",
  },
  {
    number: "02",
    title: "Trust",
    description:
      "We are building a platform that encourages accountability through identity checks, property reviews and a more organised rental process.",
  },
  {
    number: "03",
    title: "Fairness",
    description:
      "We want rental opportunities to be handled more fairly, with transparent processes that reduce unnecessary uncertainty.",
  },
  {
    number: "04",
    title: "Security",
    description:
      "We aim to make rental transactions safer through structured processes, documented agreements and a more accountable handover experience.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="about-page">
        <section className="about-hero">
          <div className="about-hero-content">
            <span className="about-eyebrow">ABOUT TRP</span>

            <h1>
              Renting should feel like a decision.
              <span> Not a gamble.</span>
            </h1>

            <p>
              TRP — Trusted Rental Property — is a platform being developed
              to make renting in Nigeria more transparent, organised and
              trustworthy for tenants, landlords and property agents.
            </p>

            <Link href="/properties" className="about-primary-button">
              Explore properties <span>→</span>
            </Link>
          </div>

          <div className="about-hero-visual">
            <div className="about-visual-card">
              <span className="about-card-label">OUR BELIEF</span>
              <div className="about-visual-mark">TRP</div>
              <h2>A better rental experience starts with trust.</h2>
              <div className="about-card-line" />
              <p>Transparency. Accountability. Fairness.</p>
            </div>
          </div>
        </section>

        <section className="about-story">
          <div className="about-section-heading">
            <span className="about-eyebrow">WHY WE EXIST</span>
            <h2>Changing the way people experience renting.</h2>
          </div>

          <div className="about-story-content">
            <p>
              Finding a place to live should be an exciting step, but for
              many people in Nigeria, renting can involve uncertainty,
              unexpected charges, questionable listings and difficulty
              knowing who to trust.
            </p>

            <p>
              TRP was created around a simple idea: people deserve a clearer
              and more reliable way to navigate the rental process.
            </p>

            <p>
              We are developing a platform that brings property discovery,
              clearer cost information, account review and structured rental
              processes together in one place.
            </p>
          </div>
        </section>

        <section className="about-mission">
          <article className="about-mission-card">
            <span className="about-eyebrow">OUR MISSION</span>
            <h2>Make renting more transparent and trustworthy.</h2>
            <p>
              Our mission is to improve the rental experience by helping
              people access clearer property information, understand
              expected costs and engage through more accountable processes.
            </p>
          </article>

          <article className="about-vision-card">
            <span className="about-eyebrow">OUR VISION</span>
            <h2>A rental market where trust comes first.</h2>
            <p>
              We envision a Nigeria where finding and securing a home is
              clearer, fairer and less stressful for everyone involved.
            </p>
          </article>
        </section>

        <section className="about-values">
          <div className="about-values-heading">
            <span className="about-eyebrow">WHAT GUIDES US</span>
            <h2>The values behind TRP.</h2>
            <p>
              Every part of the platform is guided by the principles we
              believe should define a better rental experience.
            </p>
          </div>

          <div className="about-values-grid">
            {values.map((value) => (
              <article className="about-value-card" key={value.number}>
                <span>{value.number}</span>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-nigeria">
          <div>
            <span className="about-eyebrow">OUR REACH</span>
            <h2>Built with Nigeria in mind.</h2>
          </div>

          <div>
            <p>
              TRP is designed with the Nigerian rental market in mind.
              While our initial rollout focuses on selected areas, our
              long-term goal is to expand access and build a more trusted
              rental experience across all 36 states and the Federal
              Capital Territory.
            </p>
          </div>
        </section>

        <section className="about-cta">
          <span className="about-eyebrow">BE PART OF THE CHANGE</span>
          <h2>Let's build a more trusted way to rent.</h2>
          <p>
            Whether you are a tenant, landlord or property agent, TRP is
            working towards a better rental experience for everyone.
          </p>

          <div className="about-cta-actions">
            <Link href="/signup" className="about-primary-button">
              Join TRP <span>→</span>
            </Link>

            <Link href="/how-it-works" className="about-secondary-button">
              See how it works
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
