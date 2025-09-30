import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import MemberDetail from "./pages/MemberDetail";
import AdminReorder from "./pages/AdminReorder";
import AdminLogin from "./pages/AdminLogin";
import RequireAuth from "./routes/RequireAuth";
import AdminDashboard from "./pages/AdminDashboard";
import AdminMembers from "./pages/AdminMembers";
import EditMember from "./pages/EditMember";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/member/:id" element={<MemberDetail />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Protected */}
        <Route element={<RequireAuth />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/members" element={<AdminMembers />} />
          <Route path="/admin/reorder" element={<AdminReorder />} />
          <Route path="/admin/members/:id/edit" element={<EditMember />} />
        </Route>

        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}
export default App;
