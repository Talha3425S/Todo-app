const express = require("express");

const authenticate = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const validateId = require("../middleware/validateId");

const {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory,
} = require("../controllers/categoryController");

const {
    categorySchema,
} = require("../middleware/validationSchemas");

const router = express.Router();

// Reject non-numeric ids with a 400 instead of a database error
router.param("id", validateId);

router.use(authenticate);

router.post(
    "/",
    validate(categorySchema),
    createCategory
);

router.get("/", getCategories);

router.put(
    "/:id",
    validate(categorySchema),
    updateCategory
);

router.delete("/:id", deleteCategory);

module.exports = router;