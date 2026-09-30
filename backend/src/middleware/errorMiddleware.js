const errorMiddleware = (err, req, res, next) => {
    console.error(err);

    // PostgreSQL unique violation
    if (err.code === "23505") {
        return res.status(409).json({
            message: "Duplicate value already exists",
        });
    }

    // PostgreSQL foreign key violation
    if (err.code === "23503") {
        return res.status(400).json({
            message: "Referenced resource does not exist",
        });
    }

    // Default error
    res.status(err.statusCode || 500).json({
        message:
            err.message || "Internal server error",
    });
};

module.exports = errorMiddleware;