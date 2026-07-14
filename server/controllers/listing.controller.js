import Listing from "../models/Listing.js";

// ============================================
// CREATE LISTING (with location)
// ============================================

export const createListing = async (req, res) => {
  try {
    const {
      title,
      type,
      category,
      description,
      availability,
      radiusKm,
      locationName,
      city,
      country,
      status,
    } = req.body;

    // Validate required fields
    if (!title || !type || !category || !description || !availability) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Build location object
    let location = {
      type: "Point",
      coordinates: [0, 0], // Default coordinates
    };

    const listing = new Listing({
      userId: req.userId,
      title,
      type,
      category,
      description,
      availability,
      radiusKm: radiusKm || 5,
      location,
      locationName: locationName || "",
      city: city || "",
      country: country || "Pakistan",
      status: status || "active",
    });

    await listing.save();

    res.status(201).json({
      success: true,
      message: "Listing created successfully",
      listing,
    });
  } catch (error) {
    console.error("Create listing error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating listing",
      error: error.message,
    });
  }
};

// ============================================
// GET ALL LISTINGS (Public)
// ============================================

export const getListings = async (req, res) => {
  try {
    const { type, category } = req.query;
    const filter = { status: "active" };
    if (type) filter.type = type.toLowerCase();
    if (category) filter.category = category;

    const listings = await Listing.find(filter)
      .populate("userId", "name photoUrl location")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: listings });
  } catch (error) {
    console.error("Error fetching listings:", error);
    res
      .status(500)
      .json({ message: "Server Error. Could not fetch listings." });
  }
};

// ============================================
// GET MY LISTINGS (Protected)
// ============================================

export const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: listings });
  } catch (error) {
    console.error("Error fetching your listings:", error);
    res
      .status(500)
      .json({ message: "Server Error. Could not fetch your listings." });
  }
};

// ============================================
// UPDATE LISTING (Protected - Owner only)
// ============================================

export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    // Ownership check
    if (listing.userId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "You can only edit your own listings." });
    }

    const {
      title,
      category,
      description,
      type,
      availability,
      radiusKm,
      status,
      locationName,
      city,
      country,
    } = req.body;

    if (title !== undefined) listing.title = title;
    if (category !== undefined) listing.category = category;
    if (description !== undefined) listing.description = description;
    if (type !== undefined) listing.type = type.toLowerCase();
    if (availability !== undefined) listing.availability = availability;
    if (radiusKm !== undefined) listing.radiusKm = Number(radiusKm);
    if (status !== undefined) listing.status = status;
    if (locationName !== undefined) listing.locationName = locationName;
    if (city !== undefined) listing.city = city;
    if (country !== undefined) listing.country = country;

    const updatedListing = await listing.save();
    res.status(200).json({ success: true, data: updatedListing });
  } catch (error) {
    console.error("Error updating listing:", error);
    res
      .status(500)
      .json({ message: "Server Error. Could not update listing." });
  }
};

// ============================================
// DELETE LISTING (Protected - Owner only)
// ============================================

export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    // Ownership check
    if (listing.userId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own listings." });
    }

    await listing.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Listing deleted successfully." });
  } catch (error) {
    console.error("Error deleting listing:", error);
    res
      .status(500)
      .json({ message: "Server Error. Could not delete listing." });
  }
};

// ============================================
// SEARCH & FILTER LISTINGS (With Location)
// ============================================

export const searchListings = async (req, res) => {
  try {
    const {
      category,
      keyword,
      type,
      radius,
      status = "active",
      minRadius,
      maxRadius,
      city,
      locationName,
      country,
    } = req.query;

    // Build the filter object
    const filter = { status: "active" };

    // 1️⃣ Filter by category
    if (category && category !== "all" && category !== "") {
      filter.category = category;
    }

    // 2️⃣ Filter by type (offer/request)
    if (type && type !== "all" && type !== "") {
      filter.type = type;
    }

    // 3️⃣ Filter by city
    if (city && city.trim()) {
      filter.city = { $regex: city.trim(), $options: "i" };
    }

    // 4️⃣ Filter by location name / area
    if (locationName && locationName.trim()) {
      filter.locationName = { $regex: locationName.trim(), $options: "i" };
    }

    // 5️⃣ Filter by country
    if (country && country.trim()) {
      filter.country = { $regex: country.trim(), $options: "i" };
    }

    // 6️⃣ Keyword search
    if (keyword && keyword.trim()) {
      const searchRegex = new RegExp(keyword.trim(), "i");
      filter.$or = [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { availability: { $regex: searchRegex } },
        { category: { $regex: searchRegex } },
        { city: { $regex: searchRegex } },
        { locationName: { $regex: searchRegex } },
      ];
    }

    // 7️⃣ Filter by radius
    if (radius) {
      filter.radiusKm = { $lte: parseFloat(radius) };
    }

    // 8️⃣ Filter by radius range
    if (minRadius || maxRadius) {
      filter.radiusKm = {};
      if (minRadius) filter.radiusKm.$gte = parseFloat(minRadius);
      if (maxRadius) filter.radiusKm.$lte = parseFloat(maxRadius);
    }

    console.log("🔍 Search filters applied:", JSON.stringify(filter, null, 2));

    // Execute search with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .populate("userId", "name email profileImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Listing.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: listings.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      listings,
      appliedFilters: {
        category: category || "all",
        type: type || "all",
        keyword: keyword || "",
        radius: radius || "any",
        city: city || "",
        locationName: locationName || "",
        country: country || "",
      },
    });
  } catch (error) {
    console.error("❌ Search error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching listings",
      error: error.message,
    });
  }
};

// ============================================
// GET NEARBY LISTINGS (Location-based)
// ============================================

export const getNearbyListings = async (req, res) => {
  try {
    const {
      lat,
      lng,
      radius = 10,
      category,
      keyword,
      type,
      city,
      locationName,
    } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    // Build filter
    const filter = { status: "active" };

    if (category && category !== "all") {
      filter.category = category;
    }

    if (type && type !== "all") {
      filter.type = type;
    }

    if (city && city.trim()) {
      filter.city = { $regex: city.trim(), $options: "i" };
    }

    if (locationName && locationName.trim()) {
      filter.locationName = { $regex: locationName.trim(), $options: "i" };
    }

    if (keyword && keyword.trim()) {
      const searchRegex = new RegExp(keyword.trim(), "i");
      filter.$or = [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { city: { $regex: searchRegex } },
        { locationName: { $regex: searchRegex } },
      ];
    }

    // Filter by radius
    filter.radiusKm = { $lte: parseFloat(radius) };

    console.log("📍 Nearby search:", { lat, lng, radius, filter });

    const listings = await Listing.find(filter)
      .populate("userId", "name email profileImage")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: listings.length,
      listings,
      location: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radius: parseFloat(radius),
      },
      appliedFilters: {
        city: city || "",
        locationName: locationName || "",
      },
    });
  } catch (error) {
    console.error("❌ Nearby search error:", error);
    res.status(500).json({
      success: false,
      message: "Error finding nearby listings",
      error: error.message,
    });
  }
};
