import React, { useState } from "react";

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

const MemberForm = ({ initialValues, onSubmit, loading, mode = "create" }) => {
  const [form, setForm] = useState({
    memberId: initialValues?.memberId || "",
    memberName: initialValues?.memberName || "",
    pin: initialValues?.pin || "Pearl",
    startPin: initialValues?.startPin
      ? initialValues.startPin.slice(0, 10)
      : "",
    endPin: initialValues?.endPin ? initialValues.endPin.slice(0, 10) : "",
    imageFile: null,
  });

  const [preview, setPreview] = useState(initialValues?.imageUrl || "");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files?.[0];
      setForm((prev) => ({ ...prev, imageFile: file || null }));
      if (file) {
        const url = URL.createObjectURL(file);
        setPreview(url);
      } else {
        setPreview(initialValues?.imageUrl || "");
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("memberId", form.memberId);
    fd.append("memberName", form.memberName);
    fd.append("pin", form.pin);
    fd.append("startPin", form.startPin);
    fd.append("endPin", form.endPin);
    if (form.imageFile) {
      fd.append("image", form.imageFile);
    }
    onSubmit(fd);
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Basic Info */}
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
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="e.g. 0921207"
              required
              disabled={mode === "edit"}
            />
            {mode === "edit" && (
              <p className="text-xs text-slate-500 mt-1">
                Member ID cannot be changed
              </p>
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
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Enter full name"
              required
            />
          </div>

          {/* Pin Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Pin Category *
            </label>
            <select
              name="pin"
              value={form.pin}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
            >
              {PIN_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Column - Dates & Image */}
        <div className="space-y-6">
          {/* Date Range */}
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
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Profile Image
            </label>

            {/* File Input with Custom Styling */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-all duration-200 bg-slate-50/50">
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

            {/* Image Preview */}
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

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <div className="text-sm text-slate-500">
          Fields marked with * are required
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow-md"
        >
          {loading ? (
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
              Saving...
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

      {/* Quick Help */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-blue-700">
            <strong>Pro tip:</strong> Ensure the member ID is unique and the
            date range accurately reflects the membership period. High-quality
            images will display better on the public wall.
          </div>
        </div>
      </div>
    </form>
  );
};

export default MemberForm;
