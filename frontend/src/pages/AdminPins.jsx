import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/client";

const AdminPins = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null); // pin object or null
  const [form, setForm] = useState({
    name: "",
    rank: 1,
    color: "",
    logoFile: null,
  });
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await api.get("/api/pins");
    setRows(res.data || []);
    setLoading(false);
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
    await api.delete(`/api/pins/${pin._id}`);
    load();
  };

  const updateRank = async (pin, newRank) => {
    await api.put(
      `/api/pins/${pin._id}`,
      { rank: Number(newRank) },
      { headers: { "Content-Type": "application/json" } }
    );
    load();
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Manage Pins</h1>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Create Pin
          </button>
        </div>

        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Logo</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Rank</th>
                <th className="text-left p-3">Color</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="p-4" colSpan={5}>
                    กำลังโหลด...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="p-4" colSpan={5}>
                    ไม่พบข้อมูล
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r._id} className="border-t">
                    <td className="p-3">
                      {r.logoUrl ? (
                        <img
                          src={r.logoUrl}
                          alt={r.name}
                          className="h-10 w-10 object-contain"
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3 font-medium">{r.name}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        defaultValue={r.rank}
                        className="w-24 rounded border border-gray-300 px-2 py-1"
                        onBlur={(e) => updateRank(r, e.target.value)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {r.color ? (
                          <span
                            className="inline-block h-4 w-4 rounded"
                            style={{ background: r.color }}
                          />
                        ) : null}
                        <span className="text-xs text-gray-600">
                          {r.color || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                          onClick={() => openEdit(r)}
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                          onClick={() => del(r)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Create/Edit */}
        {openModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white rounded shadow-lg w-full max-w-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">
                  {editing ? "Edit Pin" : "Create Pin"}
                </h2>
                <button
                  onClick={() => setOpenModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {error && (
                <div className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Name
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      className="w-full rounded border px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Rank
                    </label>
                    <input
                      type="number"
                      name="rank"
                      value={form.rank}
                      onChange={onChange}
                      className="w-full rounded border px-3 py-2"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Color (optional)
                    </label>
                    <input
                      name="color"
                      value={form.color}
                      onChange={onChange}
                      className="w-full rounded border px-3 py-2"
                      placeholder="#FFD700 or rgb(0,0,0)"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Logo
                    </label>
                    <input
                      type="file"
                      name="logo"
                      accept="image/*"
                      onChange={onChange}
                      className="block w-full text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenModal(false)}
                    className="px-4 py-2 rounded border"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {editing ? "Update" : "Create"}
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
