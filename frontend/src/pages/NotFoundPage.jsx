import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-7xl">🧭</p>
      <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">Page not found</h1>
      <p className="mt-2 max-w-md text-slate-500">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/">
        <Button className="mt-6">Back to home</Button>
      </Link>
    </div>
  );
}
