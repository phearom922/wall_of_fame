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
      className="group cursor-pointer w-full h-full"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 h-full transition-all duration-300 hover:shadow-lg hover:border-blue-200 hover:translate-y-1 group-hover:scale-[1.02]">
        {/* Member Image */}
        {member.imageUrl ? (
          <div className="relative overflow-hidden rounded-xl mb-4">
            <img
              src={member.imageUrl}
              alt={member.memberName}
              className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-orange-200/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl mb-4 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-slate-400"
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

        {/* Content */}
        <div className="flex flex-col h-[calc(100%-18rem)]">
          <div className="flex-1">
            {/* Name and Status */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-slate-800 truncate group-hover:text-orange-600 transition-colors">
                  {member.memberName}
                </h2>
                <p className="text-sm text-slate-500 mt-1">{member.pin}</p>
              </div>

              {/* Status Badge */}
              <div
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  member.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full mr-1 ${
                    member.status === "Active" ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                {member.status}
              </div>
            </div>
          </div>

          {/* Logo and Bottom Section */}
          <div className="flex items-center justify-between border-t border-slate-100">
            <div className="flex items-center text-xs text-slate-400">
              <svg
                className="w-4 h-4 mr-1"
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
              Click to see details
            </div>

            {pinMeta.logoUrl && (
              <div className="flex-shrink-0">
                <img
                  src={pinMeta.logoUrl}
                  alt={member.pin}
                  className="h-12 w-12 object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicMemberCard;
