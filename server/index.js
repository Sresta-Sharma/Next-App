const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");

const app = express();

app.use(cors()); //Middleware
app.use(express.json()); //Parse JSON bodies

//To test if it works
app.get("/api/test", async(req, res) => {
    try{
        const result = await pool.query("SELECT NOW()");
        res.json({
            message: "Server is running!",
            time: result.rows[0],
        });
    } catch(error){
        console.error("Database error: ",error);
        res.status(500).json({error: "Internal Server Error!"});
    };
});

// Import auth routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes)

// Import blog routes
const blogRoutes = require("./routes/blogRoutes");
app.use("/api/blog", blogRoutes)

//Root /
app.get("/", (req, res) => {
    res.send("Backend server is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});