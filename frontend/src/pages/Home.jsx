import React, { useEffect, useState } from "react";
import api from "../api/client";
import PublicMemberCard from "../components/PublicMemberCard";
import PinFilterTabs from "../components/PinFilterTabs";
import Footer from "../components/Footer";

const fadeInUpKeyframes = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(2rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

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
        enabled: true,
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

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <style>{fadeInUpKeyframes}</style>

        <div className="flex-1 bg-gradient-to-br from-slate-50 to-blue-50 pb-12">
          <div className="mx-auto max-w-screen-2xl px-4 py-8">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="inline-block mb-4">
                <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-2"></div>
              </div>
              <h1 className="lg:text-7xl md:text-6xl sm:text-5xl text-4xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent mb-4">
                Successmore Wall of Fame
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Celebrating excellence and achievements across our organization
              </p>
            </div>

            {/* Filter Section */}
            <div className="mb-8">
              <PinFilterTabs value={selectedPin} onChange={setSelectedPin} />
            </div>

            {/* Members Grid */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 max-w-[260px]"
                  >
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 h-full animate-pulse">
                      <div className="bg-slate-200 rounded-xl w-full h-40 mb-4"></div>
                      <div className="space-y-2">
                        <div className="bg-slate-200 rounded h-4 w-3/4"></div>
                        <div className="bg-slate-200 rounded h-3 w-1/2"></div>
                        <div className="bg-slate-200 rounded h-3 w-1/3"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : members.length === 0 ? (
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
                members.map((m, index) => (
                  <div
                    key={m._id}
                    className="w-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5 max-w-[260px]
                               opacity-0 translate-y-8 animate-[fadeInUp_0.5s_ease-out_forwards]"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <PublicMemberCard member={m} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default Home;
