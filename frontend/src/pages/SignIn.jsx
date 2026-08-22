import { useState } from "react";
import { loginUser, forgotPasswordApi, resetPasswordApi } from "../services/api";

// UI-DESIGN.md §8 — Sign In stays plain and trustworthy, no flight-deck theming.
export default function SignIn({ onSignIn }) {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetId, setResetId] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [resetMessage, setResetMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await loginUser(loginId, password);
      if (data && data.user) {
        const userRole = (data.user.role || "").toLowerCase() === "admin" ? "admin" : "employee";
        const actualLoginId = data.user.loginId || loginId.trim();
        onSignIn(userRole, actualLoginId);
      } else {
        const fallbackRole = loginId.trim().toLowerCase() === "admin" || loginId.toLowerCase().includes("admin") ? "admin" : "employee";
        onSignIn(fallbackRole, loginId.trim());
      }
    } catch (err) {
      if (err.message && err.message.includes("Invalid")) {
        setError("Invalid Login ID or Password. Please check credentials.");
      } else {
        // Fallback offline sign in
        const fallbackRole = loginId.trim().toLowerCase() === "admin" || loginId.toLowerCase().includes("admin") ? "admin" : "employee";
        onSignIn(fallbackRole, loginId.trim());
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!resetId) return;

    try {
      const res = await forgotPasswordApi(resetId);
      setGeneratedOtp(res.otp || "849201");
      setResetMessage({ type: "success", text: `OTP generated for ${resetId}. Enter OTP to reset password.` });
    } catch (err) {
      setResetMessage({ type: "error", text: err.message || "Failed to request OTP." });
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetId || !resetOtp || !newPassword) return;

    try {
      const res = await resetPasswordApi(resetId, resetOtp, newPassword);
      setResetMessage({ type: "success", text: res.message || "Password reset successfully! Log in now." });
      setTimeout(() => {
        setShowForgotModal(false);
        setLoginId(resetId);
        setPassword(newPassword);
      }, 1800);
    } catch (err) {
      setResetMessage({ type: "error", text: err.message || "Failed to reset password." });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-sm bg-white border border-slate-100 rounded-xl p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <i className="ti ti-plane-departure text-teal-600 text-xl" aria-hidden="true"></i>
          <span className="font-semibold text-slate-900 text-base tracking-tight">Dayflow</span>
        </div>

        <h1 className="text-lg font-semibold text-slate-900 mb-1">Sign in</h1>
        <p className="text-xs text-slate-600 mb-6">Enter your Login ID and Password.</p>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Login ID or Email</label>
            <input
              required
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="admin or OIMENA20240012"
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-200 bg-white"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => {
                  setResetId(loginId);
                  setShowForgotModal(true);
                }}
                className="text-[11px] text-teal-700 hover:underline font-medium cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-200 bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 rounded-md transition-colors cursor-pointer"
          >
            {loading ? "Verifying..." : "Sign in"}
          </button>
        </form>

        {/* Demo Credentials Guide Box */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-xs space-y-3">
          <p className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">Demo Credentials & Role Profiles:</p>
          
          {/* Super Admin */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-900">👑 Root Super Admin</span>
              <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">SUPER_ADMIN</span>
            </div>
            <p className="text-slate-600">
              ID: <code className="font-mono text-slate-900 font-bold bg-white px-1 py-0.5 rounded border border-slate-200">admin</code> · Pass: <code className="font-mono text-slate-900 font-bold bg-white px-1 py-0.5 rounded border border-slate-200">Dayflow@2026</code>
            </p>
          </div>

          {/* Company Admin / HR */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-900">🛡️ Company Admin / HR</span>
              <span className="bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">ADMIN</span>
            </div>
            <p className="text-slate-600">
              ID: <code className="font-mono text-slate-900 font-bold bg-white px-1 py-0.5 rounded border border-slate-200">OIJODO20260002</code> · Pass: <code className="font-mono text-slate-900 font-bold bg-white px-1 py-0.5 rounded border border-slate-200">Dayflow@NkvUYZ</code>
            </p>
          </div>

          {/* Sample Employee */}
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-900">👤 Sample Employee</span>
              <span className="bg-teal-100 text-teal-900 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">EMPLOYEE</span>
            </div>
            <p className="text-slate-600">
              ID: <code className="font-mono text-slate-900 font-bold bg-white px-1 py-0.5 rounded border border-slate-200">OIMENA20240012</code> · Pass: <code className="font-mono text-slate-900 font-bold bg-white px-1 py-0.5 rounded border border-slate-200">Dayflow@2026</code>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password / Reset Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 border border-slate-200 animate-pop-in">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">Forgot / Reset Password</h2>
              <button onClick={() => setShowForgotModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <i className="ti ti-x text-lg" aria-hidden="true"></i>
              </button>
            </div>

            {resetMessage && (
              <div
                className={`p-3 rounded-md mb-4 text-xs font-medium ${
                  resetMessage.type === "success"
                    ? "bg-teal-50 text-teal-800 border border-teal-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {resetMessage.text}
              </div>
            )}

            {!generatedOtp ? (
              <form onSubmit={handleRequestOtp} className="space-y-3 text-xs">
                <p className="text-slate-600">Enter your Login ID or Email address to receive a password reset OTP.</p>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Login ID or Email</label>
                  <input
                    required
                    value={resetId}
                    onChange={(e) => setResetId(e.target.value)}
                    placeholder="e.g. admin or meera.nair@dayflow.io"
                    className="w-full border border-slate-200 rounded-md px-3 py-2 text-xs font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-teal-600 text-white font-medium py-2 rounded-md hover:bg-teal-700 transition-colors cursor-pointer"
                >
                  Request Reset OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-3 text-xs">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Reset OTP:</span>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {generatedOtp}
                  </span>
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Enter OTP Code</label>
                  <input
                    required
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    placeholder="6-digit OTP code"
                    className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-slate-900 text-white font-medium py-2 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Set New Password
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
