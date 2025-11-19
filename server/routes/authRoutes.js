console.log("authRoutes loaded!");


const express = require("express");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

const { registerUser, loginUser } = require("../controllers/authController");

//Routes:
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, (req, res) => {
    res.json({ message: "Protected route accessed!", user: req.user });
});

module.exports = router;