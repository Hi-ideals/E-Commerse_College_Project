import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { extractErrorMessage } from "../api/axiosClient";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function RegisterPage() {
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", username: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const next = {};
    if (form.name.trim().length < 2) next.name = "Name must be at least 2 characters";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address";
    if (!/^[a-zA-Z0-9_.]{3,}$/.test(form.username)) {
      next.username = "3+ characters: letters, numbers, underscores, dots only";
    }
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      next.password = "8+ characters with at least one letter and one number";
    }
    if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords do not match";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        username: form.username.trim(),
        password: form.password,
      });
      await login(form.email.trim(), form.password);
      toast.success("Account created! Welcome to SmartShop.");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(extractErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center bg-gradient-to-br from-brand-50 via-white to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-2xl text-white shadow-lg shadow-brand-600/30">
            🛍️
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Join SmartShop in a few seconds</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              label="Full name"
              name="name"
              autoComplete="name"
              placeholder="Jane Doe"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              error={errors.name}
            />
            <Input
              label="Email address"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              error={errors.email}
            />
            <Input
              label="Username"
              name="username"
              autoComplete="username"
              placeholder="janedoe"
              value={form.username}
              onChange={(e) => update("username", e.target.value)}
              error={errors.username}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Password"
                type="password"
                name="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                error={errors.password}
              />
              <Input
                label="Confirm password"
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                error={errors.confirmPassword}
              />
            </div>

            <Button type="submit" loading={loading} className="mt-2 w-full" size="lg">
              Create account
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
