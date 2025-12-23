console.log("authRoutes loaded!");


const express = require("express");
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
        refreshToken
     } = require("../controllers/authController");

// Public:
router.post("/register", registerUser);

// Login:
router.post("/login", loginUser); // body: { email, password }

// Forgot Password: request OTP
router.post("/request-otp", requestPasswordResetOtp); // body: { email }

// Verify OTP (both login & reset)
router.post("/verify-otp", verifyOtp); // body:  {email, otp, purpose: "login"|"reset" }

// Reset password using resetToken returned by verify-otp (Authorization header: Bearer <resetToken>)
router.post("/reset-password", resetPassword);

// Refresh token
router.post("/refresh-token", refreshToken);

// User Protected Route:
router.get("/me", protect, (req, res) => {
    res.json({ message: "Protected route accessed!", user: req.user });
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