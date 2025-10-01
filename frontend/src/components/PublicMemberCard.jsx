import React from "react";
import { useNavigate } from "react-router-dom";
import usePinMap from "../hooks/usePinMap";

const PublicMemberCard = ({ member }) => {
  const navigate = useNavigate();
  const pinMap = usePinMap();
  const pinMeta = pinMap[member.pin] || {};

  return (
    <div
      onClick={() => navigate(`/member/${member._id}`)}
      className="bg-white rounded shadow p-3 cursor-pointer hover:shadow-md w-full h-full flex flex-col"
    >
      {member.imageUrl && (
        <img
          src={member.imageUrl}
          alt={member.memberName}
          className="w-full h-68 object-cover rounded"
        />
      )}

      <div className="mt-2 flex justify-between items-center border-t border-gray-200">
        <div>
          <div className="flex items-center gap-2 mt-2">
            <h2 className="text-sm font-semibold truncate">
              {member.memberName}
            </h2>
          </div>

          <p className="text-xs text-gray-600 truncate"> {member.pin}</p>

          <p
            className={`text-xs mt-1 font-bold ${
              member.status === "Active" ? "text-green-600" : "text-red-600"
            }`}
          >
            {member.status}
          </p>
        </div>

        <div>
          {pinMeta.logoUrl ? (
            <img
              src={pinMeta.logoUrl}
              alt={member.pin}
              className="h-12 w-12 object-contain"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PublicMemberCard;
