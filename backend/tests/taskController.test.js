const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const controllerSource = fs.readFileSync(
    path.join(__dirname, "../src/controllers/taskController.js"),
    "utf8"
);

test("task statistics include overdue count for pending late tasks", () => {
    assert.match(
        controllerSource,
        /COUNT\(\*\) FILTER \(\s*WHERE status =\s*'pending'\s*AND due_date IS NOT NULL\s*AND due_date < CURRENT_TIMESTAMP\s*\)\s*::INTEGER AS overdue/s
    );
});
