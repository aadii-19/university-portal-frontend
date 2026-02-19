import './ConfirmDialog.css';

export default function ConfirmDialog({ show, title, message, confirmText, cancelText, onConfirm, onCancel, type }) {
    if (!show) return null;

    return (
        <div className="confirm-overlay" onClick={onCancel}>
            <div className="confirm-dialog animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                <div className={`confirm-icon ${type === 'danger' ? 'danger' : 'warning'}`}>
                    {type === 'danger' ? '🗑️' : '⚠️'}
                </div>
                <h3 className="confirm-title">{title}</h3>
                <p className="confirm-message">{message}</p>
                <div className="confirm-actions">
                    <button className="btn btn-secondary confirm-cancel" onClick={onCancel}>
                        {cancelText || 'Cancel'}
                    </button>
                    <button className={`btn confirm-btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
                        {confirmText || 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
}
