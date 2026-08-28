export default function AddressCard({ address, onEdit, onDelete, onSetDefault, busy }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="text-sm">
        <div className="flex flex-wrap items-center gap-2">
          {address.label && <span className="font-semibold text-slate-800">{address.label}</span>}
          {address.isDefault && (
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
              Default
            </span>
          )}
        </div>
        <p className="mt-1 text-slate-600">
          {address.line1}
          {address.line2 && <>, {address.line2}</>}, {address.city}
          {address.state && `, ${address.state}`} {address.postalCode}, {address.country}
        </p>
      </div>

      <div className="flex shrink-0 gap-2 text-xs font-medium">
        {!address.isDefault && (
          <button
            disabled={busy}
            onClick={() => onSetDefault(address)}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            Set default
          </button>
        )}
        <button
          disabled={busy}
          onClick={() => onEdit(address)}
          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >
          Edit
        </button>
        <button
          disabled={busy}
          onClick={() => onDelete(address)}
          className="rounded-lg border border-red-200 px-2.5 py-1.5 text-red-600 hover:bg-red-50 disabled:opacity-40"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
