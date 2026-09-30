const express = require("express");

const {
    register,
    login,
} = require("../controllers/authController");

const validate = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter");

const {
    registerSchema,
    loginSchema,
} = require("../middleware/validationSchemas");

const router = express.Router();

router.post(
    "/register",
    authLimiter,
    validate(registerSchema),
    register
);

router.post(
    "/login",
    authLimiter,
    validate(loginSchema),
    login
);

module.exports = router;