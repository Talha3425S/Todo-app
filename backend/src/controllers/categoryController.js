const pool = require("../config/db");

// CREATE CATEGORY
const createCategory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const name = req.body.name?.trim();

        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }

        const result = await pool.query(
            `INSERT INTO categories (user_id, name)
             VALUES ($1, $2)
             RETURNING id, user_id, name, created_at`,
            [userId, name]
        );

        res.status(201).json({
            message: "Category created successfully",
            category: { ...result.rows[0], task_count: 0 },
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({ message: "Category already exists" });
        }
        next(error);
    }
};

// GET CATEGORIES
const getCategories = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT
                c.id,
                c.name,
                c.created_at,
                COUNT(t.id)::INTEGER AS task_count
             FROM categories c
             LEFT JOIN tasks t
                ON c.id = t.category_id AND t.user_id = $1
             WHERE c.user_id = $1
             GROUP BY c.id
             ORDER BY c.name ASC`,
            [userId]
        );

        res.json({
            count: result.rows.length,
            categories: result.rows,
        });
    } catch (error) {
        next(error);
    }
};

// UPDATE CATEGORY
const updateCategory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const categoryId = req.params.id;
        const name = req.body.name?.trim();

        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }

        const result = await pool.query(
            `UPDATE categories
             SET name = $1
             WHERE id = $2 AND user_id = $3
             RETURNING id, user_id, name, created_at`,
            [name, categoryId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Category not found" });
        }

        const countResult = await pool.query(
            `SELECT COUNT(*)::INTEGER AS task_count
             FROM tasks WHERE category_id = $1 AND user_id = $2`,
            [categoryId, userId]
        );

        res.json({
            message: "Category updated successfully",
            category: {
                ...result.rows[0],
                task_count: countResult.rows[0].task_count,
            },
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({ message: "Category already exists" });
        }
        next(error);
    }
};

// DELETE CATEGORY
const deleteCategory = async (req, res, next) => {
    const client = await pool.connect();

    try {
        const userId = req.user.id;
        const categoryId = req.params.id;

        await client.query("BEGIN");

        const categoryResult = await client.query(
            `SELECT id FROM categories WHERE id = $1 AND user_id = $2 FOR UPDATE`,
            [categoryId, userId]
        );

        if (categoryResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Category not found" });
        }

        // Keep tasks and remove only their category assignment.
        await client.query(
            `UPDATE tasks
             SET category_id = NULL, updated_at = CURRENT_TIMESTAMP
             WHERE category_id = $1 AND user_id = $2`,
            [categoryId, userId]
        );

        await client.query(
            `DELETE FROM categories WHERE id = $1 AND user_id = $2`,
            [categoryId, userId]
        );

        await client.query("COMMIT");

        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        await client.query("ROLLBACK");
        next(error);
    } finally {
        client.release();
    }
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory,
};
