import { useState } from "react";

// UI-DESIGN.md §8 — Sign In stays plain and trustworthy, no flight-deck theming.
export default function SignIn({ onSignIn }) {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white border border-slate-100 rounded-xl p-8">
        <div className="flex items-center gap-2 mb-6">
          <i className="ti ti-plane-departure text-teal-600 text-xl" aria-hidden="true"></i>
          <span className="font-medium text-slate-900">Dayflow</span>
        </div>

        <h1 className="text-lg font-medium text-slate-900 mb-1">Sign in</h1>
        <p className="text-sm text-slate-600 mb-6">Enter your login ID and password.</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSignIn(loginId.toLowerCase().includes("admin") ? "admin" : "employee");
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-sm text-slate-700 block mb-1">Login ID or email</label>
            <input
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="OIMENA20240012"
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-200"
            />
          </div>
          <div>
            <label className="text-sm text-slate-700 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-slate-900 text-white text-sm font-medium py-2 rounded-md hover:bg-slate-800"
          >
            Sign in
          </button>
        </form>

        <p className="text-xs text-slate-400 mt-4">
          Demo: type "admin" in the login ID to see the admin view, anything else signs in as an employee.
        </p>
      </div>
    </div>
  );
}
