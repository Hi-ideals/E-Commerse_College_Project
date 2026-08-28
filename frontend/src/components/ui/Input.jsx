export default function Input({ label, error, className = "", id, ...props }) {
  const inputId = id || props.name;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm
          placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500
          ${error ? "border-red-400" : "border-slate-300"} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
