import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { extractErrorMessage } from "../api/axiosClient";
import { formatCurrency } from "../utils/format";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";

export default function CartPage() {
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [busyId, setBusyId] = useState(null);

  async function handleQuantityChange(item, nextQty) {
    if (nextQty < 1) return;
    if (nextQty > item.product.stock) {
      toast.error(`Only ${item.product.stock} unit(s) of "${item.product.name}" available`);
      return;
    }
    setBusyId(item.id);
    try {
      await updateQuantity(item.id, nextQty);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not update quantity"));
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemove(item) {
    setBusyId(item.id);
    try {
      await removeItem(item.id);
      toast.success(`Removed ${item.product.name}`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not remove item"));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <Spinner className="min-h-[60vh]" />;

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-6xl">🛒</p>
        <h1 className="mt-4 text-xl font-semibold text-slate-800">Your cart is empty</h1>
        <p className="mt-1 text-sm text-slate-500">Browse our catalog and add something you like.</p>
        <Link to="/products">
          <Button className="mt-6">Browse products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Your Cart</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <ul className="flex flex-col gap-3">
          {cart.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:gap-4 sm:p-4"
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-20 sm:w-20">
                {item.product.imageUrl ? (
                  <img src={item.product.imageUrl} alt={item.product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl text-slate-300">📦</div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <Link
                  to={`/products/${item.product.id}`}
                  className="line-clamp-1 text-sm font-semibold text-slate-800 hover:text-brand-600 sm:text-base"
                >
                  {item.product.name}
                </Link>
                <p className="mt-0.5 text-sm text-slate-500">{formatCurrency(item.product.price)} each</p>

                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center rounded-lg border border-slate-300">
                    <button
                      disabled={busyId === item.id}
                      onClick={() => handleQuantityChange(item, item.quantity - 1)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      disabled={busyId === item.id}
                      onClick={() => handleQuantityChange(item, item.quantity + 1)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    disabled={busyId === item.id}
                    onClick={() => handleRemove(item)}
                    className="text-xs font-medium text-red-500 hover:text-red-600 disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="shrink-0 text-right text-sm font-bold text-slate-900 sm:text-base">
                {formatCurrency(item.lineTotal)}
              </div>
            </li>
          ))}
        </ul>

        <div className="h-fit rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800">Order Summary</h2>
          <div className="mt-3 flex justify-between text-sm text-slate-600">
            <span>Subtotal ({cart.itemCount} item{cart.itemCount === 1 ? "" : "s"})</span>
            <span className="font-medium text-slate-900">{formatCurrency(cart.subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-slate-400">+ ₹40 flat shipping at checkout · prices include tax</p>
          {!isAuthenticated && (
            <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700">
              🔒 You'll need to sign in to complete your order — your cart will be saved.
            </p>
          )}
          <Button className="mt-4 w-full" size="lg" onClick={() => navigate("/checkout")}>
            Proceed to checkout
          </Button>
          <Link to="/products" className="mt-3 block text-center text-xs font-medium text-brand-600 hover:text-brand-700">
            ← Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
