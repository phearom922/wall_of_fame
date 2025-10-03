import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/client";
import { useNavigate } from "react-router-dom";
import CreateMemberModal from "../components/CreateMemberModal";
import { PIN_OPTIONS } from "../constants/pins";

const AdminMembers = () => {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });
  const [filters, setFilters] = useState({
    q: "",
    status: "",
    pin: "",
    orderBy: "pin",
    order: "asc",
  });
  const [openCreate, setOpenCreate] = useState(false);
  const [errCreate, setErrCreate] = useState("");
  const [localOrders, setLocalOrders] = useState({});

  const statusBadge = (s) => (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        s === "Active"
          ? "bg-green-100 text-green-800 border border-green-200"
          : "bg-red-100 text-red-800 border border-red-200"
      }`}
    >
      <div
        className={`w-1.5 h-1.5 rounded-full mr-1 ${
          s === "Active" ? "bg-green-500" : "bg-red-500"
        }`}
      ></div>
      {s}
    </span>
  );

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page: page,
        limit: pageInfo.limit,
        orderBy: filters.orderBy || "pin",
        order: filters.order || "asc",
      };

      if (filters.q?.trim()) params.q = filters.q.trim();
      if (filters.status) params.status = filters.status.toLowerCase();
      if (filters.pin) params.pin = filters.pin;

      const res = await api.get("/api/members", { params });
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
    load(1);
  }, [filters]);

  const handleDelete = async (id, name) => {
    if (!confirm(`ยืนยันลบสมาชิก: ${name}?`)) return;
    await api.delete(`/api/members/${id}`);
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
      { pinOrder: newOrder, pin: row.pin },
      { headers: { "Content-Type": "application/json" } }
    );
    await load(pageInfo.page);
  };

  const toggleEnable = async (memberId) => {
    try {
      const res = await api.put(`/api/members/${memberId}/toggle`);
      const updated = res.data.member;
      setRows((prev) =>
        prev.map((m) =>
          m._id === memberId ? { ...m, enabled: updated.enabled } : m
        )
      );
    } catch (err) {
      console.error("Toggle failed", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar />
      <main className="flex-1 p-6 ml-64">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Manage Members
              </h1>
              <p className="text-slate-600 mt-1">
                View and manage all member profiles
              </p>
            </div>
            <button
              onClick={() => setOpenCreate(true)}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-sm hover:shadow-md"
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
              Create Member
            </button>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
              <div className="text-2xl font-bold text-slate-800">
                {pageInfo.total}
              </div>
              <div className="text-sm text-slate-600">Total Members</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
              <div className="text-2xl font-bold text-slate-800">
                {rows.filter((r) => r.status === "Active").length}
              </div>
              <div className="text-sm text-slate-600">Active</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
              <div className="text-2xl font-bold text-slate-800">
                {rows.filter((r) => r.status === "Expired").length}
              </div>
              <div className="text-sm text-slate-600">Expired</div>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="relative">
              <input
                placeholder="Search members..."
                value={filters.q}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, q: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg
                className="w-5 h-5 text-slate-400 absolute left-3 top-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((f) => ({ ...f, status: e.target.value }))
              }
              className="rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>

            <select
              value={filters.pin}
              onChange={(e) =>
                setFilters((f) => ({ ...f, pin: e.target.value }))
              }
              className="rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Pins</option>
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
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pin">Pin + Order</option>
                <option value="createdAt">Created</option>
                <option value="endPin">End Date</option>
                <option value="startPin">Start Date</option>
                <option value="memberName">Name</option>
              </select>
              <select
                value={filters.order}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, order: e.target.value }))
                }
                className="w-28 rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
              </select>
            </div>

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
              className="px-4 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Reset
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-700">
                    Member
                  </th>
                  <th className="text-left p-4 font-semibold text-slate-700">
                    Pin
                  </th>
                  <th className="text-left p-4 font-semibold text-slate-700">
                    Order
                  </th>
                  <th className="text-left p-4 font-semibold text-slate-700">
                    Dates
                  </th>
                  <th className="text-left p-4 font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="text-left p-4 font-semibold text-slate-700">
                    Card
                  </th>
                  <th className="text-right p-4 font-semibold text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  // Skeleton Rows
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-100 animate-pulse"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-24"></div>
                            <div className="h-3 bg-slate-200 rounded w-16"></div>
                          </div>
                        </div>
                      </td>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="p-4">
                          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
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
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">
                        No members found
                      </h3>
                      <p className="text-slate-500 mb-4">
                        Try adjusting your search filters
                      </p>
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
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Reset Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr
                      key={r._id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {r.imageUrl ? (
                            <img
                              src={r.imageUrl}
                              alt={r.memberName}
                              className="h-12 w-12 object-cover rounded-lg border border-slate-200"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center">
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
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-800">
                              {r.memberName}
                            </div>
                            <div className="text-sm text-slate-500">
                              ID: {r.memberId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {r.pin}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            className="w-20 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            defaultValue={r.pinOrder || 0}
                            onChange={(e) => setOrder(r._id, e.target.value)}
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <div className="text-slate-800">
                            {r.startPin
                              ? new Date(r.startPin).toLocaleDateString()
                              : "-"}
                          </div>
                          <div className="text-slate-500 text-xs">
                            to{" "}
                            {r.endPin
                              ? new Date(r.endPin).toLocaleDateString()
                              : "-"}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{statusBadge(r.status)}</td>
                      <td className="p-4">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={r.enabled}
                            onChange={() => toggleEnable(r._id)}
                            className="sr-only peer"
                          />
                          <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => saveOrder(r)}
                            className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1"
                          >
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
                            Save
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/admin/members/${r._id}/edit`)
                            }
                            className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-1"
                          >
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(r._id, r.memberName)}
                            className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-1"
                          >
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
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
        </div>

        {/* Pagination */}
        {!loading && rows.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-slate-600">
              Showing page {pageInfo.page} of {pageInfo.totalPages} •{" "}
              {pageInfo.total} total members
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                disabled={pageInfo.page <= 1}
                onClick={() => load(pageInfo.page - 1)}
              >
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </button>
              <button
                className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                disabled={pageInfo.page >= pageInfo.totalPages}
                onClick={() => load(pageInfo.page + 1)}
              >
                Next
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

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
