import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { productsApi, categoriesApi } from "../../api/products.api";
import { extractErrorMessage } from "../../api/axiosClient";
import { formatCurrency } from "../../utils/format";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import ProductFormPanel from "../../features/admin/ProductFormPanel";

export default function AdminProducts() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {});
  }, []);

  function loadProducts() {
    setLoading(true);
    productsApi
      .list({ limit: 100, includeInactive: showInactive })
      .then((data) => setProducts(data.items))
      .finally(() => setLoading(false));
  }

  useEffect(loadProducts, [showInactive]);

  async function handleCreate(formData) {
    try {
      await productsApi.create(formData);
      toast.success("Product created");
      setCreating(false);
      loadProducts();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not create product"));
    }
  }

  async function handleUpdate(id, formData) {
    try {
      await productsApi.update(id, formData);
      toast.success("Product updated");
      setEditingId(null);
      loadProducts();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not update product"));
    }
  }

  async function handleDeactivate(product) {
    setBusyId(product.id);
    try {
      await productsApi.remove(product.id);
      toast.success(`"${product.name}" deactivated`);
      loadProducts();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not deactivate product"));
    } finally {
      setBusyId(null);
    }
  }

  async function handleReactivate(product) {
    setBusyId(product.id);
    try {
      const formData = new FormData();
      formData.append("isActive", "true");
      await productsApi.update(product.id, formData);
      toast.success(`"${product.name}" reactivated`);
      loadProducts();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not reactivate product"));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">Products</h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="accent-brand-600"
            />
            Show deactivated
          </label>
          {!creating && <Button size="sm" onClick={() => setCreating(true)}>+ Add product</Button>}
        </div>
      </div>

      {creating && (
        <ProductFormPanel categories={categories} onSubmit={handleCreate} onCancel={() => setCreating(false)} />
      )}

      {loading ? (
        <Spinner />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) =>
                editingId === p.id ? (
                  <tr key={p.id}>
                    <td colSpan={6} className="p-3">
                      <ProductFormPanel
                        categories={categories}
                        initialValue={p}
                        submitLabel="Save changes"
                        onSubmit={(fd) => handleUpdate(p.id, fd)}
                        onCancel={() => setEditingId(null)}
                      />
                    </td>
                  </tr>
                ) : (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0">
                    <td className="flex items-center gap-3 px-4 py-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-300">📦</div>
                        )}
                      </div>
                      <span className="line-clamp-1 font-medium text-slate-800">{p.name}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.category?.name || "—"}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{formatCurrency(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={p.stock <= 10 ? "font-semibold text-red-600" : "text-slate-700"}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          p.isActive ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2 text-xs font-medium">
                        <button
                          onClick={() => setEditingId(p.id)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-slate-600 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        {p.isActive ? (
                          <button
                            disabled={busyId === p.id}
                            onClick={() => handleDeactivate(p)}
                            className="rounded-lg border border-red-200 px-2.5 py-1.5 text-red-600 hover:bg-red-50 disabled:opacity-40"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            disabled={busyId === p.id}
                            onClick={() => handleReactivate(p)}
                            className="rounded-lg border border-green-200 px-2.5 py-1.5 text-green-700 hover:bg-green-50 disabled:opacity-40"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              )}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
