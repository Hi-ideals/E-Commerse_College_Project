import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api, { extractErrorMessage } from "../api/axiosClient";
import { ordersApi } from "../api/orders.api";
import { formatCurrency, formatDate } from "../utils/format";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import StatusTimeline from "../features/orders/StatusTimeline";

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    ordersApi
      .getById(id)
      .then(setOrder)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDownloadInvoice() {
    setDownloading(true);
    try {
      const res = await api.get(`/invoices/${id}`, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not download invoice"));
    } finally {
      setDownloading(false);
    }
  }

  if (loading) return <Spinner className="min-h-[60vh]" />;

  if (notFound || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-5xl">🔍</p>
        <h1 className="mt-4 text-xl font-semibold text-slate-800">Order not found</h1>
        <Link to="/orders">
          <Button className="mt-6">Back to my orders</Button>
        </Link>
      </div>
    );
  }

  const addr = order.shippingAddress || {};

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/orders" className="text-xs font-medium text-slate-500 hover:text-brand-600">
            ← My Orders
          </Link>
          <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-slate-500">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge status={order.status} />
          <Button variant="secondary" size="sm" loading={downloading} onClick={handleDownloadInvoice}>
            📄 Invoice
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          {/* Tracking */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="mb-4 text-sm font-semibold text-slate-800">Order Tracking</h2>
            <StatusTimeline status={order.status} statusHistory={order.statusHistory} />
          </section>

          {/* Items */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-800">Items</h2>
            <ul className="flex flex-col divide-y divide-slate-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between py-2.5 text-sm">
                  <span className="text-slate-700">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium text-slate-900">{formatCurrency(item.lineTotal)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          {/* Summary */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-800">Payment Summary</h2>
            <dl className="mt-3 flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <dt>Subtotal</dt>
                <dd>{formatCurrency(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-slate-600">
                <dt>Shipping</dt>
                <dd>{formatCurrency(order.shipping)}</dd>
              </div>
              <div className="mt-1 flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-900">
                <dt>Total</dt>
                <dd>{formatCurrency(order.totalAmount)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-slate-400">Prices shown are inclusive of applicable taxes.</p>
            <p className="text-xs text-slate-400">Payment method: {order.paymentMethod}</p>
          </section>

          {/* Shipping address */}
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-800">Shipping Address</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {addr.label && <span className="font-medium text-slate-800">{addr.label}</span>}
              {addr.label && <br />}
              {addr.line1}
              {addr.line2 && <>, {addr.line2}</>}
              <br />
              {addr.city}
              {addr.state && `, ${addr.state}`} {addr.postalCode}
              <br />
              {addr.country}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
