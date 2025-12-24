const express = require("express");
const router = express.Router();
const { sendEmail } = require("../utils/email");
const protect = require("../middleware/authMiddleware");
const pool = require("../db");

router.post("/", async (req, res) => {
    try {
        const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Check if email already exists
    const existingSubscriber = await pool.query(
        "SELECT * FROM subscribers WHERE email = $1",
        [email]
    );

    if (existingSubscriber.rows.length > 0) {
        const subscriber = existingSubscriber.rows[0];
        
        if (subscriber.is_active) {
            return res.status(400).json({ 
                success: false, 
                message: "This email is already subscribed!" 
            });
        }
        
        // Reactivate if previously unsubscribed
        await pool.query(
            "UPDATE subscribers SET is_active = TRUE, subscribed_at = CURRENT_TIMESTAMP WHERE email = $1",
            [email]
        );
    } else {
        // Insert new subscriber
        await pool.query(
            "INSERT INTO subscribers (email) VALUES ($1)",
            [email]
        );
    }

    const html = `
        <h2>Thank you for subscribing!</h2>
        <p>You will receive updates whenever new stories are posted.</p>
    `;

    const sent = await sendEmail(email, "Beautiful Mess - Subscription Confirmed!", html);

    if (!sent) {
        return res.status(500).json({
            success: false,
            message: "Failed to send email"
        });
    }

    return res.json({
        success: true,
        message: "Subscription email sent!"
    });
    } catch (error) {
        console.error("Subscribe Error:", error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
});

// Get subscription status
router.get("/status", protect, async (req, res) => {
    try {
        const userRes = await pool.query("SELECT email FROM users WHERE user_id = $1", [req.user.user_id]);
        
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const email = userRes.rows[0].email;
        const subRes = await pool.query(
            "SELECT is_active FROM subscribers WHERE email = $1",
            [email]
        );

        const isSubscribed = subRes.rows.length > 0 && subRes.rows[0].is_active;
        return res.json({ isSubscribed });
    } catch (error) {
        console.error("Status Check Error:", error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
});

// Unsubscribe
router.post("/unsubscribe", protect, async (req, res) => {
    try {
        const userRes = await pool.query("SELECT email FROM users WHERE user_id = $1", [req.user.user_id]);
        
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const email = userRes.rows[0].email;
        
        const subRes = await pool.query(
            "SELECT * FROM subscribers WHERE email = $1",
            [email]
        );

        if (subRes.rows.length === 0) {
            return res.status(400).json({ success: false, message: "Not subscribed" });
        }

        await pool.query(
            "UPDATE subscribers SET is_active = FALSE WHERE email = $1",
            [email]
        );

        return res.json({ success: true, message: "Unsubscribed successfully!" });
    } catch (error) {
        console.error("Unsubscribe Error:", error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
});

// Subscribe (for logged-in users)
router.post("/subscribe", protect, async (req, res) => {
    try {
        const userRes = await pool.query("SELECT email FROM users WHERE user_id = $1", [req.user.user_id]);
        
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const email = userRes.rows[0].email;
        
        const existingSubscriber = await pool.query(
            "SELECT * FROM subscribers WHERE email = $1",
            [email]
        );

        if (existingSubscriber.rows.length > 0) {
            const subscriber = existingSubscriber.rows[0];
            
            if (subscriber.is_active) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Already subscribed!" 
                });
            }
            
            await pool.query(
                "UPDATE subscribers SET is_active = TRUE, subscribed_at = CURRENT_TIMESTAMP WHERE email = $1",
                [email]
            );
        } else {
            await pool.query(
                "INSERT INTO subscribers (email) VALUES ($1)",
                [email]
            );
        }

        const html = `
            <h2>Thank you for subscribing!</h2>
            <p>You will receive updates whenever new stories are posted.</p>
        `;

        await sendEmail(email, "Beautiful Mess - Subscription Confirmed!", html);

        return res.json({ success: true, message: "Subscribed successfully!" });
    } catch (error) {
        console.error("Subscribe Error:", error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
});

// Get all subscribers (admin only)
router.get("/all", protect, async (req, res) => {
    try {
        console.log("Fetching subscribers for user:", req.user.user_id);
        
        // Check if user is admin
        const userRes = await pool.query("SELECT role FROM users WHERE user_id = $1", [req.user.user_id]);
        
        if (userRes.rows.length === 0 || userRes.rows[0].role !== "admin") {
            return res.status(403).json({ error: "Unauthorized. Admin access required." });
        }

        const subscribersRes = await pool.query(
            "SELECT subscriber_id, email, is_active, subscribed_at FROM subscribers ORDER BY subscriber_id ASC"
        );

        console.log("Subscribers fetched:", subscribersRes.rows.length);
        return res.json({ success: true, subscribers: subscribersRes.rows });
    } catch (error) {
        console.error("Get All Subscribers Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete a subscriber (admin only)
router.delete("/:id", protect, async (req, res) => {
    try {
        // Check if user is admin
        const userRes = await pool.query("SELECT role FROM users WHERE user_id = $1", [req.user.user_id]);
        
        if (userRes.rows.length === 0 || userRes.rows[0].role !== "admin") {
            return res.status(403).json({ error: "Unauthorized. Admin access required." });
        }

        const { id } = req.params;

        const deleteRes = await pool.query(
            "DELETE FROM subscribers WHERE subscriber_id = $1 RETURNING *",
            [id]
        );

        if (deleteRes.rows.length === 0) {
            return res.status(404).json({ error: "Subscriber not found" });
        }

        return res.json({ success: true, message: "Subscriber removed successfully" });
    } catch (error) {
        console.error("Delete Subscriber Error:", error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
});

module.exports = router;
