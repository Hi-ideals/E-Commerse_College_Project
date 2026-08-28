import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ordersApi } from "../../api/orders.api";
import { productsApi } from "../../api/products.api";
import { formatCurrency, formatDate } from "../../utils/format";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";

const LOW_STOCK_THRESHOLD = 10;

function StatCard({ label, value, icon, accent = "text-slate-900" }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`mt-2 text-2xl font-bold sm:text-3xl ${accent}`}>{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  useEffect(() => {
    Promise.all([
      ordersApi.listAll({ limit: 100 }),
      productsApi.list({ limit: 100, includeInactive: true }),
    ]).then(([orders, products]) => {
      const revenue = orders.items
        .filter((o) => o.status !== "Cancelled")
        .reduce((sum, o) => sum + o.totalAmount, 0);

      const statusCounts = orders.items.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalOrders: orders.totalItems,
        totalRevenue: revenue,
        pendingOrders: statusCounts.Pending || 0,
        totalProducts: products.totalItems,
        statusCounts,
      });
      setRecentOrders(orders.items.slice(0, 6));
      setLowStock(products.items.filter((p) => p.isActive && p.stock <= LOW_STOCK_THRESHOLD).slice(0, 6));
      setLoading(false);
    });
  }, []);

  if (loading) return <Spinner className="min-h-[40vh]" />;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon="💰" accent="text-green-700" />
        <StatCard label="Total Orders" value={stats.totalOrders} icon="🧾" />
        <StatCard label="Pending Orders" value={stats.pendingOrders} icon="⏳" accent="text-amber-600" />
        <StatCard label="Products" value={stats.totalProducts} icon="📦" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Order status breakdown */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Orders by Status</h2>
          <div className="flex flex-col gap-2">
            {Object.entries(stats.statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <Badge status={status} />
                <span className="font-medium text-slate-700">{count}</span>
              </div>
            ))}
            {Object.keys(stats.statusCounts).length === 0 && (
              <p className="text-sm text-slate-400">No orders yet.</p>
            )}
          </div>
        </section>

        {/* Low stock alerts */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-800">Low Stock Alerts</h2>
          <div className="flex flex-col gap-2">
            {lowStock.length === 0 ? (
              <p className="text-sm text-slate-400">All products are well-stocked.</p>
            ) : (
              lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="line-clamp-1 text-slate-700">{p.name}</span>
                  <span className="font-semibold text-red-600">{p.stock} left</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Recent orders */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Recent Orders</h2>
          <Link to="/admin/orders" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase text-slate-400">
                <th className="py-2 pr-2">Order</th>
                <th className="py-2 pr-2">Customer</th>
                <th className="py-2 pr-2">Date</th>
                <th className="py-2 pr-2">Status</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-2 pr-2 font-medium text-slate-800">{o.id.slice(0, 8).toUpperCase()}</td>
                  <td className="py-2 pr-2 text-slate-600">{o.customer?.name}</td>
                  <td className="py-2 pr-2 text-slate-500">{formatDate(o.createdAt)}</td>
                  <td className="py-2 pr-2">
                    <Badge status={o.status} />
                  </td>
                  <td className="py-2 text-right font-semibold text-slate-900">{formatCurrency(o.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
