const pool = require("../db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/email");

// Config / defaults
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || "15m";
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || "7d";

// OTP lifetimes
const LOGIN_OTP_EXPIRES_MS = parseInt(process.env.LOGIN_OTP_EXPIRES_MS || `${5 * 60 * 1000}`, 10); // 5m
const RESET_OTP_EXPIRES_MS = parseInt(process.env.RESET_OTP_EXPIRES_MS || `${15 * 60 * 1000}`, 10); // 15m

// Register
exports.registerUser = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    if (!name || !phone || !email || !password) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const existing = await pool.query("SELECT 1 FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered!" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password, role)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING user_id, name, email, phone, role`,
      [name, email, phone, hashed, "user"]
    );

    try {
      await sendEmail(
        email,
        "Welcome to Our App 🎉",
        `<h2>Hi ${name},</h2><p>Your account has been created successfully.</p>`
      );
    } catch (e) {
      console.warn("Welcome email failed:", e);
    }

    return res.status(201).json({ 
        message: "User registered successfully!", user: result.rows[0] 
    });
  } catch (err) {
    console.error("registerUser error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Login (Step 1)
exports.loginUser = async (req, res) => {
  console.log("SECRET USED DURING SIGN:", `"${process.env.JWT_ACCESS_SECRET}"`, process.env.JWT_ACCESS_SECRET.length);

    try {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required!" });
    }
    
    const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userRes.rows.length === 0) {
        return res.status(400).json({ error: "User not found!" });
    }
    
    const user = userRes.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(400).json({ error: "Invalid password" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + LOGIN_OTP_EXPIRES_MS);

    await pool.query(
        "UPDATE users SET otp_code = $1, otp_expiry = $2 WHERE email = $3", 
        [otp, expiry, email]);

    // Send OTP
    try {
      await sendEmail(
        email,
        "Your Login OTP",
        `<p>Your login OTP is:</p><h2>${otp}</h2><p>Valid for ${Math.round(LOGIN_OTP_EXPIRES_MS / 60000)} minutes.</p>`
      );
    } catch (e) {
      console.warn("Login OTP email failed:", e);
    }

    return res.json({ 
        success: true, message: "OTP sent to your email. Enter OTP to continue.", 
        step: "OTP_REQUIRED" 
    });
  } catch (err) {
    console.error("loginUser error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Request OTP for resetting password
exports.requestPasswordResetOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "Email is required!" });
    }

    const userRes = await pool.query(
        "SELECT user_id, name, email FROM users WHERE email = $1", 
        [email]);
    
    if (userRes.rows.length === 0) {
        return res.status(404).json({ error: "Email not found!" });
    }
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + RESET_OTP_EXPIRES_MS);

    await pool.query(
        "UPDATE users SET otp_code = $1, otp_expiry = $2 WHERE email = $3", 
        [otp, expiry, email]);

    try {
      await sendEmail(
        email,
        "Your Password Reset OTP",
        `<p>Your OTP to reset your password is:</p><h2>${otp}</h2><p>It is valid for ${Math.round(RESET_OTP_EXPIRES_MS / 60000)} minutes.</p>`
      );
    } catch (e) {
      console.warn("Reset OTP email failed:", e);
    }

    return res.json({ success: true, message: "Password reset OTP sent to your email" });
  } catch (err) {
    console.error("requestPasswordResetOtp error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Verify OTP (common)
// Purpose: "login" -> issue tokens and CLEAR OTP (single-use)
// Purpose: "reset" -> validate OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;
    if (!email || !otp || !purpose) {
        return res.status(400).json({ error: "Email, OTP and purpose are required" });
    }

    if (!["login", "reset"].includes(purpose)) {
        return res.status(400).json({ error: "Invalid purpose" });
    }

    const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userRes.rows.length === 0) {
        return res.status(400).json({ error: "User not found!" });
    }

    const user = userRes.rows[0];

    if (!user.otp_code || user.otp_code !== otp) {
        return res.status(400).json({ error: "Invalid OTP!" });
    }

    if (new Date() > new Date(user.otp_expiry)) {
        return res.status(400).json({ error: "OTP expired!" });
    }

    if (purpose === "login") {
      // Clear OTP (single use)
      await pool.query(
        "UPDATE users SET otp_code = NULL, otp_expiry = NULL WHERE email = $1", 
        [email]);

      // Issue access + refresh tokens
      const accessToken = jwt.sign(
        { user_id: user.user_id, email: user.email, role: user.role },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: ACCESS_EXPIRES }
      );

      const refreshToken = jwt.sign(
        { user_id: user.user_id, email: user.email, role: user.role },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: REFRESH_EXPIRES }
      );

      return res.json({
        success: true,
        message: "OTP verified. Login successful.",
        accessToken,
        refreshToken,
        user: {
          user_id: user.user_id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    }

    // purpose === "reset": valid OTP; 
    return res.json({ success: true, message: "OTP verified. You may now reset your password." });
  } catch (err) {
    console.error("verifyOtp error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Reset Password
// Body: { email, otp, password }
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
        return res.status(400).json({ error: "Email, OTP and new password are required" });
    }

    const userRes = await pool.query("SELECT user_id, otp_code, otp_expiry FROM users WHERE email = $1", [email]);
    if (userRes.rows.length === 0) {
        return res.status(404).json({ error: "Email not found" });
    }

    const user = userRes.rows[0];

    if (otp !== user.otp_code) {
        return res.status(400).json({ error: "Invalid OTP" });
    }

    if (new Date() > new Date(user.otp_expiry)) {
        return res.status(400).json({ error: "OTP expired" });
    }

    // hash and update password
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
        "UPDATE users SET password = $1, otp_code = NULL, otp_expiry = NULL WHERE user_id = $2", 
        [hashed, user.user_id]);

    // Send email about password change
    try {
      await sendEmail(
        email,
        "Password Changed",
        `<p>Your password was successfully changed. If this wasn't you, contact support immediately.</p>`
      );
    } catch (e) {
      console.warn("Password change email failed:", e);
    }

    return res.json({ success: true, message: "Password reset successful. You can now log in." });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Change password for authenticated user
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user && req.user.user_id;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: "Old and new passwords are required" });
    }

    const userRes = await pool.query("SELECT * FROM users WHERE user_id = $1", [userId]);
    if (userRes.rows.length === 0) {
        return res.status(404).json({ error: "User not found!" });
    }

    const user = userRes.rows[0];
    const match = await bcrypt.compare(oldPassword, user.password);
    
    if (!match) {
        return res.status(400).json({ error: "Old password is incorrect!" });
    }
    
    if (oldPassword === newPassword) {
        return res.status(400).json({ error: "New password must be different" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query(
        "UPDATE users SET password = $1 WHERE user_id = $2", 
        [hashed, userId]);

    try {
      await sendEmail(user.email, "Password Changed", `<p>Your password was changed successfully.</p>`);
    } catch (e) {
      console.warn("Password changed email failed:", e);
    }

    return res.json({ success: true, message: "Password changed successfully!" });
  } catch (err) {
    console.error("changePassword error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Admin / user utilities 
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
        "SELECT user_id, name, email, phone, role FROM users ORDER BY user_id ASC");
    return res.json({ success: true, users: result.rows });
  } catch (err) {
    console.error("getAllUsers error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const exists = await pool.query("SELECT 1 FROM users WHERE user_id = $1", [userId]);
    if (exists.rows.length === 0) {
        return res.status(404).json({ error: "User not found!" });
    }

    await pool.query(
        "DELETE FROM users WHERE user_id = $1", 
        [userId]);
    
        return res.json({ success: true, message: "User deleted successfully!" });
  } catch (err) {
    console.error("deleteUser error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;
    if (!role || !["user", "admin"].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
    }

    const exists = await pool.query("SELECT 1 FROM users WHERE user_id = $1", [userId]);
    if (exists.rows.length === 0) {
        return res.status(404).json({ error: "User not found!" });
    }

    await pool.query("UPDATE users SET role = $1 WHERE user_id = $2", [role, userId]);
    return res.json({ success: true, message: "User role updated successfully!" });
  } catch (err) {
    console.error("updateUserRole error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user && req.user.user_id;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, phone, email } = req.body;

    const userRes = await pool.query(
        "SELECT * FROM users WHERE user_id = $1", 
        [userId]);
    if (userRes.rows.length === 0) {
        return res.status(404).json({ error: "User not found!" });
    }

    const user = userRes.rows[0];
    if (email && email !== user.email) {
      const emailCheck = await pool.query("SELECT 1 FROM users WHERE email = $1", [email]);
      
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: "Email already in use!" });
      }
    }

    const updated = await pool.query(
      `UPDATE users SET name = $1, email = $2, phone = $3 WHERE user_id = $4
       RETURNING user_id, name, email, phone, role`,
      [name || user.name, email || user.email, phone || user.phone, userId]
    );

    return res.json({ success: true, message: "Profile updated successfully!", user: updated.rows[0] });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Refresh token -> new access token 
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ error: "Refresh token required!" });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }

    const userId = decoded.user_id;
    const result = await pool.query("SELECT user_id, email, role, name FROM users WHERE user_id = $1", [userId]);
    if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found!" });
    }

    const user = result.rows[0];
    const newAccessToken = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: ACCESS_EXPIRES }
    );

    return res.json({ success: true, accessToken: newAccessToken });
  } catch (err) {
    console.error("refreshToken error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
