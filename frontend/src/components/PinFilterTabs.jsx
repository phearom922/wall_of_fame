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
    <div className="w-full overflow-x-auto">
      <div className="flex gap-2 pb-2">
        {tabs.map((pin) => {
          const active = value === pin;
          return (
            <button
              key={pin}
              onClick={() => onChange(pin)}
              className={`whitespace-nowrap px-4 py-2 rounded border text-sm
                ${
                  active
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
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
