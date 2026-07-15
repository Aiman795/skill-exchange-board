import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getToken } from "../lib/api";
import "./ViewProfile.css";

const ViewProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
    // location.key changes on every navigation (even to the same path),
    // so this forces a refetch after you navigate back from the edit form.
  }, [userId, location.key]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("📡 Fetching profile for userId:", userId);

      const token = getToken();
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Calls GET /api/users/:userId
      const response = await fetch(
        `http://localhost:5000/api/users/${userId}`,
        {
          headers,
        }
      );

      const data = await response.json();
      console.log("📡 Profile response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch profile");
      }

      setProfile(data);
    } catch (err) {
      console.error("❌ Error fetching profile:", err);
      setError(err.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="view-profile-container">
        <div className="loading-spinner">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-profile-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="view-profile-container">
        <div className="error-message">User not found</div>
      </div>
    );
  }

  // Determine fallback values dynamically based on what the API returned
  const userLocation = profile.location || profile.city || "Not specified";

  // Cache-bust the photo URL so an updated image actually replaces the old one
  // in the browser cache instead of showing the stale cached version.
  const userPhoto = profile.photoUrl
    ? `http://localhost:5000${profile.photoUrl}?t=${Date.now()}`
    : null;

  return (
    <div className="view-profile-container">
      <div className="view-profile-card">
        {/* Back Button to easily go back to previous desktop pages */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="profile-header">
          {/* Renders circular profile photo if available, otherwise falls back to Initial letters */}
          <div className="profile-avatar-wrapper" style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            {userPhoto ? (
              <img
                src={userPhoto}
                alt={profile.name}
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
                }}
              />
            ) : (
              <div className="profile-avatar">
                {profile.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>
          <h1>{profile.name || "Unknown User"}</h1>
          <p className="profile-email">{profile.email}</p>
        </div>

        <div className="profile-info">
          <div className="info-item">
            <span className="info-icon">📍</span>
            <div>
              <span className="info-label">Location</span>
              <span className="info-value">{userLocation}</span>
            </div>
          </div>

          <div className="info-item">
            <span className="info-icon">📅</span>
            <div>
              <span className="info-label">Member Since</span>
              <span className="info-value">
                {new Date(profile.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {profile.bio && (
            <div className="info-item bio-item">
              <span className="info-icon">📝</span>
              <div>
                <span className="info-label">About</span>
                <span className="info-value bio-text">{profile.bio}</span>
              </div>
            </div>
          )}
        </div>

        <div className="profile-actions">
          <button
            className="message-btn"
            onClick={() => alert("Chat feature coming soon!")}
          >
            💬 Send Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;