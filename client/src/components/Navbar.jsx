import { Link, useNavigate } from "react-router-dom";
import { getToken, clearToken } from "../lib/api";
import "./Navbar.css"; // We will create this simple, clean stylesheet next!

function ExchangeMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="brand-logo-svg">
      {/* Path 1: Styled with accent color */}
      <path d="M6 10h13l-3.5-3.5" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Path 2: Dynamically adapt to text color with a lighter fallback */}
      <path d="M22 18H9l3.5 3.5" stroke="var(--text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
    </svg>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!getToken();

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand">
          <ExchangeMark />
          <span className="brand-name">Skill Exchange</span>
        </Link>

        {/* Navigation Links */}
        <div className="navbar-links">
          {isLoggedIn ? (
            <>
              <Link to="/browse" className="nav-link">
                Browse
              </Link>
              <Link to="/my-matches" className="nav-link">
                My Matches
              </Link>
              <Link to="/create-listing" className="nav-link">
                Create Listing
              </Link>
              <Link to="/my-listings" className="nav-link">
                My Listings
              </Link>
              <Link to="/profile" className="nav-link nav-link-profile">
                Profile
              </Link>
              <button onClick={handleLogout} className="nav-btn-logout">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Log in
              </Link>
              <Link to="/signup" className="nav-btn-signup">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}