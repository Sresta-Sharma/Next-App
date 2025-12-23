const pool = require("../db");
const { sendBulkEmail } = require("../utils/email");

// To check if user is author or admin
const isOwnerOrAdmin = (user, ownerId) => {
    if (!user) return false;
    return user.role === 'admin' || user.user_id === ownerId;
};

// Create a new blog post
exports.createBlog = async (req, res) => {
    const userId = req.user.user_id;
    const { title, content } = req.body;

    if (!title?.trim() || !content) {
        return res.status(400).json({ error: "Title and content are required!" });
    }

    try{
        const result = await pool.query(
            `INSERT INTO blogs (user_id, title, content) 
             VALUES ($1, $2, $3)
             RETURNING *`,
            [userId, title.trim(), content]
        );

        const newBlog = result.rows[0];

        // Get author name for the email
        const authorResult = await pool.query(
            "SELECT name FROM users WHERE user_id = $1",
            [userId]
        );
        const authorName = authorResult.rows[0]?.name || "Unknown Author";

        // Send notification emails to all active subscribers (async, don't wait)
        notifySubscribers(newBlog, authorName).catch(err => {
            console.error("Error notifying subscribers:", err);
        });

        return res.status(201).json({ message: "Blog created", newBlog });
    } catch(error){
        console.error("Error creating blog: ", error);
        return res.status(500).json({ error: "Internal Server Error!" });
    }
};

// Helper function to notify subscribers about new blog
async function notifySubscribers(blog, authorName) {
    try {
        // Get all active subscribers
        const subscribers = await pool.query(
            "SELECT email FROM subscribers WHERE is_active = TRUE"
        );

        if (subscribers.rows.length === 0) {
            console.log("No active subscribers to notify");
            return;
        }

        const emails = subscribers.rows.map(row => row.email);
        
        // Create a short preview of the content (first 200 characters)
        const contentPreview = blog.content
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .substring(0, 200) + '...';

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">New Blog Post Available!</h2>
                <h3 style="color: #555;">${blog.title}</h3>
                <p style="color: #666;">By ${authorName}</p>
                <p style="color: #777; line-height: 1.6;">${contentPreview}</p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/blogs/${blog.blog_id}" 
                   style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px;">
                    Read Full Article
                </a>
                <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
                <p style="color: #999; font-size: 12px;">
                    You're receiving this email because you subscribed to Beautiful Mess.
                </p>
            </div>
        `;

        const subject = `New Post: ${blog.title}`;
        
        console.log(`Sending notifications to ${emails.length} subscribers...`);
        const results = await sendBulkEmail(emails, subject, html);
        console.log(`Notification results: ${results.success} sent, ${results.failed} failed`);
    } catch (error) {
        console.error("Error in notifySubscribers:", error);
        throw error;
    }
}

// Get all blog posts (with simple pagination)
exports.getAllBlogs = async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    try{
        const totalRes = await pool.query("SELECT COUNT(*) FROM blogs");
        const total = Number(totalRes.rows[0].count);

        const result = await pool.query(
            `SELECT b.blog_id, b.title, b.created_at, u.name AS author_name 
             FROM blogs b
             JOIN users u ON b.user_id = u.user_id
             ORDER BY b.created_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        return res.json({
            page,
            limit,
            total,
            blogs: result.rows,
        });
    } catch(error){
        console.error("Error fetching blogs: ", error);
        return res.status(500).json({ error: "Internal Server Error!"});
    }
};

// Get a single blog post by ID
exports.getBlogById = async (req, res) => {
    const blogId = req.params.id;

    try{
        const result = await pool.query(
            `SELECT b.blog_id, b.title, b.content, b.created_at, b.updated_at, u.user_id AS author_id, u.name AS author_name 
             FROM blogs b
             JOIN users u ON b.user_id = u.user_id
             WHERE b.blog_id = $1`,
            [blogId]
        );

        if(result.rows.length === 0){
            return res.status(404).json({ error: "Blog not found!" });
        }

        return res.json({ blog: result.rows[0] });
    } catch(error){
        console.error("Error fetching blog: ", error);
        return res.status(500).json({ error: "Internal Server Error!" });
    }
};

// Update a blog post (only by author or admin)
exports.updateBlog = async (req, res) => {
    const blogId = req.params.id;
    const { title, content } = req.body;

    try {
        // Fetch existing blog
        const existing = await pool.query("SELECT * FROM blogs WHERE blog_id = $1", [blogId]);
        if (existing.rows.length === 0){
            return res.status(404).json({ error: "Blog not found!" });
        }

        const blog = existing.rows[0];

        // Check if the user is the author or admin
        if (!isOwnerOrAdmin(req.user, blog.user_id)) {
            return res.status(403).json({ message: "Forbidden! Not authorized to update this blog." });
        }

        const newTitle = title?.trim() || blog.title;
        const newContent = content || blog.content;
        
        // Update fields if provided
        const updated = await pool.query(
            `UPDATE blogs 
             SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP
             WHERE blog_id = $3
             RETURNING blog_id, user_id, title, content, created_at, updated_at`,
            [newTitle, newContent, blogId]
        );

        return res.json({ message: "Blog updated", blog: updated.rows[0] });
    } catch (error) {
        console.error("Error updating blog: ", error);
        return res.status(500).json({ error: "Internal Server Error!" });
    }
};
  
        // Delete a blog post (only by author or admin)
exports.deleteBlog = async (req, res) => {
    const blogId = req.params.id;

    try {
        // Fetch existing blog
        const existing = await pool.query("SELECT * FROM blogs WHERE blog_id = $1", [blogId]);
        if (existing.rows.length === 0){
            return res.status(404).json({ error: "Blog not found!" });
        }

        const blog = existing.rows[0];

        // Check if the user is the author or admin
        if (!isOwnerOrAdmin(req.user, blog.user_id)) {
            return res.status(403).json({ message: "Forbidden! Not authorized to delete this blog." });
        }       

        // Delete the blog
        await pool.query("DELETE FROM blogs WHERE blog_id = $1", [blogId]);
        return res.json({ message: "Blog deleted" });
    } catch (error) {
            console.error("Error deleting blog: ", error);
            return res.status(500).json({ error: "Internal Server Error!" });
        }
};

// Get blogs of the logged-in user
exports.getMyBlogs = async (req, res) => {
    const userId = req.user.user_id;
    try {
        const result = await pool.query(
            `SELECT blog_id, title, content, created_at, updated_at 
             FROM blogs 
             WHERE user_id = $1
             ORDER BY created_at DESC`,
             [userId]
            );
        return res.json({ blogs: result.rows });
    } catch (error) {
        console.error("Error fetching user's blogs: ", error);
        return res.status(500).json({ error: "Internal Server Error!" });
        }
};



