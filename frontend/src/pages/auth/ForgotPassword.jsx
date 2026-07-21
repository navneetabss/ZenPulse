import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, ArrowRight } from "lucide-react";
import AuthLayout from "../../components/AuthLayout";
import api from "../../api/axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setSent(true);
      // NOTE: In this project there's no email service wired up, so the API returns
      // the reset token directly for demo purposes. In production this would be emailed.
      if (res.data.resetToken) setDevToken(res.data.resetToken);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="We'll help you get back into your account">
      {!sent ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Email address</label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="you@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            <Mail size={16} />
            {loading ? "Sending..." : "Send reset instructions"}
          </button>
        </form>
      ) : (
        <div className="card bg-brand-50/60 border-brand-100">
          <p className="text-sm text-ink/70 leading-relaxed">
            If an account exists for <span className="font-medium">{email}</span>, reset
            instructions have been generated.
          </p>
          {devToken && (
            <div className="mt-4 pt-4 border-t border-brand-100">
              <p className="text-xs text-ink/40 mb-2">
                Demo mode (no email service configured) — use this link to continue:
              </p>
              <Link
                to={`/reset-password/${devToken}`}
                className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                Continue to reset password <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      )}

      <p className="text-sm text-ink/50 text-center mt-6">
        Remembered it?{" "}
        <Link to="/login" className="text-brand-600 font-medium hover:text-brand-700">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPassword;
