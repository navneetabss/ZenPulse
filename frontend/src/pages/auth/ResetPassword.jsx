import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { KeyRound } from "lucide-react";
import AuthLayout from "../../components/AuthLayout";
import api from "../../api/axios";

const ResetPassword = () => {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await api.put(`/auth/reset-password/${resetToken}`, { password: form.password });
      localStorage.setItem("hcp_token", res.data.token);
      localStorage.setItem("hcp_user", JSON.stringify(res.data.user));
      toast.success("Password reset successfully!");
      navigate(`/${res.data.user.role}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset link is invalid or has expired");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Set a new password" subtitle="Choose a strong password you haven't used before">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-text">New password</label>
          <input
            type="password"
            required
            minLength={6}
            className="input-field"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <div>
          <label className="label-text">Confirm new password</label>
          <input
            type="password"
            required
            className="input-field"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
          <KeyRound size={16} />
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>

      <p className="text-sm text-ink/50 text-center mt-6">
        <Link to="/login" className="text-brand-600 font-medium hover:text-brand-700">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ResetPassword;
