import { useState } from "react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

const EMPTY = { name: "", description: "", price: "", stock: "", categoryId: "" };

export default function ProductFormPanel({ categories, initialValue, onSubmit, onCancel, submitLabel = "Save product" }) {
  const [value, setValue] = useState(
    initialValue
      ? {
          name: initialValue.name,
          description: initialValue.description || "",
          price: initialValue.price,
          stock: initialValue.stock,
          categoryId: initialValue.category?.id || "",
        }
      : EMPTY
  );
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function update(field, v) {
    setValue((val) => ({ ...val, [field]: v }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const next = {};
    if (!value.name?.trim() || value.name.trim().length < 2) next.name = "Name must be at least 2 characters";
    if (value.price === "" || Number(value.price) < 0) next.price = "Enter a valid price";
    if (value.stock === "" || Number(value.stock) < 0 || !Number.isInteger(Number(value.stock))) {
      next.stock = "Enter a valid whole number";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", value.name.trim());
      formData.append("description", value.description || "");
      formData.append("price", value.price);
      formData.append("stock", value.stock);
      if (value.categoryId) formData.append("categoryId", value.categoryId);
      if (imageFile) formData.append("image", imageFile);

      await onSubmit(formData);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Product name"
          value={value.name}
          onChange={(e) => update("name", e.target.value)}
          error={errors.name}
          className="sm:col-span-2"
        />
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">Description</label>
          <textarea
            rows={3}
            value={value.description}
            onChange={(e) => update("description", e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <Input
          label="Price"
          type="number"
          min="0"
          step="0.01"
          value={value.price}
          onChange={(e) => update("price", e.target.value)}
          error={errors.price}
        />
        <Input
          label="Stock"
          type="number"
          min="0"
          step="1"
          value={value.stock}
          onChange={(e) => update("stock", e.target.value)}
          error={errors.stock}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Category</label>
          <select
            value={value.categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">
            Product image {initialValue && "(optional — leave empty to keep current)"}
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-brand-700"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button type="submit" loading={saving} size="sm">
          {submitLabel}
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
