import Input from "../../components/ui/Input";

export default function AddressForm({ value, onChange, errors = {} }) {
  function update(field, v) {
    onChange({ ...value, [field]: v });
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Input
        label="Label (optional)"
        placeholder="Home, Office…"
        value={value.label || ""}
        onChange={(e) => update("label", e.target.value)}
        className="sm:col-span-2"
      />
      <Input
        label="Address line 1"
        value={value.line1 || ""}
        onChange={(e) => update("line1", e.target.value)}
        error={errors.line1}
        className="sm:col-span-2"
      />
      <Input
        label="Address line 2 (optional)"
        value={value.line2 || ""}
        onChange={(e) => update("line2", e.target.value)}
        className="sm:col-span-2"
      />
      <Input label="City" value={value.city || ""} onChange={(e) => update("city", e.target.value)} error={errors.city} />
      <Input label="State / Province" value={value.state || ""} onChange={(e) => update("state", e.target.value)} />
      <Input
        label="Postal code"
        value={value.postalCode || ""}
        onChange={(e) => update("postalCode", e.target.value)}
        error={errors.postalCode}
      />
      <Input
        label="Country"
        value={value.country || ""}
        onChange={(e) => update("country", e.target.value)}
        error={errors.country}
      />
    </div>
  );
}
