import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/format";

export default function ProductCard({ product }) {
  const outOfStock = product.stock <= 0;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-slate-300">📦</div>
        )}
        {outOfStock && (
          <span className="absolute left-2 top-2 rounded-full bg-slate-900/80 px-2 py-0.5 text-xs font-semibold text-white">
            Out of stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        {product.category && (
          <span className="text-xs font-medium uppercase tracking-wide text-brand-600">
            {product.category.name}
          </span>
        )}
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-800 sm:text-base">{product.name}</h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-base font-bold text-slate-900 sm:text-lg">{formatCurrency(product.price)}</span>
          {!outOfStock && <span className="text-xs text-slate-400">{product.stock} in stock</span>}
        </div>
      </div>
    </Link>
  );
}
