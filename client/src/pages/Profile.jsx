import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileForm from "../components/ProfileForm";
import { getProfile, updateProfile, clearToken } from "../lib/api";
import "./ViewProfile.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileAndListings();
  }, []);

  const fetchProfileAndListings = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setUser(data.user);
      
      const token = localStorage.getItem("token");
      const listingsRes = await fetch("http://localhost:5000/api/listings/my-listings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (listingsRes.ok) {
        const listingsData = await listingsRes.json();
        setListings(listingsData);
      }
    } catch (err) {
      setError(err.message || "Failed to load profile resources.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      setError("");
      const res = await updateProfile(formData);
      setUser(res.user);
      setSaveSuccess(true);
      setIsEditing(false); // Switch back to view mode instantly
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "Could not save your updates.");
    }
  };

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/listings/${listingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setListings(listings.filter((item) => item._id !== listingId));
      }
    } catch (err) {
      console.error("Failed to delete listing", err);
    }
  };

  if (loading) {
    return (
      <div className="view-profile-container">
        <div className="loading-spinner">Loading profile...</div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="view-profile-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="view-profile-container">
      {saveSuccess && (
        <div className="toast-notification-success">
          ✓ Profile changes saved successfully!
        </div>
      )}

      {isEditing ? (
        <div className="view-profile-card form-edit-mode">
          <button className="back-btn" onClick={() => setIsEditing(false)}>
            ← Cancel Editing
          </button>
          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <ProfileForm user={user} onSave={handleSave} />
          </div>
        </div>
      ) : (
        <div className="profile-dashboard-grid">
          {/* LEFT SIDEBAR: Personal Card */}
          <div className="view-profile-card sidebar-card">
            <div className="profile-header">
              <div className="profile-avatar-wrapper">
                {user?.photoUrl ? (
                  <img
                    src={`http://localhost:5000${user.photoUrl}`}
                    alt={user.name}
                    className="profile-desktop-avatar"
                  />
                ) : (
                  <div className="profile-avatar">
                    {user?.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                )}
              </div>
              <h1>{user?.name || "Skill Exchanger"}</h1>
              <p className="profile-email">{user?.email}</p>
            </div>

            <div className="profile-info">
              <div className="info-item">
                <span className="info-icon">📍</span>
                <div>
                  <span className="info-label">Location</span>
                  {/* Safely fallback to city/location interchangeably */}
                  <span className="info-value">{user?.location || user?.city || "Not specified"}</span>
                </div>
              </div>

              {user?.createdAt && (
                <div className="info-item">
                  <span className="info-icon">📅</span>
                  <div>
                    <span className="info-label">Member Since</span>
                    <span className="info-value">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              )}

              <div className="info-item bio-item">
                <span className="info-icon">📝</span>
                <div>
                  <span className="info-label">About Me</span>
                  <span className="info-value bio-text">
                    {user?.bio || "No bio added yet. Tell people what you're teaching or learning!"}
                  </span>
                </div>
              </div>
            </div>

            <div className="profile-actions-vertical">
              <button className="message-btn edit-action" onClick={() => setIsEditing(true)}>
                ⚙️ Edit Profile
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                🚪 Log Out
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: Interactive Listings Board */}
          <div className="view-profile-card main-content-card">
            <div className="content-header-row">
              <h2>My Active Listings ({listings.length})</h2>
              <button className="add-listing-btn" onClick={() => navigate("/create-listing")}>
                + Create Listing
              </button>
            </div>

            {listings.length === 0 ? (
              <div className="empty-listings-box">
                <p>You haven't posted any skills to swap yet.</p>
                <button className="accent-link" onClick={() => navigate("/create-listing")}>
                  Create your first listing now
                </button>
              </div>
            ) : (
              <div className="user-listings-grid-layout">
                {listings.map((listing) => (
                  <div key={listing._id} className="user-listing-desktop-item">
                    <div className="listing-info-col">
                      <h4>{listing.title}</h4>
                      <p className="listing-desc">{listing.description}</p>
                      <div className="listing-badges">
                        <span className="badge offer">Offers: {listing.offerSkill}</span>
                        <span className="badge seek">Wants: {listing.seekSkill}</span>
                      </div>
                    </div>
                    <button 
                      className="listing-delete-btn" 
                      onClick={() => handleDeleteListing(listing._id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}