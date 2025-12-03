const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    console.log("HEX SECRET:", Buffer.from(process.env.JWT_ACCESS_SECRET).toString("hex"));
    console.log("LENGTH:", process.env.JWT_ACCESS_SECRET.length);



    
    try{
        // Verify and decode token
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        // Attach user data to the req object
        req.user = decoded;

        return next(); // continue to protected route
    } catch(err){
        console.log("Token error: ",err.message);
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};

module.exports = protect;