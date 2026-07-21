import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarDays, Users, Clock, CheckCircle2 } from "lucide-react";
import api from "../../api/axios";
import StatCard from "../../components/StatCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/doctor")
      .then((res) => setStats(res.data.stats))
      .catch(() => toast.error("Could not load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="card bg-brand-700 text-white !border-0">
        <p className="text-sm text-brand-100/80">Welcome back,</p>
        <p className="text-xl font-display font-semibold">Dr. {user.name}{user.specialization ? ` — ${user.specialization}` : ""}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CalendarDays} label="Today's Appointments" value={stats.todayAppointments} accent="doctor" />
        <StatCard icon={Users} label="Assigned Patients" value={stats.assignedPatientsCount} accent="doctor" />
        <StatCard icon={Clock} label="Upcoming" value={stats.upcomingCount} accent="warning" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completedCount} accent="brand" />
      </div>
    </div>
  );
};

export default DoctorDashboard;
