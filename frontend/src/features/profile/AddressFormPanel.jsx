import { useState } from "react";
import AddressForm from "../checkout/AddressForm";
import Button from "../../components/ui/Button";

const EMPTY = { label: "", line1: "", line2: "", city: "", state: "", postalCode: "", country: "", isDefault: false };

export default function AddressFormPanel({ initialValue, onSubmit, onCancel, submitLabel = "Save address" }) {
  const [value, setValue] = useState(initialValue || EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function validate() {
    const next = {};
    if (!value.line1?.trim()) next.line1 = "Required";
    if (!value.city?.trim()) next.city = "Required";
    if (!value.postalCode?.trim()) next.postalCode = "Required";
    if (!value.country?.trim()) next.country = "Required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit(value);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <AddressForm value={value} onChange={setValue} errors={errors} />
      <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={!!value.isDefault}
          onChange={(e) => setValue((v) => ({ ...v, isDefault: e.target.checked }))}
          className="accent-brand-600"
        />
        Set as default address
      </label>

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
