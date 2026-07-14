import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createListing } from "../services/api";
import "./CreateListing.css";

const CreateListing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    type: "offer",
    category: "",
    description: "",
    availability: "",
    radiusKm: 5,
    locationName: "",
    city: "",
    country: "Pakistan",
  });

  const categories = [
    "Programming",
    "Language",
    "Graphics",
    "Music",
    "Art",
    "Business",
    "Health",
    "Fitness",
    "Education",
    "Cooking",
    "Crafts",
    "Technology",
    "Writing",
    "Other",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!formData.city) {
        setError("Please provide your city");
        setLoading(false);
        return;
      }

      const listingData = {
        ...formData,
        radiusKm: Number(formData.radiusKm),
      };

      await createListing(listingData);
      setSuccess("✅ Listing created successfully!");

      setTimeout(() => {
        navigate("/my-listings");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-listing-container">
      <div className="create-listing-card">
        <h1>Create a Listing</h1>
        <p className="subtitle">Share your skills or find what you need</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="listing-form">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">Listing Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="e.g., UI/UX Design Mentorship"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Type */}
          <div className="form-group">
            <label htmlFor="type">Listing Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="offer">📤 Offer (I want to teach/share)</option>
              <option value="request">📥 Request (I want to learn/find)</option>
            </select>
          </div>

          {/* Category */}
          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              placeholder="Tell others what you are sharing or looking for..."
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
            />
          </div>

          {/* Availability */}
          <div className="form-group">
            <label htmlFor="availability">Availability *</label>
            <input
              type="text"
              id="availability"
              name="availability"
              placeholder="e.g., Weekends, Mon-Wed 5PM, Online"
              value={formData.availability}
              onChange={handleChange}
              required
            />
          </div>

          {/* Location Section */}
          <div className="form-section">
            <h3>📍 Location Details</h3>
            <p className="section-hint">
              Where are you located? This helps people find you nearby.
            </p>

            <div className="form-group">
              <label htmlFor="locationName">Area/Location Name</label>
              <input
                type="text"
                id="locationName"
                name="locationName"
                placeholder="e.g., Gulberg, DHA Phase 6"
                value={formData.locationName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="e.g., Lahore, Karachi, Islamabad"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                name="country"
                placeholder="e.g., Pakistan"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Radius */}
          <div className="form-group">
            <label htmlFor="radiusKm">
              Radius (in Kilometers)
              <span className="hint">How far are you willing to travel?</span>
            </label>
            <input
              type="number"
              id="radiusKm"
              name="radiusKm"
              placeholder="e.g., 5, 10"
              value={formData.radiusKm}
              onChange={handleChange}
              min="1"
              max="100"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Creating..." : "📝 Save Listing to DB"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;
