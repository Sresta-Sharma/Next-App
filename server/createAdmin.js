const bcrypt = require('bcrypt');
const pool = require('./db');

(async () => {
    try {
        const name = "Admin";
        const email = "admin@example.com";
        const password = "admin_123password";
        const phone = "9768426096";
        const role = "admin";

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `INSERT INTO users (name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
        `;

        const result = await pool.query(query, 
            [name, email, phone, hashedPassword, role,
            ]);

        console.log("Admin user created:", result.rows[0]);
    } catch (error) {
        console.error("Error creating admin user:", error.message);
} finally {
    process.exit();
}
})();

