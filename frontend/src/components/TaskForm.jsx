import { useState } from "react";
import api from "../services/api";

const TaskForm = ({
    categories = [],
    onTaskCreated,
}) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("medium");
    const [categoryId, setCategoryId] = useState("");
    const [dueDate, setDueDate] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!title.trim()) {
            setError("Task title is required");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await api.post("/tasks", {
                title: title.trim(),
                description: description.trim(),
                priority,
                category_id: categoryId
                    ? Number(categoryId)
                    : null,
                due_date: dueDate
                    ? new Date(dueDate).toISOString()
                    : null,
            });

            if (onTaskCreated) {
                onTaskCreated(response.data.task);
            }

            setTitle("");
            setDescription("");
            setPriority("medium");
            setCategoryId("");
            setDueDate("");
        } catch (error) {
            console.error(
                "Create task error:",
                error
            );

            if (error.response?.data?.errors) {
                setError(
                    error.response.data.errors
                        .map((item) => item.message)
                        .join(", ")
                );
            } else {
                setError(
                    error.response?.data?.message ||
                        "Failed to create task"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            className="task-form"
            onSubmit={handleSubmit}
        >
            <h2>Create New Task</h2>

            {error && (
                <div className="error">
                    {error}
                </div>
            )}

            <input
                type="text"
                name="title"
                placeholder="What do you need to do?"
                value={title}
                onChange={(event) =>
                    setTitle(event.target.value)
                }
                maxLength={255}
                disabled={loading}
            />

            <textarea
                name="description"
                placeholder="Add a description..."
                value={description}
                onChange={(event) =>
                    setDescription(
                        event.target.value
                    )
                }
                maxLength={5000}
                disabled={loading}
            />

            <div className="form-row">
                <select
                    name="priority"
                    value={priority}
                    onChange={(event) =>
                        setPriority(
                            event.target.value
                        )
                    }
                    disabled={loading}
                >
                    <option value="low">
                        Low Priority
                    </option>

                    <option value="medium">
                        Medium Priority
                    </option>

                    <option value="high">
                        High Priority
                    </option>
                </select>

                <select
                    name="category_id"
                    value={categoryId}
                    onChange={(event) =>
                        setCategoryId(
                            event.target.value
                        )
                    }
                    disabled={loading}
                >
                    <option value="">
                        No Category
                    </option>

                    {categories.map((category) => (
                        <option
                            key={category.id}
                            value={category.id}
                        >
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            <input
                type="datetime-local"
                name="due_date"
                value={dueDate}
                onChange={(event) =>
                    setDueDate(
                        event.target.value
                    )
                }
                disabled={loading}
            />

            <button
                type="submit"
                disabled={loading}
            >
                {loading
                    ? "Creating Task..."
                    : "Add Task"}
            </button>
        </form>
    );
};

export default TaskForm;