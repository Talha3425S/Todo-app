import { useEffect, useState } from "react";
import api from "../services/api";
import ConfirmModal from "./ConfirmModal";

const CategoryManager = ({
    onCategoryChange,
}) => {
    const [categories, setCategories] =
        useState([]);

    const [name, setName] =
        useState("");

    const [editingId, setEditingId] =
        useState(null);

    const [editingName, setEditingName] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [
        categoryToDelete,
        setCategoryToDelete,
    ] = useState(null);

    /*
     * Load categories.
     *
     * IMPORTANT:
     * We do not call setLoading(true) or
     * setError("") synchronously from the
     * useEffect.
     */
    useEffect(() => {
        let cancelled = false;

        const loadCategories = async () => {
            try {
                const response =
                    await api.get(
                        "/categories"
                    );

                if (cancelled) {
                    return;
                }

                setCategories(
                    response.data.categories ||
                        []
                );

                setError("");
            } catch (error) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Fetch categories error:",
                    error
                );

                setError(
                    error.response?.data
                        ?.message ||
                        "Failed to load categories"
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadCategories();

        return () => {
            cancelled = true;
        };
    }, []);

    /*
     * CREATE CATEGORY
     */
    const handleCreate = async (
        event
    ) => {
        event.preventDefault();

        if (!name.trim()) {
            setError(
                "Category name is required"
            );
            return;
        }

        try {
            setSaving(true);
            setError("");

            const response =
                await api.post(
                    "/categories",
                    {
                        name: name.trim(),
                    }
                );

            const newCategory =
                response.data.category;

            setCategories((current) => [
                ...current,
                newCategory,
            ]);

            setName("");

            if (onCategoryChange) {
                onCategoryChange();
            }
        } catch (error) {
            console.error(
                "Create category error:",
                error
            );

            setError(
                error.response?.data
                    ?.message ||
                    "Failed to create category"
            );
        } finally {
            setSaving(false);
        }
    };

    /*
     * START EDITING
     */
    const startEditing = (
        category
    ) => {
        setEditingId(category.id);
        setEditingName(
            category.name
        );
        setError("");
    };

    /*
     * CANCEL EDITING
     */
    const cancelEditing = () => {
        setEditingId(null);
        setEditingName("");
    };

    /*
     * UPDATE CATEGORY
     */
    const saveEdit = async (
        categoryId
    ) => {
        if (!editingName.trim()) {
            setError(
                "Category name is required"
            );
            return;
        }

        try {
            setSaving(true);
            setError("");

            const response =
                await api.put(
                    `/categories/${categoryId}`,
                    {
                        name:
                            editingName.trim(),
                    }
                );

            const updatedCategory =
                response.data.category;

            setCategories((current) =>
                current.map(
                    (category) =>
                        category.id ===
                        categoryId
                            ? updatedCategory
                            : category
                )
            );

            cancelEditing();

            if (onCategoryChange) {
                onCategoryChange();
            }
        } catch (error) {
            console.error(
                "Update category error:",
                error
            );

            setError(
                error.response?.data
                    ?.message ||
                    "Failed to update category"
            );
        } finally {
            setSaving(false);
        }
    };

    /*
     * OPEN DELETE CONFIRMATION
     */
    const handleDeleteClick = (
        category
    ) => {
        setCategoryToDelete(
            category
        );
    };

    /*
     * DELETE CATEGORY
     */
    const handleDeleteConfirmed =
        async () => {
            if (!categoryToDelete) {
                return;
            }

            try {
                setSaving(true);
                setError("");

                await api.delete(
                    `/categories/${categoryToDelete.id}`
                );

                setCategories((current) =>
                    current.filter(
                        (category) =>
                            category.id !==
                            categoryToDelete.id
                    )
                );

                setCategoryToDelete(
                    null
                );

                if (onCategoryChange) {
                    onCategoryChange();
                }
            } catch (error) {
                console.error(
                    "Delete category error:",
                    error
                );

                setError(
                    error.response?.data
                        ?.message ||
                        "Failed to delete category"
                );
            } finally {
                setSaving(false);
            }
        };

    return (
        <>
            <section className="category-manager">
                <div className="category-header">
                    <div>
                        <h2>
                            Categories
                        </h2>

                        <p>
                            Organize your tasks
                            into categories.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="error">
                        {error}
                    </div>
                )}

                <form
                    className="category-create-form"
                    onSubmit={
                        handleCreate
                    }
                >
                    <input
                        type="text"
                        placeholder="New category name..."
                        value={name}
                        onChange={(event) =>
                            setName(
                                event.target
                                    .value
                            )
                        }
                        maxLength={100}
                        disabled={saving}
                    />

                    <button
                        type="submit"
                        disabled={saving}
                    >
                        {saving
                            ? "Adding..."
                            : "Add Category"}
                    </button>
                </form>

                {loading ? (
                    <div className="loading">
                        Loading categories...
                    </div>
                ) : categories.length ===
                  0 ? (
                    <div className="category-empty">
                        No categories yet.
                    </div>
                ) : (
                    <div className="category-list">
                        {categories.map(
                            (category) => (
                                <div
                                    className="category-item"
                                    key={
                                        category.id
                                    }
                                >
                                    {editingId ===
                                    category.id ? (
                                        <>
                                            <input
                                                type="text"
                                                value={
                                                    editingName
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setEditingName(
                                                        event
                                                            .target
                                                            .value
                                                    )
                                                }
                                                maxLength={
                                                    100
                                                }
                                                disabled={
                                                    saving
                                                }
                                            />

                                            <div className="category-actions">
                                                <button
                                                    type="button"
                                                    className="btn-save"
                                                    onClick={() =>
                                                        saveEdit(
                                                            category.id
                                                        )
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                >
                                                    Save
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn-cancel"
                                                    onClick={
                                                        cancelEditing
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="category-info">
                                                <span className="category-name">
                                                    {
                                                        category.name
                                                    }
                                                </span>

                                                {category.task_count !==
                                                    undefined && (
                                                    <span className="category-count">
                                                        {
                                                            category.task_count
                                                        }{" "}
                                                        tasks
                                                    </span>
                                                )}
                                            </div>

                                            <div className="category-actions">
                                                <button
                                                    type="button"
                                                    className="btn-edit"
                                                    onClick={() =>
                                                        startEditing(
                                                            category
                                                        )
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="btn-delete"
                                                    onClick={() =>
                                                        handleDeleteClick(
                                                            category
                                                        )
                                                    }
                                                    disabled={
                                                        saving
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )
                        )}
                    </div>
                )}
            </section>

            <ConfirmModal
                isOpen={
                    Boolean(
                        categoryToDelete
                    )
                }
                title="Delete Category"
                message={
                    categoryToDelete
                        ? `Are you sure you want to delete "${categoryToDelete.name}"?`
                        : ""
                }
                confirmText="Delete"
                cancelText="Cancel"
                danger={true}
                loading={saving}
                onConfirm={
                    handleDeleteConfirmed
                }
                onCancel={() =>
                    !saving &&
                    setCategoryToDelete(
                        null
                    )
                }
            />
        </>
    );
};

export default CategoryManager;