import { useMemo } from "react";

const TaskController = ({ tasks = [], children }) => {
    const taskCount = useMemo(
        () => tasks.length,
        [tasks]
    );

    if (typeof children === "function") {
        return children({ taskCount });
    }

    return null;
};

export default TaskController;
