const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/adminMiddleware");

const {
  submitMessage,
  getAllMessages,
  markAsReplied,
  sendReply
} = require("../controllers/contactController");

// Public route - Submit contact message
router.post("/submit", submitMessage);

// Admin routes - Protected
router.get("/messages", protect, verifyAdmin, getAllMessages);
router.patch("/messages/:messageId/replied", protect, verifyAdmin, markAsReplied);
router.post("/messages/:messageId/reply", protect, verifyAdmin, sendReply);

module.exports = router;
