const Joi = require("joi");

const registerSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),

    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .max(255)
        .required(),

    password: Joi.string()
        .min(6)
        .max(100)
        .required(),
});

const loginSchema = Joi.object({
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required(),

    password: Joi.string()
        .required(),
});

const createTaskSchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(1)
        .max(255)
        .required(),

    description: Joi.string()
        .allow("", null)
        .max(5000),

    priority: Joi.string()
        .valid("low", "medium", "high")
        .default("medium"),

    due_date: Joi.date()
        .iso()
        .allow(null),

    category_id: Joi.number()
        .integer()
        .positive()
        .allow(null),
});

const updateTaskSchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(1)
        .max(255),

    description: Joi.string()
        .allow("", null)
        .max(5000),

    priority: Joi.string()
        .valid("low", "medium", "high"),

    due_date: Joi.date()
        .iso()
        .allow(null),

    category_id: Joi.number()
        .integer()
        .positive()
        .allow(null),

    status: Joi.string()
        .valid("pending", "completed"),
}).min(1);

const statusSchema = Joi.object({
    status: Joi.string()
        .valid("pending", "completed")
        .required(),
});

const categorySchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(1)
        .max(100)
        .required(),
});

module.exports = {
    registerSchema,
    loginSchema,
    createTaskSchema,
    updateTaskSchema,
    statusSchema,
    categorySchema,
};