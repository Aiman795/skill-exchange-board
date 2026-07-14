import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyListings, updateListing, deleteListing } from "../services/api";
import "./MyListings.css";

const MyListings = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    type: "",
    category: "",
    description: "",
    availability: "",
    radiusKm: "",
    status: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await getMyListings();
      setListings(response.data || []);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to fetch listings");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (listing) => {
    setEditingId(listing._id);
    setEditForm({
      title: listing.title,
      type: listing.type,
      category: listing.category,
      description: listing.description,
      availability: listing.availability || "",
      radiusKm: listing.radiusKm || "",
      status: listing.status || "active",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (id) => {
    try {
      setSaving(true);
      await updateListing(id, editForm);
      await fetchListings();
      cancelEditing();
    } catch (err) {
      setError(err.message || "Failed to update listing");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?"))
      return;
    try {
      await deleteListing(id);
      await fetchListings();
    } catch (err) {
      setError(err.message || "Failed to delete listing");
    }
  };

  // 👇 NEW: Navigate to matches page
  const handleViewMatches = () => {
    navigate("/my-matches");
  };

  // 👇 NEW: Navigate to matches for specific listing
  const handleViewMatchesForListing = (listingId) => {
    navigate(`/my-matches?listing=${listingId}`);
  };

  if (loading) {
    return <div className="loading">Loading your listings...</div>;
  }

  return (
    <div className="my-listings-container">
      <div className="my-listings-header">
        <h2>My Listings</h2>
        <div className="header-actions">
          <button
            className="btn-create-listing"
            onClick={() => navigate("/create-listing")}
          >
            + Create New Listing
          </button>
          {/* 👇 ADD: View All Matches Button */}
        </div>
      </div>

      {error && <p className="auth-error">{error}</p>}

      {listings.length === 0 ? (
        <div className="no-listings">
          <p>You haven't created any listings yet.</p>
          <button
            className="btn-create-listing"
            onClick={() => navigate("/create-listing")}
          >
            Create Your First Listing
          </button>
        </div>
      ) : (
        <div className="listings-grid">
          {listings.map((listing) => (
            <div className="listing-card" key={listing._id}>
              {editingId === listing._id ? (
                <div className="listing-edit-form">
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editForm.title}
                    onChange={handleEditChange}
                  />

                  <label>Type</label>
                  <select
                    name="type"
                    value={editForm.type}
                    onChange={handleEditChange}
                  >
                    <option value="offer">Offer</option>
                    <option value="request">Request</option>
                  </select>

                  <label>Category</label>
                  <input
                    type="text"
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                  />

                  <label>Description</label>
                  <textarea
                    name="description"
                    value={editForm.description}
                    onChange={handleEditChange}
                    rows={3}
                  />

                  <label>Availability</label>
                  <input
                    type="text"
                    name="availability"
                    value={editForm.availability}
                    onChange={handleEditChange}
                  />

                  <label>Radius (km)</label>
                  <input
                    type="number"
                    name="radiusKm"
                    value={editForm.radiusKm}
                    onChange={handleEditChange}
                    min={0}
                  />

                  <label>Status</label>
                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                  >
                    <option value="active">Active</option>
                    <option value="matched">Matched</option>
                    <option value="closed">Closed</option>
                  </select>

                  <div className="listing-actions">
                    <button
                      className="btn-save"
                      onClick={() => saveEdit(listing._id)}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button className="btn-cancel" onClick={cancelEditing}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="listing-header">
                    <span className={`listing-type ${listing.type}`}>
                      {listing.type}
                    </span>
                    <span className={`listing-status ${listing.status}`}>
                      {listing.status}
                    </span>
                  </div>
                  <h3>{listing.title}</h3>
                  <p className="listing-category">{listing.category}</p>
                  <p>{listing.description}</p>
                  <p className="listing-meta">
                    Availability: {listing.availability || "—"}
                  </p>
                  <p className="listing-meta">Radius: {listing.radiusKm} km</p>
                  {listing.city && (
                    <p className="listing-meta">📍 {listing.city}</p>
                  )}

                  {/* 👇 ADD: View Matches Button for this listing */}
                  <div className="listing-actions">
                    <button
                      className="btn-edit"
                      onClick={() => startEditing(listing)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(listing._id)}
                    >
                      🗑️ Delete
                    </button>
                    <button
                      className="btn-view-matches"
                      onClick={() => handleViewMatchesForListing(listing._id)}
                    >
                      🔗 Matches
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;
