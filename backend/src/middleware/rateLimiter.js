const rateLimit = require("express-rate-limit");

// Limits login/register attempts per IP to slow down brute-force attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20, // express-rate-limit v7
    max: 20,   // express-rate-limit v6
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many attempts. Please try again in 15 minutes.",
    },
});

module.exports = { authLimiter };