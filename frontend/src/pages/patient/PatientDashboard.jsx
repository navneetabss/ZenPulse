import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarDays, CalendarClock, FileHeart } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import StatCard from "../../components/StatCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

const PatientDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/patient")
      .then((res) => setStats(res.data.stats))
      .catch(() => toast.error("Could not load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="card bg-role-patient text-white !border-0">
        <p className="text-sm text-white/80">Welcome back,</p>
        <p className="text-xl font-display font-semibold">{user.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={CalendarClock} label="Upcoming Appointments" value={stats.upcomingAppointments} accent="patient" />
        <StatCard icon={CalendarDays} label="Total Appointments" value={stats.totalAppointments} accent="brand" />
        <StatCard icon={FileHeart} label="Prescriptions on File" value={stats.totalPrescriptions} accent="patient" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/patient/appointments" className="card hover:border-brand-300 transition-colors">
          <CalendarDays className="text-role-patient mb-2" size={22} />
          <p className="font-display font-semibold text-ink">Book an Appointment</p>
          <p className="text-sm text-ink/50 mt-1">Schedule a visit with a doctor</p>
        </Link>
        <Link to="/patient/prescriptions" className="card hover:border-brand-300 transition-colors">
          <FileHeart className="text-role-patient mb-2" size={22} />
          <p className="font-display font-semibold text-ink">View Prescriptions</p>
          <p className="text-sm text-ink/50 mt-1">See past diagnoses and prescriptions</p>
        </Link>
      </div>
    </div>
  );
};

export default PatientDashboard;
