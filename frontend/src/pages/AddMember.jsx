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
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Add Member</h1>
        {err && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        )}
        <div className="bg-white rounded shadow p-4">
          <MemberForm onSubmit={handleSubmit} loading={loading} mode="create" />
        </div>
      </main>
    </div>
  );
};

export default AddMember;
