const express = require("express");
const router = express.Router();
const { sendEmail } = require("../utils/email"); // adjust path
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

module.exports = router;
