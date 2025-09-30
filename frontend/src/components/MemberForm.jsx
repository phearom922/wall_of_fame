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
    // ส่งเป็น FormData เพื่อรองรับรูป
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
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Member ID
          </label>
          <input
            name="memberId"
            value={form.memberId}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. 0921207"
            required
            disabled={mode === "edit"} // หลีกเลี่ยงการแก้ไข memberId ในโหมดแก้ไข
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Member Name
          </label>
          <input
            name="memberName"
            value={form.memberName}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Full name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pin
          </label>
          <select
            name="pin"
            value={form.pin}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            {PIN_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Pin
          </label>
          <input
            type="date"
            name="startPin"
            value={form.startPin}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Pin
          </label>
          <input
            type="date"
            name="endPin"
            value={form.endPin}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image
          </label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {preview && (
            <img
              src={preview}
              alt="preview"
              className="mt-3 h-40 w-auto rounded object-cover border"
            />
          )}
          {mode === "edit" && !preview && initialValues?.imageUrl && (
            <img
              src={initialValues.imageUrl}
              alt="current"
              className="mt-3 h-40 w-auto rounded object-cover border"
            />
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-blue-600 text-white px-4 py-2 font-semibold hover:bg-blue-700 disabled:opacity-60"
      >
        {loading
          ? "Saving..."
          : mode === "edit"
          ? "Update Member"
          : "Create Member"}
      </button>
    </form>
  );
};

export default MemberForm;
