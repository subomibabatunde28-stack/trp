
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <Link href="/" className="brand footer-brand">
            <span className="brand-mark">T</span>
            <span>
              TRP
              <small>TRUSTED RENTAL PROPERTY</small>
            </span>
          </Link>

          <p>
            Making renting safer, clearer and more predictable
            for everyone across Nigeria.
          </p>
        </div>

        <div className="footer-links">
          <div>
            <strong>Explore</strong>
            <Link href="/properties">Properties</Link>
            <Link href="/how-it-works">How it works</Link>
          </div>

          <div>
            <strong>Platform</strong>
            <Link href="/calculator">Move-in calculator</Link>
            <Link href="/dashboard">My dashboard</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 TRP. All rights reserved.</span>
        <span>Built around trust and transparency.</span>
      </div>
    </footer>
  );
}
