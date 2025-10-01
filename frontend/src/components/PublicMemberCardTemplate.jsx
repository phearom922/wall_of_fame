import React from "react";
import { useNavigate } from "react-router-dom";

const PublicMemberCardTemplate = ({ member }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/member/${member._id}`)}
      className="bg-white rounded shadow p-4 cursor-pointer hover:shadow-md w-full h-full"
    >
      {member.imageUrl && (
        <img
          src={member.imageUrl}
          alt={member.memberName}
          className="w-40 h-40  object-cover rounded-full border-4 border-white shadow-lg mx-auto"
        />
      )}
      <h2 className="text-base font-semibold mt-2 truncate">
        {member.memberName}
      </h2>
      <p className="text-sm text-gray-600 truncate">Pin: {member.pin}</p>
      <p
        className={`text-sm mt-1 font-bold ${
          member.status === "Active" ? "text-green-600" : "text-red-600"
        }`}
      >
        {member.status}
      </p>
    </div>
  );
};

export default PublicMemberCardTemplate;
