import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ordersApi } from "../../api/orders.api";
import { extractErrorMessage } from "../../api/axiosClient";
import { formatCurrency, formatDate, NEXT_STATUS, ORDER_STATUSES } from "../../utils/format";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";
import Pagination from "../../components/ui/Pagination";

export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [result, setResult] = useState({ items: [], totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  function load() {
    setLoading(true);
    ordersApi
      .listAll({ page, limit: 10, status: statusFilter || undefined })
      .then(setResult)
      .finally(() => setLoading(false));
  }

  useEffect(load, [page, statusFilter]);

  async function handleStatusChange(order, nextStatus) {
    if (!nextStatus) return;
    setUpdatingId(order.id);
    try {
      await ordersApi.updateStatus(order.id, nextStatus);
      toast.success(`Order ${order.id.slice(0, 8).toUpperCase()} → ${nextStatus}`);
      load();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not update order status"));
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">Orders</h2>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Update Status</th>
                <th className="px-4 py-3 text-right">&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((order) => {
                const nextOptions = NEXT_STATUS[order.status] || [];
                return (
                  <tr key={order.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-800">{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{order.customer?.name}</div>
                      <div className="text-xs text-slate-400">{order.customer?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <Badge status={order.status} />
                    </td>
                    <td className="px-4 py-3">
                      {nextOptions.length > 0 ? (
                        <select
                          disabled={updatingId === order.id}
                          defaultValue=""
                          onChange={(e) => handleStatusChange(order, e.target.value)}
                          className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-40"
                        >
                          <option value="" disabled>
                            Change to…
                          </option>
                          {nextOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs text-slate-400">Final</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/orders/${order.id}`} className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {result.items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={result.totalPages} onChange={setPage} />
    </div>
  );
}
