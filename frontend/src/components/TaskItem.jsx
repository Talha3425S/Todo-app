import { useState } from "react";
import api from "../services/api";
import ConfirmModal from "./ConfirmModal";

const pad = (n) => String(n).padStart(2, "0");

// Converts a stored date into the LOCAL "YYYY-MM-DDTHH:mm" format that
// <input type="datetime-local"> expects (toISOString() would give UTC).
const toLocalInput = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const TaskItem = ({
    task,
    categories = [],
    onTaskUpdated,
    onTaskDeleted,
}) => {
    const [editing, setEditing] = useState(false);

    const [title, setTitle] = useState(
        task.title
    );

    const [description, setDescription] =
        useState(task.description || "");

    const [priority, setPriority] = useState(
        task.priority
    );

    const [categoryId, setCategoryId] =
        useState(
            task.category_id
                ? String(task.category_id)
                : ""
        );

    const [dueDate, setDueDate] = useState(
        toLocalInput(task.due_date)
    );

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [showDeleteModal, setShowDeleteModal] =
        useState(false);

    const handleStatusChange = async () => {
        try {
            setLoading(true);
            setError("");

            const newStatus =
                task.status === "completed"
                    ? "pending"
                    : "completed";

            const response = await api.patch(
                `/tasks/${task.id}/status`,
                {
                    status: newStatus,
                }
            );

            if (onTaskUpdated) {
                onTaskUpdated(
                    response.data.task
                );
            }
        } catch (error) {
            console.error(
                "Status update error:",
                error
            );

            setError(
                error.response?.data?.message ||
                    "Failed to update task status"
            );
        } finally {
            setLoading(false);
        }
    };

    const prepareEdit = () => {
        setTitle(task.title);
        setDescription(
            task.description || ""
        );

        setPriority(task.priority);

        setCategoryId(
            task.category_id
                ? String(task.category_id)
                : ""
        );

        setDueDate(
            toLocalInput(task.due_date)
        );

        setError("");
        setEditing(true);
    };

    const handleCancel = () => {
        setTitle(task.title);

        setDescription(
            task.description || ""
        );

        setPriority(task.priority);

        setCategoryId(
            task.category_id
                ? String(task.category_id)
                : ""
        );

        setDueDate(
            toLocalInput(task.due_date)
        );

        setError("");
        setEditing(false);
    };

    const handleSave = async (event) => {
        event.preventDefault();

        if (!title.trim()) {
            setError("Task title is required");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await api.put(
                `/tasks/${task.id}`,
                {
                    title: title.trim(),
                    description:
                        description.trim(),
                    priority,
                    category_id: categoryId
                        ? Number(categoryId)
                        : null,
                    due_date: dueDate
                        ? new Date(dueDate).toISOString()
                        : null,
                }
            );

            if (onTaskUpdated) {
                onTaskUpdated(
                    response.data.task
                );
            }

            setEditing(false);
        } catch (error) {
            console.error(
                "Update task error:",
                error
            );

            if (
                error.response?.data?.errors
            ) {
                setError(
                    error.response.data.errors
                        .map(
                            (item) =>
                                item.message
                        )
                        .join(", ")
                );
            } else {
                setError(
                    error.response?.data?.message ||
                        "Failed to update task"
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const handleDeleteConfirmed =
        async () => {
            try {
                setLoading(true);
                setError("");

                await api.delete(
                    `/tasks/${task.id}`
                );

                setShowDeleteModal(false);

                if (onTaskDeleted) {
                    onTaskDeleted(task.id);
                }
            } catch (error) {
                console.error(
                    "Delete task error:",
                    error
                );

                setError(
                    error.response?.data
                        ?.message ||
                        "Failed to delete task"
                );
            } finally {
                setLoading(false);
            }
        };

    const formatDueDate = (date) => {
        if (!date) {
            return null;
        }

        return new Date(
            date
        ).toLocaleString();
    };

    const getDueDateStatus = (date, taskStatus) => {
        if (!date || taskStatus === "completed") {
            return "";
        }

        const due = new Date(date);
        const now = new Date();

        if (due < now) {
            return "overdue";
        }

        if (due.toDateString() === now.toDateString()) {
            return "today";
        }

        return "upcoming";
    };

    const categoryName =
        task.category_name ||
        categories.find(
            (category) =>
                category.id ===
                task.category_id
        )?.name;

    const dueStatus =
        getDueDateStatus(task.due_date, task.status);

    return (
        <>
            <article
                className={`task-item ${
                    task.status === "completed"
                        ? "completed"
                        : ""
                }`}
            >
                {editing ? (
                    <form
                        className="task-edit-form"
                        onSubmit={handleSave}
                    >
                        <div className="task-edit-header">
                            <h3>
                                Edit Task
                            </h3>
                        </div>

                        {error && (
                            <div className="error">
                                {error}
                            </div>
                        )}

                        <div className="edit-fields">
                            <input
                                type="text"
                                value={title}
                                onChange={(event) =>
                                    setTitle(
                                        event.target
                                            .value
                                    )
                                }
                                placeholder="Task title"
                                maxLength={255}
                                disabled={
                                    loading
                                }
                            />

                            <textarea
                                value={
                                    description
                                }
                                onChange={(
                                    event
                                ) =>
                                    setDescription(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Task description"
                                maxLength={5000}
                                disabled={
                                    loading
                                }
                            />

                            <div className="edit-row">
                                <select
                                    value={
                                        priority
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setPriority(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    disabled={
                                        loading
                                    }
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
                                    value={
                                        categoryId
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setCategoryId(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    disabled={
                                        loading
                                    }
                                >
                                    <option value="">
                                        No Category
                                    </option>

                                    {categories.map(
                                        (
                                            category
                                        ) => (
                                            <option
                                                key={
                                                    category.id
                                                }
                                                value={
                                                    category.id
                                                }
                                            >
                                                {
                                                    category.name
                                                }
                                            </option>
                                        )
                                    )}
                                </select>

                                <input
                                    type="datetime-local"
                                    value={
                                        dueDate
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setDueDate(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    disabled={
                                        loading
                                    }
                                />
                            </div>
                        </div>

                        <div className="task-actions">
                            <button
                                type="submit"
                                className="btn-save"
                                disabled={
                                    loading
                                }
                            >
                                {loading
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>

                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={
                                    handleCancel
                                }
                                disabled={
                                    loading
                                }
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        <div className="task-content">
                            <div className="task-main">
                                <div className="task-title-row">
                                    <h3>
                                        {task.title}
                                    </h3>

                                    <span
                                        className={`priority priority-${task.priority}`}
                                    >
                                        {
                                            task.priority
                                        }
                                    </span>
                                </div>

                                {task.description && (
                                    <p className="task-description">
                                        {
                                            task.description
                                        }
                                    </p>
                                )}

                                <div className="task-meta">
                                    <span>
                                        Status:{" "}
                                        <strong>
                                            {
                                                task.status
                                            }
                                        </strong>
                                    </span>

                                    {categoryName && (
                                        <span>
                                            Category:{" "}
                                            <strong>
                                                {
                                                    categoryName
                                                }
                                            </strong>
                                        </span>
                                    )}

                                    {task.due_date && (
                                        <span
                                            className={`due-date due-${dueStatus}`}
                                        >
                                            Due:{" "}
                                            <strong>
                                                {formatDueDate(
                                                    task.due_date
                                                )}
                                            </strong>
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="task-actions">
                                <button
                                    type="button"
                                    className={
                                        task.status ===
                                        "completed"
                                            ? "btn-undo"
                                            : "btn-complete"
                                    }
                                    onClick={
                                        handleStatusChange
                                    }
                                    disabled={
                                        loading
                                    }
                                >
                                    {task.status ===
                                    "completed"
                                        ? "Undo"
                                        : "Complete"}
                                </button>

                                <button
                                    type="button"
                                    className="btn-edit"
                                    onClick={
                                        prepareEdit
                                    }
                                    disabled={
                                        loading
                                    }
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    className="btn-delete"
                                    onClick={
                                        handleDelete
                                    }
                                    disabled={
                                        loading
                                    }
                                >
                                    Delete
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="error task-error">
                                {error}
                            </div>
                        )}
                    </>
                )}
            </article>

            <ConfirmModal
                isOpen={showDeleteModal}
                title="Delete Task"
                message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                danger={true}
                loading={loading}
                onConfirm={
                    handleDeleteConfirmed
                }
                onCancel={() =>
                    !loading &&
                    setShowDeleteModal(false)
                }
            />
        </>
    );
};

export default TaskItem;