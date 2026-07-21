import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { X } from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../context/AuthContext";

const DashboardLayout = ({ title }) => {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar role={user.role} />

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 h-full">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-3 h-8 w-8 flex items-center justify-center text-white z-10"
            >
              <X size={18} />
            </button>
            <Sidebar role={user.role} mobile />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <Topbar title={title || "Dashboard"} onMenuClick={() => setMobileOpen(true)} />
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
