const pool = require("../config/db");

// ======================================================
// CHECK CATEGORY BELONGS TO USER
// ======================================================

const getUserCategory = async (categoryId, userId) => {
    if (
        categoryId === null ||
        categoryId === undefined ||
        categoryId === ""
    ) {
        return true;
    }

    const result = await pool.query(
        `
        SELECT id
        FROM categories
        WHERE id = $1
        AND user_id = $2
        `,
        [categoryId, userId]
    );

    return result.rows.length > 0;
};

// ======================================================
// GET TASK WITH CATEGORY
// ======================================================

const getTaskWithCategory = async (
    taskId,
    userId
) => {
    const result = await pool.query(
        `
        SELECT
            t.id,
            t.user_id,
            t.category_id,
            t.title,
            t.description,
            t.status,
            t.priority,
            t.due_date,
            t.created_at,
            t.updated_at,
            c.name AS category_name
        FROM tasks t
        LEFT JOIN categories c
            ON t.category_id = c.id
        WHERE t.id = $1
        AND t.user_id = $2
        `,
        [taskId, userId]
    );

    return result.rows[0];
};

// ======================================================
// CREATE TASK
// ======================================================

const createTask = async (
    req,
    res,
    next
) => {
    try {
        const userId = req.user.id;

        const {
            title,
            description,
            priority,
            due_date,
            category_id,
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message:
                    "Task title is required",
            });
        }

        if (
            !(await getUserCategory(
                category_id,
                userId
            ))
        ) {
            return res.status(400).json({
                message:
                    "Invalid category",
            });
        }

        const result =
            await pool.query(
                `
                INSERT INTO tasks
                (
                    user_id,
                    category_id,
                    title,
                    description,
                    priority,
                    due_date
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
                `,
                [
                    userId,
                    category_id || null,
                    title.trim(),
                    description || null,
                    priority || "medium",
                    due_date || null,
                ]
            );

        const task =
            await getTaskWithCategory(
                result.rows[0].id,
                userId
            );

        res.status(201).json({
            message:
                "Task created successfully",
            task,
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET TASKS
// ======================================================

const getTasks = async (
    req,
    res,
    next
) => {
    try {
        const userId = req.user.id;

        const {
            status,
            priority,
            category_id,
            search,
            due,
            sort = "created_at",
            order = "desc",
            page = 1,
            limit = 10,
        } = req.query;

        const allowedSortColumns = [
            "created_at",
            "updated_at",
            "due_date",
            "title",
            "priority",
            "status",
        ];

        const safeSort =
            allowedSortColumns.includes(
                sort
            )
                ? sort
                : "created_at";

        const safeOrder =
            ["asc", "desc"].includes(
                String(order).toLowerCase()
            )
                ? String(order).toLowerCase()
                : "desc";

        const pageNumber = Math.max(
            parseInt(page, 10) || 1,
            1
        );

        const limitNumber = Math.min(
            Math.max(
                parseInt(limit, 10) || 10,
                1
            ),
            100
        );

        const offset =
            (pageNumber - 1) *
            limitNumber;

        const conditions = [
            "t.user_id = $1",
        ];

        const values = [userId];

        let parameterIndex = 2;

        // ==================================================
        // STATUS FILTER
        // ==================================================

        if (status) {
            conditions.push(
                `t.status = $${parameterIndex}`
            );

            values.push(status);
            parameterIndex++;
        }

        // ==================================================
        // PRIORITY FILTER
        // ==================================================

        if (priority) {
            conditions.push(
                `t.priority = $${parameterIndex}`
            );

            values.push(priority);
            parameterIndex++;
        }

        // ==================================================
        // CATEGORY FILTER
        // ==================================================

        if (category_id) {
            const parsedCategoryId =
                Number(category_id);

            if (
                !Number.isInteger(
                    parsedCategoryId
                ) ||
                parsedCategoryId <= 0
            ) {
                return res.status(400).json({
                    message:
                        "Invalid category ID",
                });
            }

            conditions.push(
                `t.category_id = $${parameterIndex}`
            );

            values.push(
                parsedCategoryId
            );

            parameterIndex++;
        }

        // ==================================================
        // SEARCH
        // ==================================================

        if (search) {
            conditions.push(
                `(
                    t.title ILIKE $${parameterIndex}
                    OR COALESCE(
                        t.description,
                        ''
                    ) ILIKE $${parameterIndex}
                )`
            );

            values.push(
                `%${search}%`
            );

            parameterIndex++;
        }

        // ==================================================
        // DUE DATE FILTER
        // ==================================================

        if (due) {
            if (due === "overdue") {
                conditions.push(`
                    t.due_date IS NOT NULL
                    AND t.due_date < CURRENT_TIMESTAMP
                    AND t.status != 'completed'
                `);
            } else if (
                due === "today"
            ) {
                conditions.push(`
                    t.due_date IS NOT NULL
                    AND t.due_date >= CURRENT_DATE
                    AND t.due_date <
                        CURRENT_DATE + INTERVAL '1 day'
                `);
            } else if (
                due === "upcoming"
            ) {
                conditions.push(`
                    t.due_date IS NOT NULL
                    AND t.due_date >= CURRENT_TIMESTAMP
                `);
            } else {
                return res.status(400).json({
                    message:
                        "Invalid due date filter",
                });
            }
        }

        const whereClause =
            conditions.join(" AND ");

        // ==================================================
        // COUNT
        // ==================================================

        const countResult =
            await pool.query(
                `
                SELECT COUNT(*) AS total
                FROM tasks t
                WHERE ${whereClause}
                `,
                values
            );

        const total = Number(
            countResult.rows[0].total
        );

        const totalPages =
            total === 0
                ? 1
                : Math.ceil(
                    total /
                    limitNumber
                );

        // ==================================================
        // TASKS
        // ==================================================

        const result =
            await pool.query(
                `
                SELECT
                    t.id,
                    t.user_id,
                    t.category_id,
                    t.title,
                    t.description,
                    t.status,
                    t.priority,
                    t.due_date,
                    t.created_at,
                    t.updated_at,
                    c.name AS category_name
                FROM tasks t
                LEFT JOIN categories c
                    ON t.category_id = c.id
                WHERE ${whereClause}
                ORDER BY
                    t.${safeSort}
                    ${safeOrder}
                    ${
                        safeSort ===
                        "due_date"
                            ? " NULLS LAST"
                            : ""
                    }
                LIMIT $${parameterIndex}
                OFFSET $${parameterIndex + 1}
                `,
                [
                    ...values,
                    limitNumber,
                    offset,
                ]
            );

        res.status(200).json({
            success: true,

            tasks: result.rows,

            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                totalPages,

                hasNextPage:
                    pageNumber <
                    totalPages,

                hasPreviousPage:
                    pageNumber > 1,
            },
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET ONE TASK
// ======================================================

const getTaskById = async (
    req,
    res,
    next
) => {
    try {
        const userId = req.user.id;
        const taskId = req.params.id;

        const task =
            await getTaskWithCategory(
                taskId,
                userId
            );

        if (!task) {
            return res.status(404).json({
                message:
                    "Task not found",
            });
        }

        res.json({
            task,
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// UPDATE TASK
// ======================================================

const updateTask = async (
    req,
    res,
    next
) => {
    try {
        const userId = req.user.id;
        const taskId = req.params.id;

        const {
            title,
            description,
            priority,
            due_date,
            category_id,
            status,
        } = req.body;

        // ----------------------------------------------
        // CATEGORY OWNERSHIP
        // ----------------------------------------------

        if (
            category_id !== undefined &&
            !(await getUserCategory(
                category_id,
                userId
            ))
        ) {
            return res.status(400).json({
                message:
                    "Invalid category",
            });
        }

        const fields = [];
        const values = [];

        let index = 1;

        // ----------------------------------------------
        // TITLE
        // ----------------------------------------------

        if (title !== undefined) {
            fields.push(
                `title = $${index++}`
            );

            values.push(
                title.trim()
            );
        }

        // ----------------------------------------------
        // DESCRIPTION
        // ----------------------------------------------

        if (
            description !== undefined
        ) {
            fields.push(
                `description = $${index++}`
            );

            values.push(
                description === ""
                    ? null
                    : description
            );
        }

        // ----------------------------------------------
        // PRIORITY
        // ----------------------------------------------

        if (priority !== undefined) {
            fields.push(
                `priority = $${index++}`
            );

            values.push(priority);
        }

        // ----------------------------------------------
        // DUE DATE
        // ----------------------------------------------

        if (due_date !== undefined) {
            fields.push(
                `due_date = $${index++}`
            );

            values.push(
                due_date || null
            );
        }

        // ----------------------------------------------
        // CATEGORY
        // ----------------------------------------------

        if (
            category_id !== undefined
        ) {
            fields.push(
                `category_id = $${index++}`
            );

            values.push(
                category_id || null
            );
        }

        // ----------------------------------------------
        // STATUS
        // ----------------------------------------------

        if (status !== undefined) {
            fields.push(
                `status = $${index++}`
            );

            values.push(status);
        }

        if (fields.length === 0) {
            return res.status(400).json({
                message:
                    "No fields to update",
            });
        }

        fields.push(
            "updated_at = CURRENT_TIMESTAMP"
        );

        const taskIdIndex = index;
        const userIdIndex =
            index + 1;

        values.push(taskId);
        values.push(userId);

        const result =
            await pool.query(
                `
                UPDATE tasks
                SET ${fields.join(", ")}
                WHERE id = $${taskIdIndex}
                AND user_id = $${userIdIndex}
                RETURNING id
                `,
                values
            );

        if (
            result.rows.length === 0
        ) {
            return res.status(404).json({
                message:
                    "Task not found",
            });
        }

        const task =
            await getTaskWithCategory(
                taskId,
                userId
            );

        res.json({
            message:
                "Task updated successfully",
            task,
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// UPDATE STATUS
// ======================================================

const updateTaskStatus = async (
    req,
    res,
    next
) => {
    try {
        const userId = req.user.id;
        const taskId = req.params.id;

        const { status } =
            req.body;

        const result =
            await pool.query(
                `
                UPDATE tasks
                SET
                    status = $1,
                    updated_at =
                        CURRENT_TIMESTAMP
                WHERE id = $2
                AND user_id = $3
                RETURNING id
                `,
                [
                    status,
                    taskId,
                    userId,
                ]
            );

        if (
            result.rows.length === 0
        ) {
            return res.status(404).json({
                message:
                    "Task not found",
            });
        }

        const task =
            await getTaskWithCategory(
                taskId,
                userId
            );

        res.json({
            message:
                "Task status updated",
            task,
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// DELETE TASK
// ======================================================

const deleteTask = async (
    req,
    res,
    next
) => {
    try {
        const userId = req.user.id;
        const taskId = req.params.id;

        const result =
            await pool.query(
                `
                DELETE FROM tasks
                WHERE id = $1
                AND user_id = $2
                RETURNING id
                `,
                [
                    taskId,
                    userId,
                ]
            );

        if (
            result.rows.length === 0
        ) {
            return res.status(404).json({
                message:
                    "Task not found",
            });
        }

        res.json({
            message:
                "Task deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// TASK STATISTICS
// ======================================================

const getTaskStats = async (
    req,
    res,
    next
) => {
    try {
        const userId = req.user.id;

        const result =
            await pool.query(
                `
                SELECT
                    COUNT(*)::INTEGER
                        AS total,

                    COUNT(*) FILTER (
                        WHERE status =
                            'pending'
                    )::INTEGER
                        AS pending,

                    COUNT(*) FILTER (
                        WHERE status =
                            'completed'
                    )::INTEGER
                        AS completed,

                    COUNT(*) FILTER (
                        WHERE priority =
                            'high'
                    )::INTEGER
                        AS high_priority,

                    COUNT(*) FILTER (
                        WHERE status =
                            'pending'
                        AND due_date IS NOT NULL
                        AND due_date < CURRENT_TIMESTAMP
                    )::INTEGER AS overdue

                FROM tasks

                WHERE user_id = $1
                `,
                [userId]
            );

        res.json({
            success: true,
            stats: result.rows[0],
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    updateTaskStatus,
    deleteTask,
    getTaskStats,
};