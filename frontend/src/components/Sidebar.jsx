import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Building2,
  Pill,
  FileBarChart,
  UserCog,
  Stethoscope,
  ClipboardList,
  Activity,
  ClipboardPlus,
  UserPlus,
  Search,
  Ticket,
  FileHeart,
  Bell,
  User,
  HeartPulse,
} from "lucide-react";

const NAV_CONFIG = {
  admin: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/patients", label: "Patients", icon: Users },
    { to: "/admin/appointments", label: "Appointments", icon: CalendarDays },
    { to: "/admin/departments", label: "Departments", icon: Building2 },
    { to: "/admin/medicines", label: "Medicines", icon: Pill },
    { to: "/admin/users", label: "Manage Users", icon: UserCog },
    { to: "/admin/reports", label: "Reports", icon: FileBarChart },
    { to: "/admin/profile", label: "Profile", icon: User },
  ],
  doctor: [
    { to: "/doctor", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/doctor/appointments", label: "Today's Appointments", icon: CalendarDays },
    { to: "/doctor/patients", label: "Assigned Patients", icon: Stethoscope },
    { to: "/doctor/records", label: "Health Records", icon: ClipboardPlus },
    { to: "/doctor/profile", label: "Profile", icon: User },
  ],
  nurse: [
    { to: "/nurse", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/nurse/ward-board", label: "Ward Board", icon: HeartPulse },
    { to: "/nurse/vitals", label: "Enter Vitals", icon: Activity },
    { to: "/nurse/profile", label: "Profile", icon: User },
  ],
  staff: [
    { to: "/staff", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/staff/register-patient", label: "Register Patient", icon: UserPlus },
    { to: "/staff/appointments", label: "Book Appointment", icon: CalendarDays },
    { to: "/staff/queue", label: "Appointment Queue", icon: Ticket },
    { to: "/staff/search", label: "Search Patient", icon: Search },
    { to: "/staff/profile", label: "Profile", icon: User },
  ],
  patient: [
    { to: "/patient", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/patient/appointments", label: "My Appointments", icon: CalendarDays },
    { to: "/patient/prescriptions", label: "Prescriptions", icon: FileHeart },
    { to: "/patient/notifications", label: "Notifications", icon: Bell },
    { to: "/patient/profile", label: "Profile", icon: User },
  ],
};

const Sidebar = ({ role, mobile = false }) => {
  const items = NAV_CONFIG[role] || [];

  return (
    <aside
      className={
        mobile
          ? "flex flex-col w-64 h-full bg-brand-900 text-white"
          : "hidden md:flex md:flex-col w-64 shrink-0 h-screen sticky top-0 bg-brand-900 text-white"
      }
    >
      <div className="px-6 py-6 flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-lg bg-brand-600 flex items-center justify-center">
          <ClipboardList size={18} strokeWidth={2.4} />
        </div>
        <div>
          <p className="font-display font-semibold leading-tight text-white">HealthCare Pro</p>
          <p className="text-[11px] text-brand-200 tracking-wide uppercase">{role} panel</p>
        </div>
      </div>

      <nav className="flex-1 px-3 pb-6 space-y-1 overflow-y-auto">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-600 text-white"
                  : "text-brand-100/80 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-white/10 text-[11px] text-brand-200/70">
        HealthCare Pro v1.0
      </div>
    </aside>
  );
};

export default Sidebar;
