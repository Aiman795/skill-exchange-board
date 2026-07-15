import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./MyMatches.css";

const MyMatches = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const listingId = searchParams.get("listing");

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMatches();
  }, [listingId]);

  const fetchMatches = async () => {
    setLoading(true);
    setError("");
    try {
      let url = "/matches/my-matches";
      if (listingId) {
        url = `/matches/listing/${listingId}`;
      }

      console.log("📡 Fetching matches from:", url);
      const response = await api.get(url);
      console.log("📡 API Response:", response.data);

      let matchesData = [];
      if (response.data && response.data.matches) {
        matchesData = response.data.matches;
      }

      console.log("📊 Matches data:", matchesData);
      setMatches(matchesData);
    } catch (err) {
      console.error("❌ Error fetching matches:", err);
      setError(err.message || "Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  };

  const getMatchLevel = (score) => {
    if (score >= 80)
      return { level: "Excellent", color: "#4CAF50", icon: "🌟" };
    if (score >= 60) return { level: "Good", color: "#FF9800", icon: "⭐" };
    if (score >= 40) return { level: "Fair", color: "#2196F3", icon: "💡" };
    return { level: "Possible", color: "#9E9E9E", icon: "🔍" };
  };

  // Handle view profile - Show matched user's profile
  // Handle view profile - Navigate to view-only profile page
  const handleViewProfile = (matchedListing) => {
    console.log("🔍 View Profile clicked for matched listing:", matchedListing);

    let userId = null;

    // Check if userId is populated (object with _id)
    if (matchedListing.userId) {
      if (
        typeof matchedListing.userId === "object" &&
        matchedListing.userId._id
      ) {
        userId = matchedListing.userId._id;
      } else if (typeof matchedListing.userId === "string") {
        userId = matchedListing.userId;
      }
    }

    // If userId is directly on the matchedListing
    if (!userId && matchedListing.user) {
      if (typeof matchedListing.user === "object" && matchedListing.user._id) {
        userId = matchedListing.user._id;
      } else if (typeof matchedListing.user === "string") {
        userId = matchedListing.user;
      }
    }

    console.log("📝 Final userId:", userId);

    if (userId) {
      navigate(`/view-profile/${userId}`); // 👈 Changed to view-profile
    } else {
      alert("User profile not available for this listing.");
    }
  };

  if (loading) {
    return <div className="loading-matches">Loading your matches...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="matches-container">
        <div className="matches-header">
          <div className="matches-header-left">
            <h1>🔗 Your Matches</h1>
            {listingId && (
              <span className="listing-match-badge">
                Matches for selected listing
              </span>
            )}
          </div>
          <button className="back-btn" onClick={() => navigate("/my-listings")}>
            ← Back to My Listings
          </button>
        </div>
        <p className="subtitle">Find people who match your skills and needs</p>
        <div className="no-matches">
          <div className="no-matches-icon">🔍</div>
          <h3>No matches found yet</h3>
          <p>
            {listingId
              ? "This listing doesn't have any matches yet. Try creating more listings or adjusting your preferences."
              : "Create more listings to find people who match your skills or needs."}
          </p>
          <button
            className="create-listing-btn"
            onClick={() => navigate("/create-listing")}
          >
            Create a Listing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="matches-container">
      <div className="matches-header">
        <div className="matches-header-left">
          <h1>🔗 Your Matches</h1>
          {listingId && (
            <span className="listing-match-badge">
              Matches for selected listing
            </span>
          )}
        </div>
        <button className="back-btn" onClick={() => navigate("/my-listings")}>
          ← Back to My Listings
        </button>
      </div>
      <p className="subtitle">Find people who match your skills and needs</p>

      {matches.length > 0 && (
        <span className="match-count">{matches.length} matches found</span>
      )}

      <div className="matches-grid">
        {matches.map((match, index) => {
          // Get the listings from the match object
          const userListing = match.userListing || {};
          const matchedListing = match.matchedListing || {};

          if (!userListing._id && !matchedListing._id) {
            return null;
          }

          const matchScore = match.matchScore || 0;
          const { level, color } = getMatchLevel(matchScore);

          // Log the matched listing to see user data
          console.log(
            `📋 Match ${index} - Matched Listing User ID:`,
            matchedListing.userId
          );

          return (
            <div
              key={index}
              className="match-card"
              style={{ borderLeftColor: color || "#4CAF50" }}
            >
              <div className="match-header">
                <div
                  className="match-score"
                  style={{ backgroundColor: color || "#4CAF50" }}
                >
                  <span className="score-number">{matchScore}%</span>
                  <span className="score-label">{level || "Match"}</span>
                </div>
                <span className="match-type-badge">
                  {match.matchType === "offer_to_request"
                    ? "📤 Offer → Request"
                    : match.matchType === "request_to_offer"
                    ? "📥 Request → Offer"
                    : "🔄 Match"}
                </span>
              </div>

              <div className="match-content">
                <div className="user-listing">
                  <div className="listing-type">
                    Your {userListing.type || "listing"}
                  </div>
                  <h3>{userListing.title || "Untitled"}</h3>
                  <p className="category">
                    📂 {userListing.category || "Uncategorized"}
                  </p>
                  <p className="location">
                    📍 {userListing.city || "Unknown location"}
                  </p>
                  <p className="availability">
                    📅 {userListing.availability || "N/A"}
                  </p>
                </div>

                <div className="match-arrow">⇄</div>

                <div className="matched-listing">
                  <div className="listing-type">
                    {matchedListing.type || "listing"}
                  </div>
                  <h3>{matchedListing.title || "Untitled"}</h3>
                  <p className="category">
                    📂 {matchedListing.category || "Uncategorized"}
                  </p>
                  <p className="location">
                    📍 {matchedListing.city || "Unknown location"}
                  </p>
                  <p className="user-name">
                    👤{" "}
                    {matchedListing.userId?.name ||
                      matchedListing.user?.name ||
                      "Unknown User"}
                  </p>
                </div>
              </div>

              <div className="match-details">
                <div className="detail-tag">
                  <span className="tag-label">Category</span>
                  <span className="tag-value">
                    {match.matchDetails?.categoryMatch || "Match"}
                  </span>
                </div>
                <div className="detail-tag">
                  <span className="tag-label">Location</span>
                  <span className="tag-value">
                    {match.matchDetails?.cityMatch || "Match"}
                  </span>
                </div>
                <div className="detail-tag">
                  <span className="tag-label">Radius</span>
                  <span className="tag-value">
                    {match.matchDetails?.radiusMatch
                      ? "✅ Within range"
                      : "⚠️ Check"}
                  </span>
                </div>
              </div>

              <div className="match-actions">
                <button
                  className="view-profile-btn"
                  onClick={() => handleViewProfile(matchedListing)}
                >
                  👤 View Profile
                </button>
                <button
                  className="message-btn"
                  onClick={() => {
                    const matchedUserId = matchedListing.userId?._id || matchedListing.userId || matchedListing.user?._id;
                    if (matchedUserId) {
                      navigate(`/chat/${matchedUserId}?listing=${userListing._id}`);
                    }
                  }}
                >
                  💬 Message
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyMatches;
