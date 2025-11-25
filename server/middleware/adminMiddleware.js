const jwt = require("jsonwebtoken");

function verifyAdmin(req, res, next) {
    try{
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized!" });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "admin") {
            return res.status(403).json({ error: "Forbidden! Admins only." });
        }

        req.user = decoded;  // store user info for later use
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token!" });
    }
}

module.exports = verifyAdmin;