// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/client";
import { PIN_OPTIONS } from "../constants/pins"; // ✅ ใช้รายการ PIN ตามลำดับที่กำหนด

const StatCard = ({ title, value }) => (
  <div className="bg-white rounded shadow p-4">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="text-3xl font-bold">{value}</div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({ active: 0, expired: 0, pin: {} });

  useEffect(() => {
    const load = async () => {
      const res = await api.get("/api/members/stats");
      setStats(res.data);
    };
    load();
  }, []);

  const totalMembers = (stats?.active || 0) + (stats?.expired || 0);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <StatCard title="Total Members" value={totalMembers} />
          <StatCard title="Active" value={stats.active || 0} />
          <StatCard title="Expired" value={stats.expired || 0} />
        </div>

        {/* Pins (Dynamic) */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {PIN_OPTIONS.map((pin) => (
            <StatCard key={pin} title={pin} value={stats.pin?.[pin] || 0} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
