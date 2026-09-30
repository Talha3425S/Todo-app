import TaskItem from "./TaskItem";

const TaskList = ({
    tasks,
    categories = [],
    activeFilters = 0,
    onClearFilters,
    onTaskUpdated,
    onTaskDeleted,
}) => {
    if (!tasks || tasks.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">✓</div>

                <h3>No tasks found</h3>

                {activeFilters > 0 ? (
                    <>
                        <p>
                            {activeFilters}{" "}
                            {activeFilters === 1 ? "filter is" : "filters are"}{" "}
                            active, and no task matches{" "}
                            {activeFilters === 1 ? "it" : "them all"}.
                        </p>

                        {onClearFilters && (
                            <button
                                type="button"
                                className="clear-filters"
                                onClick={onClearFilters}
                            >
                                Clear filters
                            </button>
                        )}
                    </>
                ) : (
                    <p>Create your first task to get started.</p>
                )}
            </div>
        );
    }

    return (
        <div className="task-list">
            {tasks.map((task) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    categories={categories}
                    onTaskUpdated={onTaskUpdated}
                    onTaskDeleted={onTaskDeleted}
                />
            ))}
        </div>
    );
};

export default TaskList;