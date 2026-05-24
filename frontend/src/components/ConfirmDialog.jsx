const ConfirmDialog = ({
  open,
  title = 'Confirm',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in" role="dialog" aria-modal="true">
        <h3 className="font-heading font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 mt-2">{message}</p>
        <div className="flex gap-3 mt-6">
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all ${
              danger ? 'bg-red-600 text-white hover:bg-red-700' : 'btn-primary'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
