const ConfirmModal = ({
    isOpen,
    title = "Confirm Action",
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    danger = false,
    loading = false,
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) {
        return null;
    }

    const handleOverlayClick = (event) => {
        if (event.target === event.currentTarget && !loading) {
            onCancel();
        }
    };

    return (
        <div
            className="modal-overlay"
            onMouseDown={handleOverlayClick}
        >
            <div
                className="confirm-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
            >
                <div
                    className={`confirm-modal-icon ${
                        danger
                            ? "confirm-modal-icon-danger"
                            : ""
                    }`}
                >
                    {danger ? "!" : "?"}
                </div>

                <h3 id="confirm-modal-title">
                    {title}
                </h3>

                <p>{message}</p>

                <div className="confirm-modal-actions">
                    <button
                        type="button"
                        className="modal-cancel-button"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        className={
                            danger
                                ? "modal-danger-button"
                                : "modal-confirm-button"
                        }
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading
                            ? "Deleting..."
                            : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;