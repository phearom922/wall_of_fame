import React, { useState, useEffect } from "react";
import api from "../api/client";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // ถ้ามี token แล้ว ให้เด้งไป dashboard
    if (localStorage.getItem("token")) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.username || !form.password) {
      setError("กรุณากรอก Username และ Password");
      return;
    }
    try {
      setLoading(true);
      const res = await api.post("/api/auth/login", form);
      localStorage.setItem("token", res.data.token);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || "เข้าสู่ระบบไม่สำเร็จ";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-1 text-gray-900">Admin Login</h1>
        <p className="text-sm text-gray-500 mb-6">
          เข้าสู่ระบบเพื่อจัดการสมาชิก
        </p>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={onChange}
              autoComplete="username"
              className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              autoComplete="current-password"
              className="w-full rounded border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-blue-600 py-2 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
