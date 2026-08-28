import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ordersApi } from "../api/orders.api";
import { formatCurrency, formatDate } from "../utils/format";
import Badge from "../components/ui/Badge";
import Pagination from "../components/ui/Pagination";
import Spinner from "../components/ui/Spinner";
import Button from "../components/ui/Button";

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    ordersApi
      .listMine({ page, limit: 10 })
      .then(setResult)
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <Spinner className="min-h-[60vh]" />;

  if (result.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-6xl">📦</p>
        <h1 className="mt-4 text-xl font-semibold text-slate-800">No orders yet</h1>
        <p className="mt-1 text-sm text-slate-500">Once you place an order, it will show up here.</p>
        <Link to="/products">
          <Button className="mt-6">Browse products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">My Orders</h1>

      <div className="mt-6 flex flex-col gap-3">
        {result.items.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-xs text-slate-400">Order #{order.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-sm text-slate-600">{formatDate(order.createdAt)}</p>
            </div>
            <div className="flex items-center gap-3 sm:gap-6">
              <Badge status={order.status} />
              <span className="text-sm font-bold text-slate-900">{formatCurrency(order.totalAmount)}</span>
              <span className="text-sm text-brand-600">View →</span>
            </div>
          </Link>
        ))}
      </div>

      <Pagination page={page} totalPages={result.totalPages} onChange={setPage} />
    </div>
  );
}
