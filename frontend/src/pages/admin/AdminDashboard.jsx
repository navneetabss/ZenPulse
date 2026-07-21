import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Users, Stethoscope, HeartPulse, UserCog, CalendarDays, Building2, IndianRupee } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import api from "../../api/axios";
import StatCard from "../../components/StatCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

const STATUS_COLORS = { Pending: "#D99A2B", Confirmed: "#2F6FDB", Completed: "#2E9E6C", Cancelled: "#D64545" };

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/admin")
      .then((res) => setStats(res.data.stats))
      .catch(() => toast.error("Could not load dashboard stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!stats) return <EmptyState title="No data available" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Patients" value={stats.totalPatients} accent="brand" />
        <StatCard icon={Stethoscope} label="Total Doctors" value={stats.totalDoctors} accent="doctor" />
        <StatCard icon={HeartPulse} label="Total Nurses" value={stats.totalNurses} accent="nurse" />
        <StatCard icon={UserCog} label="Total Staff" value={stats.totalStaff} accent="staff" />
        <StatCard icon={CalendarDays} label="Total Appointments" value={stats.totalAppointments} accent="admin" />
        <StatCard icon={Building2} label="Departments" value={stats.totalDepartments} accent="brand" />
        <StatCard
          icon={IndianRupee}
          label="Revenue (Appointments)"
          value={`₹${stats.revenue.fromAppointments.toLocaleString("en-IN")}`}
          accent="brand"
          sublabel="From completed consultations"
        />
        <StatCard
          icon={IndianRupee}
          label="Medicine Inventory Value"
          value={`₹${stats.revenue.medicineInventoryValue.toLocaleString("en-IN")}`}
          accent="warning"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <h3 className="font-display font-semibold text-ink mb-4">Monthly Patient Registrations</h3>
          {stats.monthlyRegistrations.length === 0 ? (
            <EmptyState title="No registrations yet" message="Patient registration trends will appear here." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.monthlyRegistrations}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4EEEC" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#5A6B69" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#5A6B69" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: "#EAF4F3" }} contentStyle={{ borderRadius: 10, border: "1px solid #D2E7E5", fontSize: 13 }} />
                <Bar dataKey="count" name="Patients" fill="#0E7C7B" radius={[6, 6, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 className="font-display font-semibold text-ink mb-4">Appointments by Status</h3>
          {stats.appointmentsByStatus.length === 0 ? (
            <EmptyState title="No appointments yet" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats.appointmentsByStatus}
                  dataKey="count"
                  nameKey="_id"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {stats.appointmentsByStatus.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry._id] || "#0E7C7B"} />
                  ))}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #D2E7E5", fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="font-display font-semibold text-ink mb-4">Recent Patients</h3>
        {stats.recentPatients.length === 0 ? (
          <EmptyState title="No patients registered yet" />
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink/40 border-b border-brand-100/60">
                  <th className="px-5 py-2.5 font-semibold">Name</th>
                  <th className="px-5 py-2.5 font-semibold">Age</th>
                  <th className="px-5 py-2.5 font-semibold">Gender</th>
                  <th className="px-5 py-2.5 font-semibold">Phone</th>
                  <th className="px-5 py-2.5 font-semibold">Registered</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentPatients.map((p) => (
                  <tr key={p._id} className="border-b border-brand-100/40 last:border-0">
                    <td className="px-5 py-3 font-medium text-ink">{p.fullName}</td>
                    <td className="px-5 py-3 text-ink/60">{p.age}</td>
                    <td className="px-5 py-3 text-ink/60">{p.gender}</td>
                    <td className="px-5 py-3 text-ink/60">{p.phone}</td>
                    <td className="px-5 py-3 text-ink/60">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
