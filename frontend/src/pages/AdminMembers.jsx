// src/pages/AdminMembers.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/client";
import { useNavigate } from "react-router-dom";
import CreateMemberModal from "../components/CreateMemberModal";
import { PIN_OPTIONS } from "../constants/pins";

const AdminMembers = () => {
  const navigate = useNavigate();

  // ตาราง
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // เพจิเนชัน
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });

  // ฟิลเตอร์ + การเรียง
  const [filters, setFilters] = useState({
    q: "",
    status: "",
    pin: "",
    orderBy: "pin", // 🔥 เรียงตาม pinRank -> pinOrder (ดีฟอลต์)
    order: "asc",
  });

  // modal create
  const [openCreate, setOpenCreate] = useState(false);
  const [errCreate, setErrCreate] = useState("");

  // จัดลำดับภายใน Pin ต่อแถว
  const [localOrders, setLocalOrders] = useState({}); // { [id]: number }

  const statusBadge = (s) => (
    <span
      className={`px-2 py-1 text-xs rounded ${
        s === "Active"
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {s}
    </span>
  );

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get("/api/members", {
        params: {
          page,
          limit: pageInfo.limit,
          q: filters.q || undefined,
          status: filters.status || undefined,
          pin: filters.pin || undefined,
          orderBy: filters.orderBy || "pin",
          order: filters.order || "asc",
        },
      });
      setRows(res.data.data || []);
      setPageInfo(
        res.data.pagination || {
          page: 1,
          totalPages: 1,
          total: 0,
          limit: pageInfo.limit,
        }
      );
    } catch (e) {
      console.error("Load members failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // รีโหลดเมื่อฟิลเตอร์เปลี่ยน
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleDelete = async (id, name) => {
    if (!confirm(`ยืนยันลบสมาชิก: ${name}?`)) return;
    await api.delete(`/api/members/${id}`);
    // ถ้าหน้าปัจจุบันลบจนว่าง ให้ย้อนหน้าก่อนหน้า (ถ้าเป็นไปได้)
    const isLastItemOnPage = rows.length === 1 && pageInfo.page > 1;
    await load(isLastItemOnPage ? pageInfo.page - 1 : pageInfo.page);
  };

  const handleCreate = async (formData) => {
    try {
      setErrCreate("");
      await api.post("/api/members", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setOpenCreate(false);
      await load(1);
    } catch (e) {
      setErrCreate(e?.response?.data?.message || "สร้างสมาชิกไม่สำเร็จ");
    }
  };

  const setOrder = (id, val) => {
    setLocalOrders((prev) => ({ ...prev, [id]: val }));
  };

  const saveOrder = async (row) => {
    const newOrder = Number(localOrders[row._id] ?? row.pinOrder ?? 0);
    await api.put(
      `/api/members/${row._id}`,
      { pinOrder: newOrder, pin: row.pin }, // pin ส่งไปด้วยเพื่อความชัดเจน
      { headers: { "Content-Type": "application/json" } }
    );
    await load(pageInfo.page);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-100">
        {/* Header + Create */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Manage Members</h1>
          <button
            onClick={() => setOpenCreate(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Create Member
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded shadow p-4 mb-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
            <input
              placeholder="ค้นหา: ชื่อ หรือ ID"
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              className="rounded border border-gray-300 px-3 py-2"
            />
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((f) => ({ ...f, status: e.target.value }))
              }
              className="rounded border border-gray-300 px-3 py-2"
            >
              <option value="">สถานะทั้งหมด</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
            <select
              value={filters.pin}
              onChange={(e) =>
                setFilters((f) => ({ ...f, pin: e.target.value }))
              }
              className="rounded border border-gray-300 px-3 py-2"
            >
              <option value="">Pin ทั้งหมด</option>
              {PIN_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <select
                value={filters.orderBy}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, orderBy: e.target.value }))
                }
                className="flex-1 rounded border border-gray-300 px-3 py-2"
                title="Sort by"
              >
                <option value="pin">Pin + Order</option>
                <option value="createdAt">Created</option>
                <option value="endPin">EndPin</option>
                <option value="startPin">StartPin</option>
                <option value="memberName">Name</option>
              </select>
              <select
                value={filters.order}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, order: e.target.value }))
                }
                className="w-28 rounded border border-gray-300 px-3 py-2"
                title="Order"
              >
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
              </select>
            </div>
            <div className="flex items-center justify-end">
              <button
                onClick={() =>
                  setFilters({
                    q: "",
                    status: "",
                    pin: "",
                    orderBy: "pin",
                    order: "asc",
                  })
                }
                className="px-3 py-2 border rounded hover:bg-gray-50"
              >
                รีเซ็ตฟิลเตอร์
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Image</th>
                <th className="text-left p-3">Member ID</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Pin</th>
                <th className="text-left p-3">Order</th>
                <th className="text-left p-3">Start</th>
                <th className="text-left p-3">End</th>
                <th className="text-left p-3">Status</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="p-4" colSpan={9}>
                    กำลังโหลด...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="p-4" colSpan={9}>
                    ไม่พบข้อมูล
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r._id} className="border-t">
                    <td className="p-3">
                      {r.imageUrl ? (
                        <img
                          src={r.imageUrl}
                          alt={r.memberName}
                          className="h-10 w-10 object-cover rounded"
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3">{r.memberId}</td>
                    <td className="p-3">{r.memberName}</td>
                    <td className="p-3">{r.pin}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        className="w-20 rounded border border-gray-300 px-2 py-1"
                        defaultValue={r.pinOrder || 0}
                        onChange={(e) => setOrder(r._id, e.target.value)}
                      />
                    </td>
                    <td className="p-3">
                      {r.startPin
                        ? new Date(r.startPin).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-3">
                      {r.endPin ? new Date(r.endPin).toLocaleDateString() : "-"}
                    </td>
                    <td className="p-3">{statusBadge(r.status)}</td>
                    <td className="p-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                          onClick={() => saveOrder(r)}
                          title="Save order"
                        >
                          Save
                        </button>
                        <button
                          className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                          onClick={() =>
                            navigate(`/admin/members/${r._id}/edit`)
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                          onClick={() => handleDelete(r._id, r.memberName)}
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

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            Page {pageInfo.page} / {pageInfo.totalPages} • Total{" "}
            {pageInfo.total}
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded border"
              disabled={pageInfo.page <= 1}
              onClick={() => load(pageInfo.page - 1)}
            >
              Prev
            </button>
            <button
              className="px-3 py-1 rounded border"
              disabled={pageInfo.page >= pageInfo.totalPages}
              onClick={() => load(pageInfo.page + 1)}
            >
              Next
            </button>
          </div>
        </div>

        {/* Create Modal */}
        <CreateMemberModal
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          onSubmit={handleCreate}
          loading={false}
          error={errCreate}
        />
      </main>
    </div>
  );
};

export default AdminMembers;
