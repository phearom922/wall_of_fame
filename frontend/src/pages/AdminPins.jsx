import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/client";

const AdminPins = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    rank: 1,
    color: "",
    logoFile: null,
  });
  const [error, setError] = useState("");
  const [memberCounts, setMemberCounts] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [pinsRes, membersRes] = await Promise.all([
        api.get("/api/pins"),
        api.get("/api/members?limit=1000"),
      ]);

      setRows(pinsRes.data || []);

      // คำนวณจำนวนสมาชิกในแต่ละ Pin
      const counts = {};
      (membersRes.data?.data || []).forEach((member) => {
        counts[member.pin] = (counts[member.pin] || 0) + 1;
      });
      setMemberCounts(counts);
    } catch (error) {
      console.error("Failed to load pins:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", rank: rows.length + 1, color: "", logoFile: null });
    setOpenModal(true);
    setError("");
  };

  const openEdit = (pin) => {
    setEditing(pin);
    setForm({
      name: pin.name,
      rank: pin.rank,
      color: pin.color || "",
      logoFile: null,
    });
    setOpenModal(true);
    setError("");
  };

  const onChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "logo") {
      setForm((f) => ({ ...f, logoFile: files?.[0] || null }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("rank", String(form.rank));
      if (form.color) fd.append("color", form.color);
      if (form.logoFile) fd.append("logo", form.logoFile);

      if (editing) {
        await api.put(`/api/pins/${editing._id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/api/pins", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setOpenModal(false);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "บันทึกไม่สำเร็จ");
    }
  };

  const del = async (pin) => {
    if (!confirm(`ลบ Pin: ${pin.name}?`)) return;
    try {
      await api.delete(`/api/pins/${pin._id}`);
      await load();
    } catch (error) {
      console.error("Failed to delete pin:", error);
    }
  };

  const getColorClass = (color) => {
    if (!color) return "from-slate-500 to-slate-600";
    if (color.includes("gradient")) return color;

    // สำหรับสีธรรมดา สร้าง gradient อัตโนมัติ
    return `from-${color}-500 to-${color}-600`;
  };

  // เรียงลำดับตาม rank
  const sortedRows = [...rows].sort((a, b) => a.rank - b.rank);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar />
      <main className="flex-1 p-6 ml-64">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Pin Categories
              </h1>
              <p className="text-slate-600">
                Manage pin categories and their member distribution
              </p>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create New Pin
            </button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="text-2xl font-bold text-slate-800">
                {rows.length}
              </div>
              <div className="text-sm text-slate-600">Total Categories</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="text-2xl font-bold text-slate-800">
                {Object.keys(memberCounts).length}
              </div>
              <div className="text-sm text-slate-600">Active Pins</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="text-2xl font-bold text-slate-800">
                {Object.values(memberCounts).reduce(
                  (sum, count) => sum + count,
                  0
                )}
              </div>
              <div className="text-sm text-slate-600">Total Members</div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="text-2xl font-bold text-slate-800">
                {Math.max(...rows.map((r) => r.rank), 0)}
              </div>
              <div className="text-sm text-slate-600">Highest Rank</div>
            </div>
          </div>
        </div>

        {/* Pinterest Style Grid */}
        {loading ? (
          // Skeleton Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                  <div className="h-6 bg-slate-200 rounded w-16"></div>
                </div>
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-slate-200 rounded flex-1"></div>
                  <div className="h-8 bg-slate-200 rounded flex-1"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedRows.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-slate-700 mb-2">
              No pin categories yet
            </h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Create your first pin category to start organizing members into
              different groups and ranks.
            </p>
            <button
              onClick={openCreate}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Create Your First Pin
            </button>
          </div>
        ) : (
          // Pinterest Style Cards Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedRows.map((pin) => (
              <div
                key={pin._id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
              >
                {/* Card Header with Gradient */}
                <div
                  className={`h-3 bg-gradient-to-r ${
                    pin.color
                      ? `from-[${pin.color}] to-[${pin.color}]90`
                      : "from-blue-500 to-purple-600"
                  }`}
                ></div>

                <div className="p-6">
                  {/* Logo and Rank */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {pin.logoUrl ? (
                        <img
                          src={pin.logoUrl}
                          alt={pin.name}
                          className="h-12 w-12 object-contain rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl border border-slate-200 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-slate-500 mb-1">
                        RANK
                      </div>
                      <div className="text-lg font-bold text-slate-800">
                        {pin.rank}
                      </div>
                    </div>
                  </div>

                  {/* Pin Name */}
                  <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {pin.name}
                  </h3>

                  {/* Member Count */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-slate-600">
                      {memberCounts[pin.name] || 0} members
                    </span>
                  </div>

                  {/* Color Display */}
                  {pin.color && (
                    <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
                      <div
                        className="h-6 w-6 rounded border border-slate-300 shadow-sm"
                        style={{ background: pin.color }}
                      />
                      <span className="text-sm text-slate-600 font-mono flex-1 truncate">
                        {pin.color}
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(pin)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium group/btn"
                    >
                      <svg
                        className="w-4 h-4 group-hover/btn:scale-110 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => del(pin)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium group/btn"
                    >
                      <svg
                        className="w-4 h-4 group-hover/btn:scale-110 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Create/Edit */}
        {openModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800">
                  {editing ? "Edit Pin" : "Create New Pin"}
                </h2>
                <button
                  onClick={() => setOpenModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                  <div className="flex items-center gap-2 text-red-700">
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
                  <p className="mt-1 text-sm">{error}</p>
                </div>
              )}

              {/* Modal Form */}
              <form onSubmit={submit} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Pin Name *
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter pin name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Rank *
                    </label>
                    <input
                      type="number"
                      name="rank"
                      value={form.rank}
                      onChange={onChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Color (Optional)
                    </label>
                    <input
                      name="color"
                      value={form.color}
                      onChange={onChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="#FFD700 or rgb(255,215,0)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Logo Image
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        name="logo"
                        accept="image/*"
                        onChange={onChange}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label htmlFor="logo-upload" className="cursor-pointer">
                        <svg
                          className="w-8 h-8 text-slate-400 mx-auto mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <div className="text-sm text-slate-600">
                          {form.logoFile
                            ? form.logoFile.name
                            : "Click to upload logo"}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          PNG, JPG, SVG up to 5MB
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setOpenModal(false)}
                    className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                  >
                    {editing ? (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Update Pin
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
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
                        Create Pin
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPins;
