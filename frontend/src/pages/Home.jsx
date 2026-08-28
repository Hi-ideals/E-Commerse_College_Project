import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productsApi, categoriesApi } from "../api/products.api";
import ProductCard from "../features/products/ProductCard";
import Spinner from "../components/ui/Spinner";
import Button from "../components/ui/Button";

const CATEGORY_ICONS = {
  electronics: "💻",
  clothing: "👕",
  "home-kitchen": "🏠",
  books: "📚",
};

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([productsApi.list({ limit: 8 }), categoriesApi.list()])
      .then(([products, cats]) => {
        setFeatured(products.items);
        setCategories(cats);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-600 via-brand-700 to-slate-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Shop smarter, ship faster.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-brand-100 sm:text-base">
            Curated products, transparent tracking, and invoices you can trust —
            all in one smart e-commerce experience.
          </p>
          <Link to="/products">
            <Button size="lg" className="mt-8 text-shadow-lg  text-brand-200 hover:bg-brand-50">
              Start shopping →
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Shop by category</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/products?category=${c.slug}`}
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
            >
              <span className="text-3xl sm:text-4xl">{CATEGORY_ICONS[c.slug] || "🛍️"}</span>
              <span className="text-sm font-medium text-slate-700">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Featured products</h2>
          <Link to="/products" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
            View all →
          </Link>
        </div>

        {loading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
