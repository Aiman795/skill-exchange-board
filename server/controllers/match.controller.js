import Listing from "../models/Listing.js";
import User from "../models/User.js";

// ============================================
// GET MATCHES FOR A USER
// ============================================

export const getMatches = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all listings by this user
    const userListings = await Listing.find({ userId });

    if (userListings.length === 0) {
      return res.json({
        success: true,
        message: "You have no listings to match",
        matches: [],
      });
    }

    // Separate offers and requests
    const userOffers = userListings.filter((l) => l.type === "offer");
    const userRequests = userListings.filter((l) => l.type === "request");

    let matches = [];

    // 1️⃣ Match user's offers with other users' requests
    if (userOffers.length > 0) {
      const requestMatches = await findMatchesForOffers(userOffers);
      matches = matches.concat(requestMatches);
    }

    // 2️⃣ Match user's requests with other users' offers
    if (userRequests.length > 0) {
      const offerMatches = await findMatchesForRequests(userRequests);
      matches = matches.concat(offerMatches);
    }

    // Remove duplicates and sort by match score
    matches = removeDuplicates(matches);
    matches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      count: matches.length,
      matches,
    });
  } catch (error) {
    console.error("❌ Match error:", error);
    res.status(500).json({
      success: false,
      message: "Error finding matches",
      error: error.message,
    });
  }
};

// ============================================
// FIND MATCHES FOR OFFERS
// ============================================

const findMatchesForOffers = async (offers) => {
  const matches = [];

  for (const offer of offers) {
    // Find requests that match this offer
    const potentialMatches = await Listing.find({
      type: matchType,
      status: "active",
      userId: { $ne: userId },
      category: { $regex: listing.category, $options: "i" },
      city: { $regex: listing.city || "", $options: "i" },
    }).populate("userId", "name email city profileImage"); // 👈 Make sure this is populated

    for (const request of potentialMatches) {
      // Calculate match score
      const score = calculateMatchScore(offer, request);

      if (score > 0) {
        matches.push({
          userListing: offer,
          matchedListing: request,
          matchType: "offer_to_request",
          matchScore: score,
          matchDetails: {
            categoryMatch:
              offer.category === request.category ? "Exact" : "Related",
            cityMatch: offer.city === request.city ? "Same City" : "Nearby",
            radiusMatch: isWithinRadius(offer, request),
          },
        });
      }
    }
  }

  return matches;
};

// ============================================
// FIND MATCHES FOR REQUESTS
// ============================================

const findMatchesForRequests = async (requests) => {
  const matches = [];

  for (const request of requests) {
    // Find offers that match this request
    const potentialMatches = await Listing.find({
      type: "offer",
      status: "active",
      userId: { $ne: request.userId }, // Not the same user
      category: { $regex: request.category, $options: "i" },
      city: { $regex: request.city || "", $options: "i" },
    }).populate("userId", "name email city");

    for (const offer of potentialMatches) {
      const score = calculateMatchScore(request, offer);

      if (score > 0) {
        matches.push({
          userListing: request,
          matchedListing: offer,
          matchType: "request_to_offer",
          matchScore: score,
          matchDetails: {
            categoryMatch:
              request.category === offer.category ? "Exact" : "Related",
            cityMatch: request.city === offer.city ? "Same City" : "Nearby",
            radiusMatch: isWithinRadius(request, offer),
          },
        });
      }
    }
  }

  return matches;
};

// ============================================
// CALCULATE MATCH SCORE
// ============================================

const calculateMatchScore = (listing1, listing2) => {
  let score = 0;
  const maxScore = 100;

  // 1️⃣ Category match (max 40 points)
  if (listing1.category.toLowerCase() === listing2.category.toLowerCase()) {
    score += 40;
  } else if (areRelatedCategories(listing1.category, listing2.category)) {
    score += 20;
  }

  // 2️⃣ Location match (max 30 points)
  if (listing1.city && listing2.city) {
    if (listing1.city.toLowerCase() === listing2.city.toLowerCase()) {
      score += 30;
    } else if (
      listing1.city.toLowerCase().includes(listing2.city.toLowerCase()) ||
      listing2.city.toLowerCase().includes(listing1.city.toLowerCase())
    ) {
      score += 15;
    }
  }

  // 3️⃣ Radius match (max 20 points)
  if (listing1.radiusKm && listing2.radiusKm) {
    const avgRadius = (listing1.radiusKm + listing2.radiusKm) / 2;
    if (isWithinRadius(listing1, listing2)) {
      score += 20;
    } else if (avgRadius > 10) {
      score += 10;
    }
  }

  // 4️⃣ Availability match (max 10 points)
  if (listing1.availability && listing2.availability) {
    if (hasAvailabilityOverlap(listing1.availability, listing2.availability)) {
      score += 10;
    }
  }

  return Math.min(score, maxScore);
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Check if two categories are related
const areRelatedCategories = (cat1, cat2) => {
  const relatedCategories = {
    programming: ["technology", "software", "coding", "development"],
    technology: ["programming", "software", "development"],
    graphics: ["design", "art", "visual"],
    art: ["graphics", "design", "crafts"],
    music: ["audio", "sound"],
    business: ["marketing", "entrepreneurship", "finance"],
    health: ["fitness", "wellness", "medical"],
    fitness: ["health", "wellness", "exercise"],
    education: ["teaching", "tutoring", "learning"],
    cooking: ["culinary", "food", "nutrition"],
    crafts: ["art", "handmade", "creative"],
  };

  cat1 = cat1.toLowerCase();
  cat2 = cat2.toLowerCase();

  if (cat1 === cat2) return true;

  // Check related categories
  if (relatedCategories[cat1] && relatedCategories[cat1].includes(cat2))
    return true;
  if (relatedCategories[cat2] && relatedCategories[cat2].includes(cat1))
    return true;

  return false;
};

// Check if locations are within radius
const isWithinRadius = (listing1, listing2) => {
  if (!listing1.radiusKm || !listing2.radiusKm) return true;

  const avgRadius = (listing1.radiusKm + listing2.radiusKm) / 2;
  // For now, assume same city = within radius
  if (listing1.city && listing2.city) {
    if (listing1.city.toLowerCase() === listing2.city.toLowerCase()) {
      return true;
    }
  }
  return false;
};

// Check availability overlap (simple version)
const hasAvailabilityOverlap = (avail1, avail2) => {
  // Simple check: look for common days/times
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
    "weekend",
    "weekday",
  ];
  const days1 = avail1.toLowerCase();
  const days2 = avail2.toLowerCase();

  for (const day of days) {
    if (days1.includes(day) && days2.includes(day)) {
      return true;
    }
  }
  return false;
};

// Remove duplicate matches
const removeDuplicates = (matches) => {
  const seen = new Set();
  return matches.filter((match) => {
    const key = `${match.userListing._id}_${match.matchedListing._id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// ============================================
// GET MATCHES FOR A SPECIFIC LISTING
// ============================================

export const getMatchesForListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Check if user owns this listing
    if (listing.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only get matches for your own listings",
      });
    }

    // Find matching listings (opposite type)
    const matchType = listing.type === "offer" ? "request" : "offer";

    const potentialMatches = await Listing.find({
      type: matchType,
      status: "active",
      userId: { $ne: userId },
      category: { $regex: listing.category, $options: "i" },
      city: { $regex: listing.city || "", $options: "i" },
    }).populate("userId", "name email city");

    // Format matches to match the same structure as getMatches
    const formattedMatches = potentialMatches.map((match) => ({
      userListing: listing, // The user's listing
      matchedListing: match, // The matched listing
      matchType:
        listing.type === "offer" ? "offer_to_request" : "request_to_offer",
      matchScore: calculateMatchScore(listing, match),
      matchDetails: {
        categoryMatch:
          listing.category === match.category ? "Exact" : "Related",
        cityMatch: listing.city === match.city ? "Same City" : "Nearby",
        radiusMatch: isWithinRadius(listing, match),
      },
    }));

    // Sort by match score
    formattedMatches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      count: formattedMatches.length,
      matches: formattedMatches,
    });
  } catch (error) {
    console.error("❌ Match error:", error);
    res.status(500).json({
      success: false,
      message: "Error finding matches",
      error: error.message,
    });
  }
};
