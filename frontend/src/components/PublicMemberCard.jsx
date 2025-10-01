import React from "react";
import { useNavigate } from "react-router-dom";

const PublicMemberCard = ({ member }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/member/${member._id}`)}
      className="bg-white rounded shadow p-3 cursor-pointer hover:shadow-md w-full h-full flex flex-col"
    >
      {member.imageUrl && (
        <img
          src={member.imageUrl}
          alt={member.memberName}
          className="w-full h-32 object-cover rounded"
        />
      )}
      <div className="flex-1 mt-2">
        <h2 className="text-sm font-semibold truncate">{member.memberName}</h2>
        <p className="text-xs text-gray-600 truncate">Pin: {member.pin}</p>
      </div>
      <p
        className={`text-xs mt-1 font-bold ${
          member.status === "Active" ? "text-green-600" : "text-red-600"
        }`}
      >
        {member.status}
      </p>
    </div>
  );
};

export default PublicMemberCard;
