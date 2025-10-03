import React, { useEffect, useState } from "react";
import api from "../api/client";
import { useParams, Link } from "react-router-dom";
import usePinMap from "../hooks/usePinMap";
import Footer from "../components/Footer";

const MemberDetail = () => {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const pinMap = usePinMap();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/members/${id}`);
        setMember(res.data);
      } catch (error) {
        console.error("Failed to load member details:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="mx-auto max-w-4xl">
          {/* Back Button Skeleton */}
          <div className="bg-slate-200 rounded-full w-20 h-6 animate-pulse mb-6"></div>

          {/* Card Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-pulse">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Image Skeleton */}
              <div className="lg:w-1/3">
                <div className="bg-slate-200 rounded-xl w-full h-64 lg:h-80"></div>
              </div>

              {/* Content Skeleton */}
              <div className="lg:w-2/3 space-y-4">
                <div className="bg-slate-200 rounded h-8 w-3/4"></div>
                <div className="space-y-3">
                  <div className="bg-slate-200 rounded h-4 w-full"></div>
                  <div className="bg-slate-200 rounded h-4 w-2/3"></div>
                  <div className="bg-slate-200 rounded h-4 w-1/2"></div>
                  <div className="bg-slate-200 rounded h-4 w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="mx-auto max-w-4xl">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors mb-6"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Wall of Fame
          </Link>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Member Not Found
            </h2>
            <p className="text-slate-600 mb-6">
              The member you're looking for doesn't exist or may have been
              removed.
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 px-4 py-6 md:p-6 flex">
        <div className="mx-auto w-full max-w-4xl">
          {/* Back Button */}
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors mb-6 group"
          >
            <svg
              className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Wall of Fame
          </Link>

          {/* Member Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-md">
            <div className="flex flex-col lg:flex-row">
              {/* Image Section */}
              <div className="lg:w-2/5 h-[600px] md:h-[400px] lg:h-[500px] ">
                {member.imageUrl ? (
                  <img
                    src={member.imageUrl}
                    alt={member.memberName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <svg
                      className="w-20 h-20 text-slate-400"
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
              </div>

              {/* Content Section */}
              <div className="lg:w-3/5 p-4 md:p-6 lg:p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">
                      {member.memberName}
                    </h1>
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        member.status === "Active"
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          member.status === "Active"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      {member.status}
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center text-slate-600 mb-1">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                          />
                        </svg>
                        <span className="text-sm font-medium">Member ID</span>
                      </div>
                      <p className="text-lg font-semibold text-slate-800">
                        {member.memberId}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center text-slate-600 mb-1">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="text-sm font-medium">PIN</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-lg font-semibold text-slate-800">
                          {member.pin}
                        </p>
                        {pinMap[member.pin]?.logoUrl && (
                          <img
                            src={pinMap[member.pin].logoUrl}
                            alt={member.pin}
                            className="h-12 w-12 object-contain"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="bg-blue-50 rounded-lg p-3 md:p-4 border border-blue-100">
                    <div className="flex items-center text-blue-700 mb-2 md:mb-3">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm font-medium">
                        Membership Period
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="text-center sm:text-left">
                        <div className="text-xs text-blue-600 font-medium mb-1">
                          START DATE
                        </div>
                        <div className="text-lg font-bold text-blue-800">
                          {new Date(member.startPin).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </div>
                      </div>

                      <div className="hidden sm:block">
                        <svg
                          className="w-6 h-6 text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </div>

                      <div className="text-center sm:text-left">
                        <div className="text-xs text-blue-600 font-medium mb-1">
                          END DATE
                        </div>
                        <div className="text-lg font-bold text-blue-800">
                          {new Date(member.endPin).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MemberDetail;
