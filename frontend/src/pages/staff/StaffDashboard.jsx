import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UserPlus, CalendarDays, Ticket, Users } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import StatCard from "../../components/StatCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

const StaffDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/staff")
      .then((res) => setStats(res.data.stats))
      .catch(() => toast.error("Could not load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="card bg-role-staff text-white !border-0">
        <p className="text-sm text-white/80">Welcome back,</p>
        <p className="text-xl font-display font-semibold">{user.name}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={UserPlus} label="Patients Registered Today" value={stats.patientsRegisteredToday} accent="staff" />
        <StatCard icon={CalendarDays} label="Appointments Booked Today" value={stats.appointmentsBookedToday} accent="staff" />
        <StatCard icon={Ticket} label="Today's Queue" value={stats.queueToday} accent="warning" />
        <StatCard icon={Users} label="Total Patients" value={stats.totalPatients} accent="brand" />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Link to="/staff/register-patient" className="card hover:border-brand-300 transition-colors">
          <UserPlus className="text-role-staff mb-2" size={22} />
          <p className="font-display font-semibold text-ink">Register Patient</p>
          <p className="text-sm text-ink/50 mt-1">Add a new patient to the system</p>
        </Link>
        <Link to="/staff/appointments" className="card hover:border-brand-300 transition-colors">
          <CalendarDays className="text-role-staff mb-2" size={22} />
          <p className="font-display font-semibold text-ink">Book Appointment</p>
          <p className="text-sm text-ink/50 mt-1">Schedule a new appointment</p>
        </Link>
        <Link to="/staff/queue" className="card hover:border-brand-300 transition-colors">
          <Ticket className="text-role-staff mb-2" size={22} />
          <p className="font-display font-semibold text-ink">Appointment Queue</p>
          <p className="text-sm text-ink/50 mt-1">View today's token queue</p>
        </Link>
      </div>
    </div>
  );
};

export default StaffDashboard;
