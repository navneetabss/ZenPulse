import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, LogIn } from "lucide-react";
import AuthLayout from "../../components/AuthLayout";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      navigate(`/${user.role}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign in to your account" subtitle="Enter your credentials to access your dashboard">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-text">Email address</label>
          <input
            type="email"
            required
            className="input-field"
            placeholder="you@hospital.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label-text mb-0">Password</label>
            <Link to="/forgot-password" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              className="input-field pr-10"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/70"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
          <LogIn size={16} />
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-ink/50 text-center mt-6">
        New patient?{" "}
        <Link to="/register" className="text-brand-600 font-medium hover:text-brand-700">
          Create an account
        </Link>
      </p>

      <div className="mt-8 pt-6 border-t border-brand-100/60">
        <p className="text-xs text-ink/40 text-center leading-relaxed">
          Doctor, nurse or staff account? Ask your administrator to create one for you from Manage
          Users.
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
