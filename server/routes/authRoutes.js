console.log("authRoutes loaded!");


const express = require("express");
const pool = require("../db");
const protect = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

const { registerUser, 
        loginUser,
        getAllUsers, 
        deleteUser, 
        updateUserRole,
        changePassword,
        deleteAccount,
        updateProfile,
        requestPasswordResetOtp,
        resetPassword,
        verifyOtp,
        refreshToken,
        googleOAuth,
        googleOAuthLogin,
        googleOAuthRegister
     } = require("../controllers/authController");

// Public:
router.post("/register", registerUser);

// Login:
router.post("/login", loginUser); // body: { email, password }

// Forgot Password: request OTP
router.post("/request-otp", requestPasswordResetOtp); // body: { email }

// Verify OTP (both login & reset)
router.post("/verify-otp", verifyOtp); // body:  {email, otp, purpose: "login"|"reset" }

// Google OAuth
router.post("/oauth/google", googleOAuth); // body: { email, name, oauth_id, avatar } - deprecated, use specific endpoints
router.post("/oauth/google/login", googleOAuthLogin); // body: { email, name, oauth_id, avatar } - existing users only
router.post("/oauth/google/register", googleOAuthRegister); // body: { email, name, oauth_id, avatar } - creates new users

// Reset password using resetToken returned by verify-otp (Authorization header: Bearer <resetToken>)
router.post("/reset-password", resetPassword);

// Refresh token
router.post("/refresh-token", refreshToken);

// User Protected Route:
router.get("/me", protect, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const result = await pool.query(
            "SELECT user_id, name, email, phone, role, avatar, oauth_provider, oauth_id FROM users WHERE user_id = $1",
            [userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        
        res.json({ message: "Protected route accessed!", user: result.rows[0] });
    } catch (err) {
        console.error("/me error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Admin: Update Profile
router.put("/update-profile", protect, updateProfile);

// Admin: Change Password
router.put("/change-password", protect, changePassword);

// User: Delete Account
router.delete("/delete-account", protect, deleteAccount);

// Admin: Protected Route:
router.get("/admin/users", protect, verifyAdmin, getAllUsers);

//Admin: Delete User
router.delete("/admin/users/:id", protect, verifyAdmin, deleteUser);

// Admin: Update User Role
router.put("/admin/users/:id/role", protect, verifyAdmin, updateUserRole);

module.exports = router;