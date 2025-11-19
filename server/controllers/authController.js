const { error } = require("console");
const pool = require("../db");
const bcrypt = require("bcrypt");
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
            `INSERT INTO users (name, email, phone, password)
            VALUES ($1, $2, $3, $4)
            RETURNING user_id, name, email, phone`,
            [name, email, phone, hashedPassword]
        );

        // 5. Send success
        res.status(201).json({
            message: "User registerd successfully!",
            user: newUser.rows[0]
        });
    } catch(error) {
        console.error("Registration error: ",error);
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
        { user_id: storedUser.user_id, email: storedUser.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h"}
       );
       
       // 5. Login success
       res.json({
        message: "Login successful!",
        token,
        user: {
            user_id: storedUser.user_id,
            name: storedUser.name,
            email: storedUser.email,
            phone: storedUser.phone
        }
       });
    } catch(error) {
        console.error("Login Error: ", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
