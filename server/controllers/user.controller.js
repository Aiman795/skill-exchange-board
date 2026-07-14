import User from "../models/User.js";

// ============================================
// GET OWN PROFILE (Protected)
// ============================================

export const getProfile = async (req, res) => {
  try {
    console.log("📡 Getting profile for user:", req.userId);

    const user = await User.findById(req.userId).select("-passwordHash -__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("✅ Profile found:", user.name);

    // 👇 Return in the format frontend expects
    res.json({
      success: true,
      user: user.toObject(),
    });
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// UPDATE OWN PROFILE (Protected)
// ============================================

export const updateProfile = async (req, res) => {
  try {
    console.log("📡 Updating profile for user:", req.userId);
    console.log("📡 Update data:", req.body);

    const { name, city, bio } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name) user.name = name;
    if (city) user.city = city;
    if (bio) user.bio = bio;

    await user.save();

    console.log("✅ Profile updated successfully");

    // 👇 Return updated user in the same format
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        city: user.city,
        bio: user.bio,
        photoUrl: user.photoUrl,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// GET ANY USER PROFILE BY ID (Public)
// ============================================

export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("📡 Fetching user profile for ID:", userId);

    const user = await User.findById(userId).select("-passwordHash -__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("✅ User found:", user.name);
    res.json({
      success: true,
      ...user.toObject(),
    });
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
