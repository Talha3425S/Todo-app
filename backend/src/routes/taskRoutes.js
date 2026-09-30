const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const validateId = require("../middleware/validateId");

const {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    updateTaskStatus,
    deleteTask,
    getTaskStats,
} = require("../controllers/taskController");

const {
    createTaskSchema,
    updateTaskSchema,
    statusSchema,
} = require("../middleware/validationSchemas");

const router = express.Router();

// Reject non-numeric ids with a 400 instead of a database error
router.param("id", validateId);

// ======================================================
// AUTHENTICATION
// ======================================================

router.use(authenticate);

// ======================================================
// CREATE
// ======================================================

router.post(
    "/",
    validate(createTaskSchema),
    createTask
);

// ======================================================
// GET ALL
// ======================================================

router.get(
    "/",
    getTasks
);

// ======================================================
// STATISTICS
// IMPORTANT: MUST BE BEFORE /:id
// ======================================================

router.get(
    "/stats",
    getTaskStats
);

// ======================================================
// GET ONE
// ======================================================

router.get(
    "/:id",
    getTaskById
);

// ======================================================
// UPDATE
// ======================================================

router.put(
    "/:id",
    validate(updateTaskSchema),
    updateTask
);

// ======================================================
// STATUS
// ======================================================

router.patch(
    "/:id/status",
    validate(statusSchema),
    updateTaskStatus
);

// ======================================================
// DELETE
// ======================================================

router.delete(
    "/:id",
    deleteTask
);

module.exports = router;