import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getToken } from "../lib/api";
import "./ViewProfile.css";

const ViewProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

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

      // 👇 This will call GET /api/users/:userId
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

  return (
    <div className="view-profile-container">
      <div className="view-profile-card">
        <div className="profile-header">
          <div className="profile-avatar">{profile.name?.charAt(0) || "U"}</div>
          <h1>{profile.name || "Unknown User"}</h1>
          <p className="profile-email">{profile.email}</p>
        </div>

        <div className="profile-info">
          <div className="info-item">
            <span className="info-icon">📍</span>
            <div>
              <span className="info-label">Location</span>
              <span className="info-value">
                {profile.city || "Not specified"}
              </span>
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
