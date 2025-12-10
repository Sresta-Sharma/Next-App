const express = require("express");
const router = express.Router();
const { sendEmail } = require("../utils/email"); // adjust path

router.post("/", async (req, res) => {
    try {
        const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
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
