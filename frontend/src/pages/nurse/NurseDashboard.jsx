import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Activity, ClipboardList, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import StatCard from "../../components/StatCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

const NurseDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/nurse")
      .then((res) => setStats(res.data.stats))
      .catch(() => toast.error("Could not load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="card bg-role-nurse text-white !border-0">
        <p className="text-sm text-white/80">Welcome back,</p>
        <p className="text-xl font-display font-semibold">Nurse {user.name}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Activity} label="Vitals Logged Today" value={stats.vitalsToday} accent="nurse" />
        <StatCard icon={ClipboardList} label="Total Logged (You)" value={stats.totalVitalsLogged} accent="brand" />
        <StatCard icon={AlertTriangle} label="Critical Patients (Ward)" value={stats.criticalPatients} accent="critical" />
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display font-semibold text-ink">Enter new vitals</p>
            <p className="text-sm text-ink/50 mt-0.5">Log BP, temperature, oxygen level and ward notes for a patient.</p>
          </div>
          <Link to="/nurse/vitals" className="btn-primary shrink-0">Go to Vitals</Link>
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;
