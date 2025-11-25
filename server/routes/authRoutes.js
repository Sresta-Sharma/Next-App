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
        updateProfile
     } = require("../controllers/authController");

// Public Routes:
router.post("/register", registerUser);
router.post("/login", loginUser);

// User Protected Route:
router.get("/me", protect, (req, res) => {
    res.json({ message: "Protected route accessed!", user: req.user });
});

// Admin: Update Profile
router.put("/update-profile", protect, verifyAdmin, updateProfile);

// Admin: Change Password
router.put("/change-password", protect, verifyAdmin, changePassword);

// Admin: Protected Route:
router.get("/admin/users", protect, verifyAdmin, getAllUsers);

//Admin: Delete User
router.delete("/admin/users/:id", protect, verifyAdmin, deleteUser);

// Admin: Update User Role
router.put("/admin/users/:id/role", protect, verifyAdmin, updateUserRole);

module.exports = router;