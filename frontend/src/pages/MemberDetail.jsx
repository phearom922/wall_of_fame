import React, { useEffect, useState } from "react";
import api from "../api/client";
import { useParams, Link } from "react-router-dom";

const MemberDetail = () => {
  const { id } = useParams();
  const [member, setMember] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await api.get(`/api/members/${id}`);
      setMember(res.data);
    };
    load();
  }, [id]);

  if (!member) return <div className="p-6">กำลังโหลด...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Link to="/" className="text-blue-600 hover:underline">
        ← Back
      </Link>
      <div className="bg-white rounded shadow p-4 mt-4 max-w-2xl">
        {member.imageUrl && (
          <img
            src={member.imageUrl}
            alt={member.memberName}
            className="w-full h-64 object-cover rounded"
          />
        )}
        <h1 className="text-2xl font-bold mt-4">{member.memberName}</h1>
        <p className="mt-2">
          <b>Member ID:</b> {member.memberId}
        </p>
        <p>
          <b>Pin:</b> {member.pin}
        </p>
        <p>
          <b>Status:</b>{" "}
          <span
            className={
              member.status === "Active" ? "text-green-600" : "text-red-600"
            }
          >
            {member.status}
          </span>
        </p>
        <p className="text-gray-600 mt-2">
          <b>Start:</b> {new Date(member.startPin).toLocaleDateString()}{" "}
          &nbsp;|&nbsp;
          <b>End:</b> {new Date(member.endPin).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default MemberDetail;
