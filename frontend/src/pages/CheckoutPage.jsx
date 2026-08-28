import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { usersApi } from "../api/users.api";
import { ordersApi } from "../api/orders.api";
import { extractErrorMessage } from "../api/axiosClient";
import { formatCurrency, SHIPPING_FEE } from "../utils/format";
import AddressForm from "../features/checkout/AddressForm";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";

const PAYMENT_METHODS = [
  { value: "COD", label: "Cash on Delivery" },
  { value: "CARD", label: "Credit / Debit Card" },
  { value: "UPI", label: "UPI" },
  { value: "NETBANKING", label: "Net Banking" },
];

const EMPTY_ADDRESS = { label: "", line1: "", line2: "", city: "", state: "", postalCode: "", country: "" };

export default function CheckoutPage() {
  const { cart, loading: cartLoading, refresh: refreshCart } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState(EMPTY_ADDRESS);
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [placingOrder, setPlacingOrder] = useState(false);
  const orderPlacedRef = useRef(false);

  useEffect(() => {
    usersApi
      .listAddresses()
      .then((data) => {
        setAddresses(data);
        const def = data.find((a) => a.isDefault) || data[0];
        if (def) setSelectedAddressId(def.id);
        else setUseNewAddress(true);
      })
      .catch(() => setUseNewAddress(true))
      .finally(() => setLoadingAddresses(false));
  }, []);

  useEffect(() => {
    if (!orderPlacedRef.current && !cartLoading && cart.items.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [cartLoading, cart.items.length, navigate]);

  function validateNewAddress() {
    const next = {};
    if (!newAddress.line1?.trim()) next.line1 = "Required";
    if (!newAddress.city?.trim()) next.city = "Required";
    if (!newAddress.postalCode?.trim()) next.postalCode = "Required";
    if (!newAddress.country?.trim()) next.country = "Required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handlePlaceOrder() {
    if (useNewAddress || addresses.length === 0) {
      if (!validateNewAddress()) return;
    } else if (!selectedAddressId) {
      toast.error("Please select a shipping address");
      return;
    }

    setPlacingOrder(true);
    try {
      const payload =
        useNewAddress || addresses.length === 0
          ? { shippingAddress: newAddress, paymentMethod }
          : { addressId: selectedAddressId, paymentMethod };

      const order = await ordersApi.checkout(payload);
      orderPlacedRef.current = true; // stop the empty-cart guard from hijacking this navigation
      toast.success("Order placed successfully!");
      navigate(`/orders/${order.id}`, { replace: true });
      refreshCart(); // sync cart state in the background; no need to await it
    } catch (err) {
      toast.error(extractErrorMessage(err, "Checkout failed"));
    } finally {
      setPlacingOrder(false);
    }
  }

  if (cartLoading || loadingAddresses) return <Spinner className="min-h-[60vh]" />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Checkout</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          {/* Shipping address */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-slate-800">Shipping Address</h2>

            {addresses.length > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${
                      !useNewAddress && selectedAddressId === addr.id
                        ? "border-brand-500 bg-brand-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      className="mt-1 accent-brand-600"
                      checked={!useNewAddress && selectedAddressId === addr.id}
                      onChange={() => {
                        setSelectedAddressId(addr.id);
                        setUseNewAddress(false);
                      }}
                    />
                    <span>
                      {addr.label && <span className="font-semibold text-slate-800">{addr.label} · </span>}
                      {addr.line1}
                      {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}
                      {addr.state ? `, ${addr.state}` : ""} {addr.postalCode}, {addr.country}
                      {addr.isDefault && (
                        <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                          Default
                        </span>
                      )}
                    </span>
                  </label>
                ))}

                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm ${
                    useNewAddress ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    className="accent-brand-600"
                    checked={useNewAddress}
                    onChange={() => setUseNewAddress(true)}
                  />
                  <span className="font-medium text-slate-700">Use a new address</span>
                </label>
              </div>
            )}

            {(useNewAddress || addresses.length === 0) && (
              <div className="mt-4">
                <AddressForm value={newAddress} onChange={setNewAddress} errors={errors} />
              </div>
            )}
          </section>

          {/* Payment method */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-slate-800">Payment Method</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.value}
                  className={`cursor-pointer rounded-lg border p-3 text-center text-xs font-medium ${
                    paymentMethod === m.value
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={m.value}
                    checked={paymentMethod === m.value}
                    onChange={() => setPaymentMethod(m.value)}
                    className="sr-only"
                  />
                  {m.label}
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Order summary */}
        <div className="h-fit rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800">Order Summary</h2>
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between text-slate-600">
                <span className="line-clamp-1 pr-2">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="shrink-0 font-medium text-slate-900">{formatCurrency(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-sm text-slate-600">
            <span>Subtotal</span>
            <span className="font-medium text-slate-900">{formatCurrency(cart.subtotal)}</span>
          </div>
          <div className="mt-1.5 flex justify-between text-sm text-slate-600">
            <span>Shipping</span>
            <span className="font-medium text-slate-900">{formatCurrency(SHIPPING_FEE)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-slate-100 pt-2 text-base font-bold text-slate-900">
            <span>Total</span>
            <span>{formatCurrency(cart.subtotal + SHIPPING_FEE)}</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Prices shown are inclusive of applicable taxes.</p>

          <Button className="mt-4 w-full" size="lg" loading={placingOrder} onClick={handlePlaceOrder}>
            Place order
          </Button>
        </div>
      </div>
    </div>
  );
}
