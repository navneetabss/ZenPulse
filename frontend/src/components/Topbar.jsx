import React, { useEffect, useRef, useState } from "react";
import { Menu, Bell, LogOut, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { RoleBadge } from "./Badge";

const Topbar = ({ title, onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const menuRef = useRef(null);

  useEffect(() => {
    api
      .get("/notifications")
      .then((res) => setUnread(res.data.unreadCount || 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = (user?.name || "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-canvas/80 backdrop-blur border-b border-brand-100/60 px-4 md:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden h-9 w-9 flex items-center justify-center rounded-lg hover:bg-brand-50 text-ink/60"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-display font-semibold text-ink">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(`/${user.role}/notifications`)}
          className="relative h-9 w-9 flex items-center justify-center rounded-lg hover:bg-brand-50 text-ink/60"
          aria-label="Notifications"
        >
          <Bell size={19} />
          {unread > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-status-critical" />
          )}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
          >
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-brand-700 text-white text-xs font-semibold flex items-center justify-center">
                {initials}
              </div>
            )}
            <span className="hidden sm:block text-sm font-medium text-ink">{user?.name}</span>
            <ChevronDown size={15} className="text-ink/40" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-surface rounded-xl2 shadow-card border border-brand-100/60 py-2 z-40">
              <div className="px-3.5 py-2 border-b border-brand-100/60">
                <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
                <p className="text-xs text-ink/40 truncate">{user?.email}</p>
                <div className="mt-1.5">
                  <RoleBadge role={user?.role} />
                </div>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate(`/${user.role}/profile`);
                }}
                className="w-full text-left px-3.5 py-2 text-sm text-ink/70 hover:bg-brand-50 transition-colors"
              >
                My Profile
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="w-full text-left px-3.5 py-2 text-sm text-status-critical hover:bg-status-critical/5 transition-colors flex items-center gap-2"
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
