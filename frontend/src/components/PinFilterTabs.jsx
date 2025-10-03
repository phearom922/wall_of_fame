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
    <div className="w-full">
      <div
        className="flex gap-2 pb-2 overflow-x-auto snap-x snap-mandatory scroll-px-4 [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ scrollbarWidth: "none" }}
      >
        {/* ซ่อน scrollbar บน WebKit */}
        <style>{`.hide-scrollbar::-webkit-scrollbar{display:none}`}</style>
        {tabs.map((pin) => {
          const active = value === pin;
          return (
            <button
              key={pin}
              onClick={() => onChange(pin)}
              className={`hide-scrollbar whitespace-nowrap snap-center
                          px-4 py-2 rounded-lg border font-semibold
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
  );
};

export default PinFilterTabs;
