const pool = require("../db");
const { sendEmail } = require("../utils/email");

// Submit contact message (Public)
exports.submitMessage = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, countryCode, message } = req.body;

    // Validation
    if (!firstName || !lastName || !message) {
      return res.status(400).json({ error: "First name, last name, and message are required" });
    }

    if (!email && !phone) {
      return res.status(400).json({ error: "Either email or phone number is required" });
    }

    // Insert into database
    const result = await pool.query(
      `INSERT INTO contact_messages (first_name, last_name, email, country_code, phone, message)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING message_id, first_name, last_name, email, created_at`,
      [firstName, lastName, email || null, countryCode || null, phone || null, message]
    );

    const savedMessage = result.rows[0];

    // Send confirmation email to user if email provided
    if (email) {
      try {
        await sendEmail(
          email,
          "We received your message! 📬",
          `<h2>Hi ${firstName},</h2>
           <p>Thank you for contacting us! We have received your message and will get back to you soon.</p>
           <p><strong>Your message:</strong></p>
           <p style="background: #f5f5f5; padding: 15px; border-radius: 8px;">${message}</p>
           <p>Best regards,<br/>Beautiful Mess Team</p>`
        );
      } catch (e) {
        console.warn("Confirmation email failed:", e);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Message submitted successfully! We'll get back to you soon.",
      data: savedMessage
    });
  } catch (err) {
    console.error("submitMessage error:", err);
    return res.status(500).json({ error: "Failed to submit message" });
  }
};

// Get all contact messages (Admin only)
exports.getAllMessages = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT message_id, first_name, last_name, email, country_code, phone, message, replied, created_at
       FROM contact_messages
       ORDER BY created_at DESC`
    );

    return res.json({
      success: true,
      count: result.rows.length,
      messages: result.rows
    });
  } catch (err) {
    console.error("getAllMessages error:", err);
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// Mark message as replied (Admin only)
exports.markAsReplied = async (req, res) => {
  try {
    const { messageId } = req.params;

    const result = await pool.query(
      `UPDATE contact_messages
       SET replied = true
       WHERE message_id = $1
       RETURNING message_id, replied`,
      [messageId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    return res.json({
      success: true,
      message: "Message marked as replied",
      data: result.rows[0]
    });
  } catch (err) {
    console.error("markAsReplied error:", err);
    return res.status(500).json({ error: "Failed to update message" });
  }
};

// Send reply email (Admin only)
exports.sendReply = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { replyMessage } = req.body;

    if (!replyMessage) {
      return res.status(400).json({ error: "Reply message is required" });
    }

    // Get the contact message
    const messageResult = await pool.query(
      `SELECT * FROM contact_messages WHERE message_id = $1`,
      [messageId]
    );

    if (messageResult.rows.length === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    const contactMessage = messageResult.rows[0];

    if (!contactMessage.email) {
      return res.status(400).json({ error: "No email address available for this message" });
    }

    // Send reply email
    try {
      await sendEmail(
        contactMessage.email,
        "Re: Your message to us",
        `<h2>Hi ${contactMessage.first_name},</h2>
         <p>${replyMessage}</p>
         <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;"/>
         <p style="color: #666; font-size: 0.9em;"><strong>Your original message:</strong></p>
         <p style="background: #f5f5f5; padding: 15px; border-radius: 8px; color: #666;">${contactMessage.message}</p>
         <p>Best regards,<br/>The Team</p>`
      );

      // Mark as replied
      await pool.query(
        `UPDATE contact_messages SET replied = true WHERE message_id = $1`,
        [messageId]
      );

      return res.json({
        success: true,
        message: "Reply sent successfully"
      });
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);
      return res.status(500).json({ error: "Failed to send email" });
    }
  } catch (err) {
    console.error("sendReply error:", err);
    return res.status(500).json({ error: "Failed to send reply" });
  }
};
