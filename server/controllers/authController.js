const pool = require("../db");
const bcrypt = require("bcrypt");
const { use } = require("react");
const { json } = require("stream/consumers");

// Register User
exports.registerUser = async (req,res) => {
    console.log(req.body);

    try{
        const { name, phone, email, password } = req.body;

        // 1. Check missing fields
        if (!name || !email || !phone || !password){
            return res.status(400).json({error: "All fields are required!"});
        }

        // 2. Check if user already exists
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0){
            return res.status(400).json({error: "Email already registered!"});
        }

        // 3. Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Insert new user
        const newUser = await pool.query(
            `INSERT INTO users (name, email, phone, password, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING user_id, name, email, phone, role`,
            [name, email, phone, hashedPassword, "user"]
        );

        // 5. Send success
        res.status(201).json({
            message: "User registerd successfully!",
            user: newUser.rows[0]
        });
    } catch(e) {
        console.error("Registration error: ",e);
        res.status(500).json({error: "Internal server error!"});
    }
};

// Login User
exports.loginUser = async (req,res) => {
    try{
       const { email, password } = req.body;

       // 1. Check missing fields
       if (!email || !password){
        return res.status(400).json({ error: "Email and password required!" })
       }

       // 2. Check if user exists
       const user = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
       );

       if (user.rows.length === 0){
        return res.status(400).json({error: "User not found!"});
       }

       const storedUser = user.rows[0];

       // 3. Compare password
       const validPassword = await bcrypt.compare(password, storedUser.password);

       if (!validPassword) {
        return res.status(400).json({ error: "Invalid password" });
       }

       // 4. JWT Token
       const jwt = require("jsonwebtoken");

       const token = jwt.sign(
        { user_id: storedUser.user_id, email: storedUser.email, role: storedUser.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h"}
       );
       
       // 5. Login success
       res.json({
        success: true,
        message: "Login successful!",
        token,
        user: {
            user_id: storedUser.user_id,
            name: storedUser.name,
            email: storedUser.email,
            phone: storedUser.phone,
            role: storedUser.role
        }
       });
    } catch(e) {
        console.error("Login Error: ", e);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
    try{
        const users = await pool.query(
            "SELECT user_id, name, email, phone, role FROM users ORDER BY user_id ASC"
        );

        res.json({ 
            success: true,
            users: users.rows 
        });
    } catch(e) {
        console.error("Get All Users Error: ", e);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Check if user exists
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE user_id = $1",
            [userId]
        );

        if (existingUser.rows.length === 0) {
            return res.status(404).json({ error: "User not found!" });
        }

        // Delete user
        await pool.query(
            "DELETE FROM users WHERE user_id = $1",
            [userId]
        );

        res.json({ success: true, message: "User deleted successfully!" });
    } catch (e) {
        console.error("Delete User Error: ", e);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const userId = req.params.id;
        const { role } = req.body;

        // Validate role
        if(!role) {
            return res.status(400).json({ error: "Role is required!" });
        }

        // if(role !== "user" && role !== "admin"):
        if(!["user", "admin"].includes(role)) {
            return res.status(400).json({ error: "Invalid role specified!" });
        }

        // Check if user exists
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE user_id = $1",
            [userId]
        );

        if (existingUser.rows.length === 0) {
            return res.status(404).json({ error: "User not found!" });
        }

        // Update user role
        await pool.query(
            "UPDATE users SET role = $1 WHERE user_id = $2",
            [role, userId]
        );

        res.json({ success: true, message: "User role updated successfully!" });
    } catch (e) {
        console.error("Update User Role Error: ", e);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.updateProfile = async (req, res) => {
    const userId = req.user.user_id;
    const { name, phone, email } = req.body;

    try {
        const userResult = await pool.query(
            "SELECT * FROM users WHERE user_id = $1",
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found!" });
        }

        const user = userResult.rows[0];

        // Check if email is being updated to an already existing email
        if (email && email !== user.email) {
            const emailCheck = await pool.query(
                "SELECT * FROM users WHERE email = $1",
                [email]
            );

            if (emailCheck.rows.length > 0) {
                return res.status(400).json({ error: "Email already in use!" });
            }
        }

        const updatedUser = await pool.query(
            `UPDATE users 
             SET name = $1, email = $2, phone = $3
             WHERE user_id = $4
             RETURNING user_id, name, email, phone, role`,
            [name || user.name, 
             email || user.email, 
             phone || user.phone, 
             userId]
        );

        res.json({ 
            message: "Profile updated successfully!", 
            user: updatedUser.rows[0] 
        });
    } catch (e) {
        console.error("Update Profile Error: ", e);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.changePassword = async (req, res) => {
    const userId = req.user.user_id;
    const { oldPassword, newPassword } = req.body;

    try {
        
        // Fetch user from DB
        const userResult = await pool.query(
            "SELECT * FROM users WHERE user_id = $1",
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found!" });
        }

        const user = userResult.rows[0];

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: "Old password is incorrect!" });
        }

        // Prevent reusing the same password
        if (oldPassword === newPassword) {
            return res.status(400).json({ error: "New password must be different from old password!" });
        }
        
        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update password in DB
        await pool.query(
            "UPDATE users SET password = $1 WHERE user_id = $2",
            [hashedNewPassword, userId]
        );

        // Success response
        res.json({ message: "Password changed successfully!" });
    } catch (e) {
        console.error("Change Password Error: ", e);
        res.status(500).json({ error: "Internal server error" });
    }
};

