const express = require('express');
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/adminMiddleware");

const {
    createBlog,
    getAllBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
    getMyBlogs,
    getBlogsByTag,
    getAllTags
} = require("../controllers/blogController");

// Public Routes
router.get("/", getAllBlogs);

router.get("/tags", getAllTags); // Get all unique tags

router.get("/tag/:tag", getBlogsByTag); // Get blogs by tag

router.get("/me", protect, getMyBlogs); // Protected

router.get("/:id", getBlogById); // Public

// Protected Routes
router.post("/", protect, createBlog);

router.put("/:id", protect, updateBlog);      //author or admin
router.delete("/:id", protect, deleteBlog);   //author or admin

module.exports = router;