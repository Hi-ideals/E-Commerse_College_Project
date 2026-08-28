import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { productsApi, categoriesApi } from "../api/products.api";
import { useDebounce } from "../hooks/useDebounce";
import ProductCard from "../features/products/ProductCard";
import ProductFilters from "../features/products/ProductFilters";
import Pagination from "../components/ui/Pagination";
import Spinner from "../components/ui/Spinner";

const EMPTY_FILTERS = { search: "", category: "", minPrice: "", maxPrice: "" };

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
  });
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const [categories, setCategories] = useState([]);
  const [result, setResult] = useState({ items: [], totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const debouncedSearch = useDebounce(filters.search, 400);

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {});
  }, []);

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      category: filters.category || undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice || undefined,
      page,
      limit: 12,
    }),
    [debouncedSearch, filters.category, filters.minPrice, filters.maxPrice, page]
  );

  useEffect(() => {
    setLoading(true);
    setError(null);
    productsApi
      .list(queryParams)
      .then(setResult)
      .catch(() => setError("Could not load products. Please try again."))
      .finally(() => setLoading(false));

    const next = {};
    Object.entries(queryParams).forEach(([k, v]) => {
      if (v) next[k] = String(v);
    });
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  function updateFilters(patch) {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  }

  function resetFilters() {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">All Products</h1>
      <p className="mt-1 text-sm text-slate-500">
        {loading ? "Loading…" : `${result.totalItems} product${result.totalItems === 1 ? "" : "s"} found`}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <ProductFilters
            categories={categories}
            filters={filters}
            onChange={updateFilters}
            onReset={resetFilters}
          />
        </aside>

        <div>
          {loading ? (
            <Spinner />
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
              {error}
            </div>
          ) : result.items.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
              <p className="text-4xl">🔍</p>
              <p className="mt-2 font-medium text-slate-700">No products match your filters</p>
              <p className="text-sm text-slate-500">Try adjusting your search or price range.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                {result.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Pagination page={page} totalPages={result.totalPages} onChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
