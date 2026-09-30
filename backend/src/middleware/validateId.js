// Used with router.param("id", validateId)
const validateId = (req, res, next, id) => {
    const value = Number(id);

    if (!/^\d+$/.test(id) || value < 1 || value > 2147483647) {
        return res.status(400).json({ message: "Invalid ID" });
    }

    next();
};

module.exports = validateId;