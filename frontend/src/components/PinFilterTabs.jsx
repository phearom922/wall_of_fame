import React from "react";
import { PIN_OPTIONS } from "../constants/pins";

const PinFilterTabs = ({ value, onChange }) => {
  const tabs = ["All", ...PIN_OPTIONS];

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
