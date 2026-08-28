import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const navLinkClass = ({ isActive }) =>
  `text-sm font-medium transition-colors ${isActive ? "text-brand-600" : "text-slate-600 hover:text-brand-600"}`;

const mobileNavLinkClass = ({ isActive }) =>
  `block rounded-lg px-3 py-2 text-sm font-medium ${
    isActive ? "bg-brand-50 text-brand-600" : "text-slate-700 hover:bg-slate-50"
  }`;

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    navigate("/");
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="text-lg font-bold text-brand-700" onClick={closeMenu}>
          Smart<span className="text-slate-900">Shop</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          <NavLink to="/products" className={navLinkClass}>Products</NavLink>
          {isAuthenticated && (
            <NavLink to="/orders" className={navLinkClass}>My Orders</NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>
          )}
        </nav>

        <div className="flex items-center gap-1 sm:gap-3">
          {/* Visible to guests too — browsing and adding to cart doesn't require login. */}
          <Link
            to="/cart"
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="View cart"
            onClick={closeMenu}
          >
            🛒
            {cart.itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                {cart.itemCount}
              </span>
            )}
          </Link>

          <div className="hidden items-center gap-2 sm:flex">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="hidden text-sm text-slate-600 lg:block">
                  Hi, {user.name.split(" ")[0]}
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-brand-600">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      {menuOpen && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <NavLink to="/" end className={mobileNavLinkClass} onClick={closeMenu}>Home</NavLink>
            <NavLink to="/products" className={mobileNavLinkClass} onClick={closeMenu}>Products</NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/orders" className={mobileNavLinkClass} onClick={closeMenu}>My Orders</NavLink>
                <NavLink to="/profile" className={mobileNavLinkClass} onClick={closeMenu}>Profile</NavLink>
              </>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={mobileNavLinkClass} onClick={closeMenu}>Admin</NavLink>
            )}

            <div className="mt-2 border-t border-slate-100 pt-2">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Logout
                </button>
              ) : (
                <div className="flex flex-col gap-1">
                  <NavLink to="/login" className={mobileNavLinkClass} onClick={closeMenu}>Login</NavLink>
                  <NavLink to="/register" className={mobileNavLinkClass} onClick={closeMenu}>Sign up</NavLink>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
