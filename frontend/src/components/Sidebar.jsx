import React from "react";
import { useNavigate, NavLink } from "react-router-dom";
import {
  FaAlignJustify,
  FaUserGroup,
  FaListOl,
  FaCrown,
} from "react-icons/fa6";
import { HiTemplate } from "react-icons/hi";
const Sidebar = () => {
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
      isActive
        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
        : "text-slate-300 hover:bg-slate-700 hover:text-white"
    }`;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login", { replace: true });
  };

  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: <FaAlignJustify /> },
    { path: "/admin/members", label: "Members", icon: <FaUserGroup /> },
    { path: "/admin/reorder", label: "Reorder", icon: <FaListOl /> },
    { path: "/admin/pins", label: "Pins", icon: <FaCrown /> },
    { path: "/admin/template", label: "Template", icon: <HiTemplate /> },
  ];

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-50 border-r border-slate-700">
      {/* Header */}
      <div className="p-6 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-xs text-slate-400">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink key={item.path} to={item.path} className={linkClass}>
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 bg-slate-800/30">
        <div className="flex items-center gap-3 mb-4 p-3 bg-slate-800/50 rounded-xl">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              Admin User
            </p>
            <p className="text-xs text-slate-400 truncate">Administrator</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 border border-red-600/20 hover:border-red-600/30 py-3 rounded-xl transition-all duration-200 group"
        >
          <svg
            className="w-5 h-5 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="font-medium">Logout</span>
        </button>
      </div>

      {/* Version Info */}
      <div className="p-3 border-t border-slate-700 bg-slate-900/50">
        <p className="text-xs text-slate-500 text-center">v1.0.0</p>
      </div>
    </div>
  );
};

export default Sidebar;
