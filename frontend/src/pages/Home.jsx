import React, { useEffect, useState } from "react";
import api from "../api/client";
import PublicMemberCard from "../components/PublicMemberCard";

const Home = () => {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      const res = await api.get("/api/members", {
        params: { page: 1, limit: 200, orderBy: "pin", order: "asc" },
      });
      setMembers(res.data.data || []);
    };
    fetchMembers();
  }, []);

  // Fix แค่ 49 คนแรก
  const fixed = members.slice(0, 49);

  // แบ่ง row ตามที่ต้องการ
  const row1 = fixed.slice(0, 9); // 9
  const row2 = fixed.slice(9, 20); // 11
  const row3 = fixed.slice(20, 33); // 13
  const row4 = fixed.slice(33, 49); // 16

  const Row = ({ items, cols, className = "" }) => (
    <div
      className={`grid gap-4 ${className}`}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {items.map((m) => (
        <PublicMemberCard key={m._id} member={m} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[100vw] overflow-x-hidden px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Wall of Fame</h1>

        <div className="space-y-6">
          <Row items={row1} cols={9} />
          <Row items={row2} cols={11} />
          <Row items={row3} cols={13} />
          <Row items={row4} cols={16} />
        </div>
      </div>
    </div>
  );
};

export default Home;
