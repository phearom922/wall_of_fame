import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import MemberForm from "../components/MemberForm";
import api from "../api/client";
import { useNavigate } from "react-router-dom";

const AddMember = () => {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      setErr("");
      setLoading(true);
      await api.post("/api/members", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/admin/dashboard");
    } catch (e) {
      setErr(e?.response?.data?.message || "สร้างสมาชิกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar />
      <main className="flex-1 p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Dashboard
            </button>
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Add New Member</h1>
          <p className="text-slate-600 mt-2">
            Create a new member profile with image and details
          </p>
        </div>

        {/* Error Alert */}
        {err && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <span className="font-medium">Error</span>
            </div>
            <p className="mt-1 text-sm">{err}</p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <MemberForm onSubmit={handleSubmit} loading={loading} mode="create" />
        </div>
      </main>
    </div>
  );
};

export default AddMember;
