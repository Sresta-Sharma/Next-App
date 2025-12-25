const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const pool = require("../db");

// Save or update a draft
router.post("/", protect, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { title, content, tags, draft_id } = req.body;

        if (!title?.trim() || !content) {
            return res.status(400).json({ error: "Title and content are required!" });
        }

        const draftTags = Array.isArray(tags) ? tags : [];
        let result;

        if (draft_id) {
            // Update existing draft
            const existing = await pool.query(
                "SELECT * FROM drafts WHERE draft_id = $1 AND user_id = $2",
                [draft_id, userId]
            );

            if (existing.rows.length === 0) {
                return res.status(404).json({ error: "Draft not found!" });
            }

            result = await pool.query(
                `UPDATE drafts 
                 SET title = $1, content = $2, tags = $3, updated_at = CURRENT_TIMESTAMP
                 WHERE draft_id = $4
                 RETURNING *`,
                [title.trim(), content, draftTags, draft_id]
            );
        } else {
            // Create new draft
            result = await pool.query(
                `INSERT INTO drafts (user_id, title, content, tags)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [userId, title.trim(), content, draftTags]
            );
        }

        return res.status(201).json({
            message: draft_id ? "Draft updated" : "Draft saved",
            draft: result.rows[0],
        });
    } catch (error) {
        console.error("Error saving draft:", error);
        return res.status(500).json({ error: "Internal Server Error!" });
    }
});

// Get all drafts for the logged-in user
router.get("/", protect, async (req, res) => {
    try {
        const userId = req.user.user_id;

        const result = await pool.query(
            `SELECT * FROM drafts 
             WHERE user_id = $1 AND expires_at > CURRENT_TIMESTAMP
             ORDER BY updated_at DESC`,
            [userId]
        );

        return res.json({ drafts: result.rows });
    } catch (error) {
        console.error("Error fetching drafts:", error);
        return res.status(500).json({ error: "Internal Server Error!" });
    }
});

// Get a single draft by ID
router.get("/:id", protect, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const draftId = req.params.id;

        const result = await pool.query(
            `SELECT * FROM drafts 
             WHERE draft_id = $1 AND user_id = $2`,
            [draftId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Draft not found!" });
        }

        return res.json({ draft: result.rows[0] });
    } catch (error) {
        console.error("Error fetching draft:", error);
        return res.status(500).json({ error: "Internal Server Error!" });
    }
});

// Delete a draft
router.delete("/:id", protect, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const draftId = req.params.id;

        const existing = await pool.query(
            "SELECT * FROM drafts WHERE draft_id = $1 AND user_id = $2",
            [draftId, userId]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({ error: "Draft not found!" });
        }

        await pool.query("DELETE FROM drafts WHERE draft_id = $1", [draftId]);

        return res.json({ message: "Draft deleted" });
    } catch (error) {
        console.error("Error deleting draft:", error);
        return res.status(500).json({ error: "Internal Server Error!" });
    }
});

// Publish a draft as a blog post
router.post("/:id/publish", protect, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const draftId = req.params.id;

        const draftRes = await pool.query(
            "SELECT * FROM drafts WHERE draft_id = $1 AND user_id = $2",
            [draftId, userId]
        );

        if (draftRes.rows.length === 0) {
            return res.status(404).json({ error: "Draft not found!" });
        }

        const draft = draftRes.rows[0];

        // Create blog post from draft
        const blogRes = await pool.query(
            `INSERT INTO blogs (user_id, title, content)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [userId, draft.title, draft.content]
        );

        // Delete the draft after publishing
        await pool.query("DELETE FROM drafts WHERE draft_id = $1", [draftId]);

        return res.json({
            message: "Draft published successfully!",
            blog: blogRes.rows[0],
        });
    } catch (error) {
        console.error("Error publishing draft:", error);
        return res.status(500).json({ error: "Internal Server Error!" });
    }
});

module.exports = router;
