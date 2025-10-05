import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

const PIN_OPTIONS = [
  "Crown Diamond",
  "Black Diamond",
  "Blue Diamond",
  "Diamond",
  "Emerald",
  "Sapphire",
  "Ruby",
  "Pearl",
  "Platinum",
  "Gold",
  "Silver",
  "Bronze",
];

const MemberForm = ({ initialValues, mode = "create", onSuccess }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    memberId: initialValues?.memberId || "",
    memberName: initialValues?.memberName || "",
    pin: initialValues?.pin || "Pearl",
    startPin: initialValues?.startPin
      ? initialValues.startPin.slice(0, 10)
      : "",
    endPin: initialValues?.endPin ? initialValues.endPin.slice(0, 10) : "",
    imageFile: null,
    enabled: initialValues?.enabled ?? true,
    pinOrder: initialValues?.pinOrder ?? 0,
  });
  const [preview, setPreview] = useState(initialValues?.imageUrl || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null); // { field?, message }

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (name === "image") {
      const file = files?.[0] || null;
      setForm((prev) => ({ ...prev, imageFile: file }));
      setPreview(
        file ? URL.createObjectURL(file) : initialValues?.imageUrl || ""
      );
      return;
    }
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: !!checked }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validate required fields first
    if (mode === "create" && !form.memberId?.trim()) {
      setError({ field: "memberId", message: "Member ID is required" });
      setSubmitting(false);
      return;
    }
    if (!form.memberName?.trim()) {
      setError({ field: "memberName", message: "Member name is required" });
      setSubmitting(false);
      return;
    }
    if (!form.startPin) {
      setError({ field: "startPin", message: "Start date is required" });
      setSubmitting(false);
      return;
    }
    if (!form.endPin) {
      setError({ field: "endPin", message: "End date is required" });
      setSubmitting(false);
      return;
    }

    try {
      const fd = new FormData();

      if (mode === "create") {
        fd.append("memberId", form.memberId.trim());
      }

      // common fields
      fd.append("memberName", form.memberName.trim());
      fd.append("pin", form.pin);
      fd.append("startPin", form.startPin);
      fd.append("endPin", form.endPin);
      fd.append("pinOrder", String(form.pinOrder ?? 0));
      fd.append("enabled", String(!!form.enabled));

      if (form.imageFile) {
        // Validate file size (5MB)
        if (form.imageFile.size > 5 * 1024 * 1024) {
          setError({
            field: "image",
            message: "Image size must be less than 5MB",
          });
          setSubmitting(false);
          return;
        }
        fd.append("image", form.imageFile);
      }

      if (mode === "create") {
        const response = await api.post("/api/members", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(response.data);
        }
      } else {
        const id = initialValues?._id;
        await api.put(`/api/members/${id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        // อัปเดตเสร็จอยู่หน้าเดิม (edit) หรือจะพากลับรายชื่อก็ได้:
        navigate("/admin/members");
      }
    } catch (err) {
      const resp = err?.response?.data;
      // จัดการเคสซ้ำ memberId โดยเฉพาะ
      if (
        resp?.message?.toLowerCase().includes("memberid") &&
        resp?.message?.includes("exists")
      ) {
        setError({ field: "memberId", message: "Member ID นี้ถูกใช้งานแล้ว" });
      } else {
        setError({ message: resp?.message || "ดำเนินการไม่สำเร็จ" });
      }
      console.error(
        mode === "create" ? "Create member failed:" : "Update member failed:",
        resp || err.message
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Banner error */}
      {error?.message && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3">
          {error.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left */}
        <div className="space-y-6">
          {/* Member ID */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Member ID *
            </label>
            <input
              name="memberId"
              value={form.memberId}
              onChange={handleChange}
              placeholder="e.g. 0921207"
              required={mode === "create"}
              disabled={mode === "edit"}
              className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 focus:ring-2 focus:ring-blue-500
                ${
                  error?.field === "memberId"
                    ? "border-red-500 ring-1 ring-red-500"
                    : "border-slate-300"
                }`}
            />
            {mode === "edit" && (
              <p className="text-xs text-slate-500 mt-1">
                Member ID cannot be changed
              </p>
            )}
            {error?.field === "memberId" && (
              <p className="text-xs text-red-500 mt-1">{error.message}</p>
            )}
          </div>

          {/* Member Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Member Name *
            </label>
            <input
              name="memberName"
              value={form.memberName}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter full name"
              required
            />
          </div>

          {/* Pin */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Pin Category *
            </label>
            <select
              name="pin"
              value={form.pin}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {PIN_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Enable toggle (ถ้าต้องการให้แก้ในฟอร์ม) */}
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="enabled"
              checked={!!form.enabled}
              onChange={handleChange}
            />
            <span>Enable this member</span>
          </label>
        </div>

        {/* Right */}
        <div className="space-y-6">
          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startPin"
                value={form.startPin}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endPin"
                value={form.endPin}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Profile Image
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 bg-slate-50/50">
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer block">
                <svg
                  className="w-8 h-8 text-slate-400 mx-auto mb-3"
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
                <div className="text-sm text-slate-600 mb-1">
                  {form.imageFile
                    ? form.imageFile.name
                    : "Click to upload image"}
                </div>
                <div className="text-xs text-slate-400">
                  PNG, JPG, WEBP up to 5MB
                </div>
              </label>
            </div>

            {(preview || (mode === "edit" && initialValues?.imageUrl)) && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Image Preview
                </label>
                <div className="relative inline-block">
                  <img
                    src={preview || initialValues.imageUrl}
                    alt="Preview"
                    className="h-48 w-auto rounded-xl object-cover border-2 border-slate-200 shadow-sm"
                  />
                  {preview && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      New
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <div className="text-sm text-slate-500">
          Fields marked with * are required
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow-md"
        >
          {submitting ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
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
              {mode === "edit" ? "Updating..." : "Creating..."}
            </>
          ) : mode === "edit" ? (
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
              Update Member
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
              Create Member
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default MemberForm;
