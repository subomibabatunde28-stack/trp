
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="navbar">
      <Link href="/" className="brand">
        <span className="brand-mark">T</span>
        <span>
          TRP
          <small>TRUSTED RENTAL PROPERTY</small>
        </span>
      </Link>

      <nav className="nav-links">
        <Link href="/">Home</Link>
        <Link href="/properties">Properties</Link>
        <Link href="/verified-properties">Verified Listings</Link>
        <Link href="/how-it-works">How it works</Link>
        <Link href="/about">About</Link>
      </nav>

      <div className="nav-actions">
        <Link href="/login" className="login-link">
          Log in
        </Link>
        <Link href="/signup" className="nav-button">
          Get started
        </Link>
      </div>
    </header>
  );
}
