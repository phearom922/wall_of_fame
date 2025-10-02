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
      const params = {
        page: 1,
        limit: 1000,
        orderBy: "pin",
        order: "asc",
        enabled: true, // เพิ่มเงื่อนไขให้แสดงเฉพาะสมาชิกที่เปิดใช้งาน
      };
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

  console.log(members);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="mx-auto max-w-screen-2xl px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-2"></div>
          </div>
          <h1 className="ld:text-7xl md:text-6xl sm:text-5xl text-4xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Successmore Wall of Fame
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Celebrating excellence and achievements across our organization
          </p>
        </div>

        {/* Stats and Filter Section */}
        <div className="flex mb-8 justify-center">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            {/* <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  loading ? "bg-amber-400 animate-pulse" : "bg-green-500"
                }`}
              ></div>
              <span className="text-sm font-medium text-slate-700">
                {loading
                  ? "กำลังโหลดข้อมูล..."
                  : `พบทั้งหมด ${members.length} รายการ`}
              </span>
            </div> */}

            {/* Filter Label */}
            {/* <div className="text-sm text-slate-500">
              {selectedPin !== "All" && `กำลังดู: ${selectedPin}`}
            </div> */}
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <PinFilterTabs value={selectedPin} onChange={setSelectedPin} />
          </div>
        </div>

        {/* Members Grid */}
        <div className="flex flex-wrap justify-center sm:gap-4 md:gap-6">
          {loading ? (
            // Skeleton Loaders
            Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="group basis-1/2 sm:basis-1/3 lg:basis-1/4 xl:basis-1/5 max-w-[280px] w-full"
              >
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 h-full animate-pulse">
                  <div className="bg-slate-200 rounded-xl w-full h-48 mb-4"></div>
                  <div className="space-y-2">
                    <div className="bg-slate-200 rounded h-4 w-3/4"></div>
                    <div className="bg-slate-200 rounded h-3 w-1/2"></div>
                    <div className="bg-slate-200 rounded h-3 w-1/3"></div>
                  </div>
                </div>
              </div>
            ))
          ) : members.length === 0 ? (
            // Empty State
            <div className="w-full max-w-3xl text-center py-16">
              <div className="w-24 h-24 mx-auto mb-4 bg-slate-200 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                No information found
              </h3>
              <p className="text-slate-500">
                There is no one available for this position{" : "}
                <span className=" font-semibold  underline text-md text-orange-600">
                  {selectedPin}
                </span>{" "}
                right now, so this position is waiting for you.
              </p>
              <p className="text-slate-500">See you soon.</p>
            </div>
          ) : (
            // Members Grid
            members.map((m) => (
              <div
                key={m._id}
                className="group basis-1/2 sm:basis-1/3 lg:basis-1/4 xl:basis-1/5 max-w-[280px] w-full"
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
