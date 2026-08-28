import { NavLink, Outlet } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100"
  }`;

export default function AdminLayout() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Admin Panel</h1>
        <p className="text-sm text-slate-500">Manage products, orders, and monitor store performance.</p>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        <nav className="flex gap-2 overflow-x-auto md:w-48 md:flex-none md:flex-col md:gap-1 md:overflow-visible">
          <NavLink to="/admin" end className={linkClass}>
            📊 Dashboard
          </NavLink>
          <NavLink to="/admin/products" className={linkClass}>
            📦 Products
          </NavLink>
          <NavLink to="/admin/orders" className={linkClass}>
            🧾 Orders
          </NavLink>
        </nav>

        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
