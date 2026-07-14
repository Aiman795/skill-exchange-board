import React, { useState, useEffect } from "react";
import { searchListings } from "../services/api";
import "./BrowseListings.css";

const categories = [
  "all",
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

const BrowseListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalResults, setTotalResults] = useState(0);
  const [appliedFilters, setAppliedFilters] = useState({});

  const [filters, setFilters] = useState({
    category: "all",
    keyword: "",
    type: "all",
    radius: "",
    city: "",
    locationName: "",
  });

  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    usingLocation: false,
  });
  const [useLocation, setUseLocation] = useState(false);
  const [locationPermission, setLocationPermission] = useState(null);

  useEffect(() => {
    fetchListings();
  }, [filters, useLocation, location]);

  const fetchListings = async () => {
    setLoading(true);
    setError("");

    try {
      let searchFilters = { ...filters };

      Object.keys(searchFilters).forEach((key) => {
        if (!searchFilters[key] || searchFilters[key] === "") {
          delete searchFilters[key];
        }
      });

      if (useLocation && location.lat && location.lng) {
        searchFilters.lat = location.lat;
        searchFilters.lng = location.lng;
      }

      if (filters.radius) {
        searchFilters.radius = filters.radius;
      }

      const data = await searchListings(searchFilters);

      setListings(data.listings || []);
      setTotalResults(data.total || 0);
      setAppliedFilters(data.appliedFilters || {});
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || "Failed to fetch listings");
      setListings([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchListings();
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setLocationPermission("unsupported");
      return;
    }

    setLoading(true);
    setLocationPermission("pending");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          usingLocation: true,
        });
        setUseLocation(true);
        setLocationPermission("granted");
        setLoading(false);
      },
      (error) => {
        console.error("Location error:", error);
        let errorMsg = "Unable to get your location. ";
        if (error.code === 1) {
          errorMsg += "Please allow location access in your browser settings.";
        } else if (error.code === 2) {
          errorMsg += "Location unavailable. Please try again.";
        } else {
          errorMsg += "Please check your browser permissions.";
        }
        alert(errorMsg);
        setLocationPermission("denied");
        setLoading(false);
      }
    );
  };

  const clearFilters = () => {
    setFilters({
      category: "all",
      keyword: "",
      type: "all",
      radius: "",
      city: "",
      locationName: "",
    });
    setUseLocation(false);
    setLocation({ lat: null, lng: null, usingLocation: false });
    setLocationPermission(null);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category && filters.category !== "all") count++;
    if (filters.type && filters.type !== "all") count++;
    if (filters.keyword && filters.keyword.trim()) count++;
    if (filters.radius) count++;
    if (filters.city) count++;
    if (filters.locationName) count++;
    if (useLocation) count++;
    return count;
  };

  return (
    <div className="browse-container">
      <div className="browse-header">
        <h1>🔍 Browse Listings</h1>
        {!loading && (
          <div className="header-stats">
            <span>
              {totalResults} listing{totalResults !== 1 ? "s" : ""} found
            </span>
            {getActiveFilterCount() > 0 && (
              <span className="active-filters-badge">
                {getActiveFilterCount()} filter
                {getActiveFilterCount() !== 1 ? "s" : ""} active
              </span>
            )}
          </div>
        )}
      </div>

      <div className="filters-section">
        <form onSubmit={handleSearch} className="filters-form">
          <div className="filter-row">
            <div className="filter-group keyword-group">
              <input
                type="text"
                name="keyword"
                placeholder="🔍 Search listings..."
                value={filters.keyword}
                onChange={handleFilterChange}
                className="search-input"
              />
            </div>
            <button type="submit" className="search-btn">
              Search
            </button>
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label>Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="filter-select"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Type</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="all">All Types</option>
                <option value="offer">📤 Offers</option>
                <option value="request">📥 Requests</option>
              </select>
            </div>

            <div className="filter-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                placeholder="e.g., Lahore"
                value={filters.city}
                onChange={handleFilterChange}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <label>Area</label>
              <input
                type="text"
                name="locationName"
                placeholder="e.g., Gulberg"
                value={filters.locationName}
                onChange={handleFilterChange}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <label>Radius (km)</label>
              <input
                type="number"
                name="radius"
                placeholder="Any"
                value={filters.radius}
                onChange={handleFilterChange}
                className="radius-input"
                min="1"
                max="100"
              />
            </div>

            <div className="filter-group clear-group">
              <label>&nbsp;</label>
              <button
                type="button"
                onClick={clearFilters}
                className="clear-btn"
                disabled={getActiveFilterCount() === 0}
              >
                ✕ Clear All
              </button>
            </div>
          </div>
        </form>

        {getActiveFilterCount() > 0 && (
          <div className="active-filters">
            <span className="active-filters-label">Active filters:</span>
            {filters.category && filters.category !== "all" && (
              <span className="filter-tag">📂 {filters.category}</span>
            )}
            {filters.type && filters.type !== "all" && (
              <span className="filter-tag">
                {filters.type === "offer" ? "📤 Offer" : "📥 Request"}
              </span>
            )}
            {filters.keyword && (
              <span className="filter-tag">🔍 "{filters.keyword}"</span>
            )}
            {filters.city && (
              <span className="filter-tag">📍 {filters.city}</span>
            )}
            {filters.locationName && (
              <span className="filter-tag">📍 {filters.locationName}</span>
            )}
            {filters.radius && (
              <span className="filter-tag">📍 {filters.radius}km</span>
            )}
            {useLocation && <span className="filter-tag">📍 Near me</span>}
          </div>
        )}
      </div>

      {error && <div className="error-message">⚠️ {error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner">⏳ Loading listings...</div>
        </div>
      ) : (
        <div className="listings-grid">
          {listings.length > 0 ? (
            listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No listings found</h3>
              <p>
                Try adjusting your search filters or clear them to see all
                listings.
              </p>
              {getActiveFilterCount() > 0 && (
                <button onClick={clearFilters} className="clear-filters-btn">
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ListingCard = ({ listing }) => {
  const getTypeColor = (type) => {
    return type === "offer" ? "offer-badge" : "request-badge";
  };

  const getTypeIcon = (type) => {
    return type === "offer" ? "📤" : "📥";
  };

  return (
    <div className="listing-card">
      <div className="card-header">
        <div className="card-title-section">
          <span className={`type-badge ${getTypeColor(listing.type)}`}>
            {getTypeIcon(listing.type)} {listing.type}
          </span>
          <h3>{listing.title}</h3>
        </div>
      </div>

      <div className="card-body">
        <div className="card-meta">
          <span className="category">📂 {listing.category}</span>
          {listing.radiusKm && (
            <span className="radius">📍 {listing.radiusKm} km</span>
          )}
          {listing.city && <span className="city">🏙️ {listing.city}</span>}
        </div>
        <p className="description">{listing.description}</p>
        {listing.availability && (
          <div className="availability">
            <span className="label">📅 Availability:</span>
            <span className="value">{listing.availability}</span>
          </div>
        )}
      </div>

      <div className="card-footer">
        <span className="user">
          👤 {listing.userId?.name || "Unknown User"}
        </span>
        <span className="date">
          📅{" "}
          {new Date(listing.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  );
};

export default BrowseListings;
