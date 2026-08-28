import Input from "../../components/ui/Input";

export default function ProductFilters({ categories, filters, onChange, onReset }) {
  return (
    <div className="flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Filters</h3>
          <button onClick={onReset} className="text-xs font-medium text-brand-600 hover:text-brand-700">
            Reset
          </button>
        </div>
        <Input
          placeholder="Search products..."
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Category</h4>
        <div className="flex flex-col gap-1.5">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="category"
              checked={!filters.category}
              onChange={() => onChange({ category: "" })}
              className="accent-brand-600"
            />
            All categories
          </label>
          {categories.map((c) => (
            <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input
                type="radio"
                name="category"
                checked={filters.category === c.slug}
                onChange={() => onChange({ category: c.slug })}
                className="accent-brand-600"
              />
              {c.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Price range</h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => onChange({ minPrice: e.target.value })}
            className="w-full"
          />
          <span className="text-slate-400">–</span>
          <Input
            type="number"
            min="0"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => onChange({ maxPrice: e.target.value })}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
