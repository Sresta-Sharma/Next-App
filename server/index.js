const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");

const app = express();

app.use(
  cors({
    origin: [
      // local dev
      "http://localhost:3000",
      // backend self-call & prod
      "http://localhost:5000",
      "https://next-app-indol-one.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// app.options("*");
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
app.use("/api/auth", authRoutes);

// Import blog routes
const blogRoutes = require("./routes/blogRoutes");
app.use("/api/blog", blogRoutes);

// Import subscribe routes
const subscribeRoutes = require("./routes/subscribeRoutes");
app.use("/api/subscribe", subscribeRoutes);

// Import draft routes
const draftRoutes = require("./routes/draftRoutes");
app.use("/api/drafts", draftRoutes);

// Serve uploaded images statically
app.use("/uploads", express.static("public/uploads"));

// Import upload routes
const uploadRoutes = require("./routes/uploadRoutes");
app.use("/api/upload-image", uploadRoutes);

//Root /
app.get("/", (req, res) => {
    res.send("Backend server is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});