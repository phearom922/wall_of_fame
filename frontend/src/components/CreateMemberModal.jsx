import React from "react";
import MemberForm from "./MemberForm";

const CreateMemberModal = ({ open, onClose, onSubmit, loading, error }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg w-full max-w-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Create Member</h2>
          <button
            onClick={onClose}
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
        <MemberForm onSubmit={onSubmit} loading={loading} mode="create" />
      </div>
    </div>
  );
};

export default CreateMemberModal;
