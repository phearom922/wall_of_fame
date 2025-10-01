import React from "react";
import { useNavigate, NavLink } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const linkClass = ({ isActive }) =>
    `p-2 rounded ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-bold p-4 border-b border-gray-700">
          Admin Panel
        </h1>
        <nav className="flex flex-col p-4 space-y-2">
          <NavLink to="/admin/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/members" className={linkClass}>
            Members
          </NavLink>
          <NavLink to="/admin/reorder" className={linkClass}>
            Reorder
          </NavLink>
          <NavLink to="/admin/pins" className={linkClass}>
            Pins
          </NavLink>
          <NavLink to="/admin/template" className={linkClass}>
            Template
          </NavLink>
        </nav>
      </div>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
