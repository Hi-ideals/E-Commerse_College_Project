import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { productsApi } from "../api/products.api";
import { extractErrorMessage } from "../api/axiosClient";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/format";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    productsApi
      .getById(id)
      .then((data) => {
        setProduct(data);
        setQuantity(1);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAddToCart() {
    setAdding(true);
    try {
      await addItem(product.id, quantity);
      toast.success(`Added ${quantity} × ${product.name} to cart`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not add to cart"));
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <Spinner className="min-h-[60vh]" />;

  if (notFound || !product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-5xl">📦</p>
        <h1 className="mt-4 text-xl font-semibold text-slate-800">Product not found</h1>
        <p className="mt-1 text-sm text-slate-500">It may have been removed or is no longer available.</p>
        <Link to="/products">
          <Button className="mt-6">Browse products</Button>
        </Link>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <nav className="mb-4 text-sm text-slate-500">
        <Link to="/products" className="hover:text-brand-600">Products</Link>
        {product.category && (
          <>
            <span className="mx-1.5">/</span>
            <Link to={`/products?category=${product.category.slug}`} className="hover:text-brand-600">
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="aspect-square w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-7xl text-slate-300">📦</div>
          )}
        </div>

        <div className="flex flex-col">
          {product.category && (
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              {product.category.name}
            </span>
          )}
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{product.name}</h1>
          <p className="mt-3 text-3xl font-bold text-slate-900">{formatCurrency(product.price)}</p>

          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            {product.description || "No description provided for this product."}
          </p>

          <div className="mt-4">
            {outOfStock ? (
              <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                Out of stock
              </span>
            ) : (
              <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                {product.stock} in stock
              </span>
            )}
          </div>

          {!outOfStock && (
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center rounded-lg border border-slate-300">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-50"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-50"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <Button
            size="lg"
            className="mt-6 w-full sm:w-auto"
            disabled={outOfStock}
            loading={adding}
            onClick={handleAddToCart}
          >
            {outOfStock ? "Out of stock" : "Add to cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}
