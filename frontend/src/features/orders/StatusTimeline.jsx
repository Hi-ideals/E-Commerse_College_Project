import { formatDate } from "../../utils/format";

const FLOW = ["Pending", "Confirmed", "Shipped", "Out for Delivery", "Delivered"];

export default function StatusTimeline({ status, statusHistory }) {
  const isCancelled = status === "Cancelled";
  const currentIndex = FLOW.indexOf(status);
  const historyByStatus = Object.fromEntries((statusHistory || []).map((h) => [h.status, h]));

  if (isCancelled) {
    const cancelledEntry = historyByStatus["Cancelled"];
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="font-semibold text-red-700">Order Cancelled</p>
        {cancelledEntry && (
          <p className="mt-1 text-sm text-red-600">
            {cancelledEntry.note || "This order was cancelled."} — {formatDate(cancelledEntry.updatedAt)}
          </p>
        )}
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-0">
      {FLOW.map((step, idx) => {
        const done = idx <= currentIndex;
        const isCurrent = idx === currentIndex;
        const entry = historyByStatus[step];
        const isLast = idx === FLOW.length - 1;

        return (
          <li key={step} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                className={`absolute left-[15px] top-8 h-full w-0.5 ${done ? "bg-brand-500" : "bg-slate-200"}`}
                aria-hidden="true"
              />
            )}
            <span
              className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                isCurrent
                  ? "border-brand-600 bg-brand-600 text-white shadow-md shadow-brand-600/30"
                  : done
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-slate-300 bg-white text-slate-300"
              }`}
            >
              {done ? "✓" : idx + 1}
            </span>
            <div className="pt-1">
              <p className={`text-sm font-semibold ${done ? "text-slate-900" : "text-slate-400"}`}>{step}</p>
              {entry ? (
                <p className="mt-0.5 text-xs text-slate-500">
                  {entry.note ? `${entry.note} — ` : ""}
                  {formatDate(entry.updatedAt)}
                </p>
              ) : (
                <p className="mt-0.5 text-xs text-slate-400">Pending</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
