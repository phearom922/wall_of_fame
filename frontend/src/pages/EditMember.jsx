import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import MemberForm from "../components/MemberForm";
import api from "../api/client";
import { useNavigate, useParams } from "react-router-dom";

const EditMember = () => {
  const { id } = useParams();
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await api.get(`/api/members/${id}`);
        setInitial(res.data);
      } catch (e) {
        setErr("ไม่พบสมาชิกหรือโหลดข้อมูลไม่สำเร็จ");
      }
    };
    fetchMember();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      setErr("");
      setLoading(true);
      await api.put(`/api/members/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/admin/members");
    } catch (e) {
      setErr(e?.response?.data?.message || "อัปเดตข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-100 ml-64">
        <h1 className="text-2xl font-bold mb-4">Edit Member</h1>
        {err && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        )}
        <div className="bg-white rounded shadow p-4">
          {initial ? (
            <MemberForm
              initialValues={initial}
              onSubmit={handleSubmit}
              loading={loading}
              mode="edit"
            />
          ) : (
            <div className="text-gray-600">กำลังโหลดข้อมูล...</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EditMember;
