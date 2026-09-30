import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import CategoryManager from "../components/CategoryManager";
import ThreeBackground from "../components/ThreeBackground";
import { applyTheme, getInitialTheme, saveTheme } from "../theme";

const Dashboard = () => {
    const { user, logout } = useAuth();

    // ==================================================
    // TASKS
    // ==================================================

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Used to force task refresh after
    // create/update/delete operations.
    const [taskRefresh, setTaskRefresh] =
        useState(0);

    // ==================================================
    // CATEGORIES
    // ==================================================

    const [categories, setCategories] =
        useState([]);

    const [categoryRefresh, setCategoryRefresh] =
        useState(0);

    // ==================================================
    // STATISTICS
    // ==================================================

    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        completed: 0,
        high_priority: 0,
        overdue: 0,
    });

    // ==================================================
    // SEARCH
    // ==================================================

    const [search, setSearch] = useState("");
    const [searchQuery, setSearchQuery] =
        useState("");

    // ==================================================
    // FILTERS
    // ==================================================

    const [status, setStatus] = useState("");
    const [priority, setPriority] =
        useState("");

    const [categoryId, setCategoryId] =
        useState("");

    const [dueFilter, setDueFilter] =
        useState("");

    // ==================================================
    // SORT
    // ==================================================

    const [sort, setSort] =
        useState("created_at");

    const [order, setOrder] =
        useState("desc");

    // ==================================================
    // PAGINATION
    // ==================================================

    const [page, setPage] = useState(1);

    const limit = 10;

    const [totalPages, setTotalPages] =
        useState(1);

    // ==================================================
    // LOAD CATEGORIES
    // ==================================================

    useEffect(() => {
        let cancelled = false;

        api.get("/categories")
            .then((response) => {
                if (!cancelled) {
                    setCategories(
                        response.data
                            .categories || []
                    );
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    console.error(
                        "Fetch categories error:",
                        error
                    );
                }
            });

        return () => {
            cancelled = true;
        };
    }, [categoryRefresh]);

    // ==================================================
    // LOAD TASKS
    // ==================================================

    useEffect(() => {
        let cancelled = false;

        const params = {
            page,
            limit,
            sort,
            order,
        };

        // Search
        if (searchQuery.trim()) {
            params.search =
                searchQuery.trim();
        }

        // Status
        if (status) {
            params.status = status;
        }

        // Priority
        if (priority) {
            params.priority = priority;
        }

        // Category
        if (categoryId) {
            params.category_id =
                categoryId;
        }

        // Due date
        if (dueFilter) {
            params.due = dueFilter;
        }

        api.get("/tasks", { params })
            .then((response) => {
                if (!cancelled) {
                    setTasks(
                        response.data
                            .tasks || []
                    );

                    setTotalPages(
                        response.data
                            .pagination
                            ?.totalPages || 1
                    );

                    setError("");
                    setLoading(false);
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    console.error(
                        "Fetch tasks error:",
                        error
                    );

                    setError(
                        error.response
                            ?.data
                            ?.message ||
                        "Failed to load tasks"
                    );

                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [
        page,
        searchQuery,
        status,
        priority,
        categoryId,
        dueFilter,
        sort,
        order,
        taskRefresh,
    ]);

    // ==================================================
    // LOAD STATISTICS
    // ==================================================

    useEffect(() => {
        let cancelled = false;

        api.get("/tasks/stats")
            .then((response) => {
                if (!cancelled) {
                    setStats(
                        response.data
                            .stats || {
                            total: 0,
                            pending: 0,
                            completed: 0,
                            high_priority: 0,
        overdue: 0,
                        }
                    );
                }
            })
            .catch((error) => {
                if (!cancelled) {
                    console.error(
                        "Fetch statistics error:",
                        error
                    );
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    // ==================================================
    // REFRESH STATISTICS
    // ==================================================

    const refreshStats = async () => {
        try {
            const response =
                await api.get(
                    "/tasks/stats"
                );

            setStats(
                response.data
                    .stats || {
                    total: 0,
                    pending: 0,
                    completed: 0,
                    high_priority: 0,
        overdue: 0,
                }
            );
        } catch (error) {
            console.error(
                "Refresh statistics error:",
                error
            );
        }
    };

    // ==================================================
    // SEARCH
    // ==================================================

    const handleSearch = (event) => {
        event.preventDefault();

        setPage(1);

        setSearchQuery(
            search.trim()
        );
    };

    // ==================================================
    // CREATE TASK
    // ==================================================

    const handleTaskCreated = async () => {
        setPage(1);

        setTaskRefresh(
            (current) => current + 1
        );

        await refreshStats();
    };

    // ==================================================
    // UPDATE TASK
    // ==================================================

    const handleTaskUpdated = async (
        updatedTask
    ) => {
        setTasks(
            (currentTasks) =>
                currentTasks.map(
                    (task) =>
                        task.id ===
                        updatedTask.id
                            ? updatedTask
                            : task
                )
        );

        await refreshStats();

        setTaskRefresh(
            (current) => current + 1
        );
    };

    // ==================================================
    // DELETE TASK
    // ==================================================

    const handleTaskDeleted = async (
        taskId
    ) => {
        setTasks(
            (currentTasks) =>
                currentTasks.filter(
                    (task) =>
                        task.id !==
                        taskId
                )
        );

        await refreshStats();

        setTaskRefresh(
            (current) => current + 1
        );
    };

    // ==================================================
    // CATEGORY CHANGE
    // ==================================================

    const handleCategoryChange = () => {
        setCategoryRefresh(
            (current) =>
                current + 1
        );

        setPage(1);

        setTaskRefresh(
            (current) => current + 1
        );

        // Remove category filter if
        // the category was deleted.
        if (categoryId) {
            setCategoryId("");
        }
    };

    // ==================================================
    // CLEAR FILTERS
    // ==================================================

    const clearFilters = () => {
        setSearch("");
        setSearchQuery("");
        setStatus("");
        setPriority("");
        setCategoryId("");
        setDueFilter("");
        setSort("created_at");
        setOrder("desc");
        setPage(1);
    };

    // ==================================================
    // STATUS FILTER
    // ==================================================

    const handleStatusChange = (
        event
    ) => {
        setStatus(
            event.target.value
        );

        setPage(1);
    };

    // ==================================================
    // PRIORITY FILTER
    // ==================================================

    const handlePriorityChange = (
        event
    ) => {
        setPriority(
            event.target.value
        );

        setPage(1);
    };

    // ==================================================
    // CATEGORY FILTER
    // ==================================================

    const handleCategoryFilterChange =
        (event) => {
            setCategoryId(
                event.target.value
            );

            setPage(1);
        };

    // ==================================================
    // DUE DATE FILTER
    // ==================================================

    const handleDueFilterChange =
        (event) => {
            setDueFilter(
                event.target.value
            );

            setPage(1);
        };

    // ==================================================
    // SORT
    // ==================================================

    const handleSortChange = (
        event
    ) => {
        setSort(
            event.target.value
        );

        setPage(1);
    };

    // ==================================================
    // ORDER
    // ==================================================

    const handleOrderChange = (
        event
    ) => {
        setOrder(
            event.target.value
        );

        setPage(1);
    };

    // ==================================================
    // PAGINATION
    // ==================================================

    const handlePreviousPage = () => {
        setPage(
            (current) =>
                Math.max(
                    current - 1,
                    1
                )
        );
    };

    const handleNextPage = () => {
        setPage(
            (current) =>
                Math.min(
                    current + 1,
                    totalPages
                )
        );
    };

    // ==================================================
    // LIVE SEARCH (applies 400 ms after the user stops typing)
    // ==================================================

    useEffect(() => {
        const query = search.trim();

        if (query === searchQuery) {
            return undefined;
        }

        const timer = setTimeout(() => {
            setSearchQuery(query);
            setPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [search, searchQuery]);

    // ==================================================
    // DARK MODE
    // ==================================================

    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const handleThemeToggle = () => {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
        saveTheme(next);
    };

    // ==================================================
    // RENDER
    // ==================================================

    // Number of active filters (sort/order are not counted)
    const activeFilterCount = [
        searchQuery.trim(),
        status,
        priority,
        categoryId,
        dueFilter,
    ].filter(Boolean).length;

    // Status tabs are a shortcut over the status + due filters
    const activeTab =
        dueFilter === "overdue" && !status
            ? "overdue"
            : !dueFilter && status === "pending"
            ? "pending"
            : !dueFilter && status === "completed"
            ? "completed"
            : !dueFilter && !status
            ? "all"
            : "";

    const tabs = [
        { key: "all", label: "All", count: stats.total },
        { key: "pending", label: "Pending", count: stats.pending },
        { key: "overdue", label: "Overdue", count: stats.overdue },
        { key: "completed", label: "Completed", count: stats.completed },
    ];

    const handleTabChange = (key) => {
        setStatus(key === "pending" || key === "completed" ? key : "");
        setDueFilter(key === "overdue" ? "overdue" : "");
        setPage(1);
    };

    const initials = (user?.name || "User")
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const statCards = [
        {
            key: "total",
            label: "Total tasks",
            tone: "blue",
            icon: (
                <Icon>
                    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                </Icon>
            ),
        },
        {
            key: "pending",
            label: "Pending",
            tone: "amber",
            icon: (
                <Icon>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                </Icon>
            ),
        },
        {
            key: "overdue",
            label: "Overdue",
            tone: "red",
            icon: (
                <Icon>
                    <path d="M12 9v4M12 17h.01" />
                    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
                </Icon>
            ),
        },
        {
            key: "completed",
            label: "Completed",
            tone: "green",
            icon: (
                <Icon>
                    <circle cx="12" cy="12" r="9" />
                    <path d="m8 12.5 2.8 2.8L16 9.5" />
                </Icon>
            ),
        },
        {
            key: "high_priority",
            label: "High priority",
            tone: "orange",
            icon: (
                <Icon>
                    <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
                </Icon>
            ),
        },
    ];

    return (
        <div className="dashboard">
            <ThreeBackground />

            {/* HEADER */}
            <header className="dashboard-header">
                <div>
                    <h1>My Tasks</h1>
                    <p>
                        Welcome back,{" "}
                        <strong>{user?.name || "User"}</strong>
                    </p>
                </div>

                <div className="header-actions">
                    <button
                        type="button"
                        className="theme-toggle"
                        onClick={handleThemeToggle}
                        aria-label={
                            theme === "dark"
                                ? "Switch to light mode"
                                : "Switch to dark mode"
                        }
                        title={
                            theme === "dark"
                                ? "Switch to light mode"
                                : "Switch to dark mode"
                        }
                    >
                        {theme === "dark" ? (
                            <Icon>
                                <circle cx="12" cy="12" r="4" />
                                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                            </Icon>
                        ) : (
                            <Icon>
                                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
                            </Icon>
                        )}
                    </button>

                    <span className="user-avatar" aria-hidden="true">
                        {initials}
                    </span>

                    <button
                        type="button"
                        className="logout-button"
                        onClick={logout}
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="dashboard-content">
                {/* STATISTICS */}
                <section className="statistics">
                    {statCards.map((card) => (
                        <div
                            key={card.key}
                            className={`stat-card tone-${card.tone}`}
                        >
                            <div className="stat-icon">{card.icon}</div>

                            <div className="stat-content">
                                <span className="stat-label">
                                    {card.label}
                                </span>
                                <strong className="stat-value">
                                    {stats[card.key]}
                                </strong>
                            </div>
                        </div>
                    ))}
                </section>

                <div className="dashboard-layout">
                    {/* SIDEBAR */}
                    <aside className="dashboard-sidebar">
                        <CategoryManager
                            categories={categories}
                            onCategoryChange={handleCategoryChange}
                        />

                        <TaskForm
                            categories={categories}
                            onTaskCreated={handleTaskCreated}
                        />
                    </aside>

                    <div className="dashboard-main">
                        {/* FILTERS */}
                        <section className="task-filters">
                            <div className="filter-header">
                                <div>
                                    <h2>Tasks</h2>
                                    <p>
                                        Search, filter and organize your tasks.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="clear-filters"
                                    onClick={clearFilters}
                                >
                                    Clear filters
                                </button>
                            </div>

                            <div
                                className="status-tabs"
                                role="tablist"
                                aria-label="Task status"
                            >
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        role="tab"
                                        aria-selected={activeTab === tab.key}
                                        className={`status-tab ${
                                            activeTab === tab.key ? "active" : ""
                                        }`}
                                        onClick={() => handleTabChange(tab.key)}
                                    >
                                        {tab.label}
                                        <span
                                            className={`tab-count ${
                                                tab.key === "overdue" && tab.count > 0
                                                    ? "tab-count-danger"
                                                    : ""
                                            }`}
                                        >
                                            {tab.count ?? 0}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <form
                                className="search-form"
                                onSubmit={handleSearch}
                            >
                                <input
                                    type="search"
                                    placeholder="Type to search tasks…"
                                    aria-label="Search tasks"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                />

                                <button type="submit">Search</button>
                            </form>

                            <div className="filter-grid">
                                <FilterField label="Status">
                                    <select
                                        value={status}
                                        onChange={handleStatusChange}
                                    >
                                        <option value="">All</option>
                                        <option value="pending">Pending</option>
                                        <option value="completed">
                                            Completed
                                        </option>
                                    </select>
                                </FilterField>

                                <FilterField label="Priority">
                                    <select
                                        value={priority}
                                        onChange={handlePriorityChange}
                                    >
                                        <option value="">All</option>
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </FilterField>

                                <FilterField label="Category">
                                    <select
                                        value={categoryId}
                                        onChange={handleCategoryFilterChange}
                                    >
                                        <option value="">All</option>
                                        {categories.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </FilterField>

                                <FilterField label="Due date">
                                    <select
                                        value={dueFilter}
                                        onChange={handleDueFilterChange}
                                    >
                                        <option value="">Any time</option>
                                        <option value="overdue">Overdue</option>
                                        <option value="today">Due today</option>
                                        <option value="upcoming">
                                            Upcoming
                                        </option>
                                    </select>
                                </FilterField>

                                <FilterField label="Sort by">
                                    <select
                                        value={sort}
                                        onChange={handleSortChange}
                                    >
                                        <option value="created_at">
                                            Created date
                                        </option>
                                        <option value="updated_at">
                                            Updated date
                                        </option>
                                        <option value="due_date">
                                            Due date
                                        </option>
                                        <option value="title">Title</option>
                                        <option value="priority">
                                            Priority
                                        </option>
                                        <option value="status">Status</option>
                                    </select>
                                </FilterField>

                                <FilterField label="Order">
                                    <select
                                        value={order}
                                        onChange={handleOrderChange}
                                    >
                                        <option value="desc">
                                            Newest first
                                        </option>
                                        <option value="asc">Oldest first</option>
                                    </select>
                                </FilterField>
                            </div>

                            {activeFilterCount > 0 && (
                                <p className="active-filters">
                                    {activeFilterCount}{" "}
                                    {activeFilterCount === 1 ? "filter" : "filters"} active
                                    <button type="button" onClick={clearFilters}>
                                        Clear all
                                    </button>
                                </p>
                            )}
                        </section>

                        {/* ERROR */}
                        {error && <div className="error">{error}</div>}

                        {/* TASKS */}
                        <section className="tasks-section">
                            {loading ? (
                                <div className="loading">
                                    Loading tasks...
                                </div>
                            ) : (
                                <TaskList
                                    tasks={tasks}
                                    categories={categories}
                                    activeFilters={activeFilterCount}
                                    onClearFilters={clearFilters}
                                    onTaskUpdated={handleTaskUpdated}
                                    onTaskDeleted={handleTaskDeleted}
                                />
                            )}
                        </section>

                        {/* PAGINATION */}
                        {!loading && totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    type="button"
                                    disabled={page === 1}
                                    onClick={handlePreviousPage}
                                >
                                    ← Previous
                                </button>

                                <span>
                                    Page {page} of {totalPages}
                                </span>

                                <button
                                    type="button"
                                    disabled={page === totalPages}
                                    onClick={handleNextPage}
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

// Small helpers ------------------------------------------------

const Icon = ({ children }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        {children}
    </svg>
);

const FilterField = ({ label, children }) => (
    <label className="filter-field">
        <span>{label}</span>
        {children}
    </label>
);

export default Dashboard;