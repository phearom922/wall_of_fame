import React, { useEffect, useState } from "react";
import api from "../api/client";
import PublicMemberCard from "../components/PublicMemberCard";
import PinFilterTabs from "../components/PinFilterTabs";

const Home = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPin, setSelectedPin] = useState("All");

  const fetchMembers = async (pin = "All") => {
    setLoading(true);
    try {
      const params = { page: 1, limit: 1000, orderBy: "pin", order: "asc" };
      if (pin !== "All") params.pin = pin;
      const res = await api.get("/api/members", { params });
      setMembers(res.data?.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers(selectedPin);
  }, [selectedPin]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-screen-2xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Wall of Fame</h1>
          <div className="text-sm text-gray-600">
            {loading ? "กำลังโหลด..." : `ทั้งหมด: ${members.length} รายการ`}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <PinFilterTabs value={selectedPin} onChange={setSelectedPin} />
        </div>

        {/* Responsive: 2 / 3 / 5 cards per row, centered last row */}
        <div className="flex flex-wrap justify-center gap-6">
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-48 basis-1/2 sm:basis-1/3 xl:basis-1/5 max-w-[260px] w-full bg-white rounded shadow animate-pulse"
              />
            ))
          ) : members.length === 0 ? (
            <div className="w-full text-center text-gray-600 bg-white rounded border p-6">
              ไม่พบข้อมูล
            </div>
          ) : (
            members.map((m) => (
              <div
                key={m._id}
                className="basis-1/2 sm:basis-1/3 xl:basis-1/5 max-w-[260px] w-full"
              >
                <PublicMemberCard member={m} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
