const express = require("express");

const pool = require("../config/db");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, created_at
             FROM users
             WHERE id = $1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.json({
            user: result.rows[0],
        });
    } catch (error) {
        console.error("Get user error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
});

module.exports = router;