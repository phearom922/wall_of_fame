import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/client";
import { PIN_OPTIONS } from "../constants/pins";
import { useNavigate } from "react-router-dom";

const StatCard = ({ title, value, subtitle, color = "blue", onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer ${
      onClick ? "hover:border-blue-300" : ""
    }`}
  >
    <div className="flex items-center justify-between mb-2">
      <div
        className={`w-12 h-12 rounded-xl bg-${color}-100 flex items-center justify-center`}
      >
        <svg
          className={`w-6 h-6 text-${color}-600`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>
    </div>
    <div className="text-3xl font-bold text-slate-800 mb-1">{value}</div>
    <div className="text-sm font-medium text-slate-600">{title}</div>
    {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
  </div>
);

const PinCard = ({ title, value, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-xl border border-slate-200 p-4 transition-all duration-200 hover:shadow-md hover:border-blue-300 cursor-pointer"
  >
    <div className="text-lg font-semibold text-slate-800 mb-1">{value}</div>
    <div className="text-sm text-slate-600 truncate">{title}</div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({ active: 0, expired: 0, pin: {} });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/members/stats");
        setStats(res.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalMembers = (stats?.active || 0) + (stats?.expired || 0);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 h-32"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar />
      <main className="flex-1 p-6 ml-64">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Dashboard Overview
          </h1>
          <p className="text-slate-600">
            Welcome to your member management dashboard
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Members"
            value={totalMembers}
            color="blue"
            onClick={() => navigate("/admin/members")}
          />
          <StatCard
            title="Active Members"
            value={stats.active || 0}
            subtitle="Currently active"
            color="green"
            onClick={() => navigate("/admin/members?status=active")}
          />
          <StatCard
            title="Expired Members"
            value={stats.expired || 0}
            subtitle="Membership ended"
            color="red"
            onClick={() => navigate("/admin/members?status=expired")}
          />
          <StatCard
            title="Total Pins"
            value={PIN_OPTIONS.length}
            subtitle="Active categories"
            color="purple"
            onClick={() => navigate("/admin/reorder")}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/admin/members/add")}
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-slate-800">Add Member</div>
                <div className="text-sm text-slate-500">
                  Create new member profile
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/admin/members")}
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-slate-800">
                  Manage Members
                </div>
                <div className="text-sm text-slate-500">
                  View and edit all members
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/admin/reorder")}
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-slate-800">
                  Reorder Members
                </div>
                <div className="text-sm text-slate-500">
                  Drag and drop sorting
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Pins Overview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-800">
              Members by Pin
            </h2>
            <span className="text-sm text-slate-500">
              {Object.keys(stats.pin || {}).length} active pins
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {PIN_OPTIONS.map((pin) => (
              <PinCard
                key={pin}
                title={pin}
                value={stats.pin?.[pin] || 0}
                onClick={() =>
                  navigate(`/admin/members?pin=${encodeURIComponent(pin)}`)
                }
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
