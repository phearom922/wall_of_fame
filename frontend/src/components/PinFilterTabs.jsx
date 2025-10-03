// src/components/PinFilterTabs.jsx
import React, { useEffect, useState } from "react";
import api from "../api/client";

const PinFilterTabs = ({ value, onChange }) => {
  const [pins, setPins] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await api.get("/api/pins");
      setPins(res.data || []);
    };
    load();
  }, []);

  const tabs = ["All", ...pins.map((p) => p.name)];

  return (
    // ใช้ -mx-4 / px-4 เพื่อให้แถบเลื่อนไปชนขอบจอพอดี (หน้า Home มี padding)
    <div className="relative -mx-4 px-4">
      {/* แถบสกอร์ล – ซ่อน scrollbar, เปิด snap, ไม่ทำให้ body เกิด overflow-x */}
      <div
        className="flex gap-2 overflow-x-auto snap-x snap-mandatory touch-pan-x
                   [scrollbar-width:none] overscroll-x-contain"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Hide scrollbar (WebKit) */}
        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
        `}</style>

        <div className="no-scrollbar inline-flex gap-2 py-2">
          {tabs.map((pin) => {
            const active = value === pin;
            return (
              <button
                key={pin}
                onClick={() => onChange(pin)}
                className={`snap-center whitespace-nowrap px-4 py-2 rounded-lg border font-medium
                  ${
                    active
                      ? "bg-orange-600 text-white border-orange-600"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                  }`}
              >
                {pin}
              </button>
            );
          })}
        </div>
      </div>

      {/* gradient hint ซ้าย/ขวา */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-slate-50 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-slate-50 to-transparent" />
    </div>
  );
};

export default PinFilterTabs;
