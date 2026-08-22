export default function ToastBanner({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-toast-in">
      <div className="flex items-center gap-3 rounded-lg bg-slate-900 text-white px-4 py-3 shadow-lg border border-slate-800 text-sm">
        <i className="ti ti-plane-arrival text-teal-400 text-lg" aria-hidden="true"></i>
        <div>
          <p className="font-medium text-slate-100">{toast.title || "Pipeline Update"}</p>
          <p className="text-xs text-slate-300">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-3 text-slate-400 hover:text-white transition-colors"
        >
          <i className="ti ti-x text-sm" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  );
}
