import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

const MemberCard = ({ member, onDeleted }) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!confirm(`ยืนยันลบสมาชิก: ${member.memberName}?`)) return;
    try {
      await api.delete(`/api/members/${member._id}`);
      onDeleted?.(member._id);
    } catch (e) {
      alert("ลบไม่สำเร็จ");
    }
  };

  return (
    <div className="bg-white rounded shadow p-4 w-full sm:w-[300px]">
      {member.imageUrl && (
        <img
          src={member.imageUrl}
          alt={member.memberName}
          className="w-full h-40 object-cover rounded"
        />
      )}
      <h2 className="text-lg font-semibold mt-2">{member.memberName}</h2>
      <p className="text-sm text-gray-600">Pin: {member.pin}</p>
      <p
        className={`text-sm mt-1 font-bold ${
          member.status === "Active" ? "text-green-600" : "text-red-600"
        }`}
      >
        {member.status}
      </p>

      <div className="mt-3 flex gap-2">
        <button
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => navigate(`/admin/members/${member._id}/edit`)}
        >
          Edit
        </button>
        <button
          className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default MemberCard;
