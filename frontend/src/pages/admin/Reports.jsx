import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Users, CalendarDays, TrendingUp, Pill } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

const TABS = [
  { key: "patients", label: "Patient Report", icon: Users },
  { key: "appointments", label: "Appointment Report", icon: CalendarDays },
  { key: "monthly", label: "Monthly Report", icon: TrendingUp },
  { key: "medicines", label: "Medicine Report", icon: Pill },
];

const Reports = () => {
  const [tab, setTab] = useState("patients");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/reports/${tab}`)
      .then((res) => setData(res.data))
      .catch(() => toast.error("Could not load report"))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key ? "bg-brand-700 text-white" : "bg-white text-ink/60 hover:bg-brand-50 border border-brand-100"
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : !data ? (
        <EmptyState title="No data" />
      ) : (
        <>
          {tab === "patients" && <PatientReport data={data} />}
          {tab === "appointments" && <AppointmentReport data={data} />}
          {tab === "monthly" && <MonthlyReport data={data} />}
          {tab === "medicines" && <MedicineReport data={data} />}
        </>
      )}
    </div>
  );
};

const PatientReport = ({ data }) => (
  <div className="space-y-4">
    <div className="grid sm:grid-cols-3 gap-4">
      <div className="card"><p className="text-xs uppercase text-ink/40 font-semibold">Total Patients</p><p className="text-2xl font-display font-semibold mt-1">{data.total}</p></div>
      {data.byGender.map((g) => (
        <div key={g._id} className="card"><p className="text-xs uppercase text-ink/40 font-semibold">{g._id}</p><p className="text-2xl font-display font-semibold mt-1">{g.count}</p></div>
      ))}
    </div>
    <div className="card !p-0 overflow-hidden">
      {data.patients.length === 0 ? <EmptyState title="No patients" /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs uppercase tracking-wide text-ink/40 border-b border-brand-100/60 bg-brand-50/40">
              <th className="px-5 py-3 font-semibold">Name</th><th className="px-5 py-3 font-semibold">Blood Group</th><th className="px-5 py-3 font-semibold">Department</th><th className="px-5 py-3 font-semibold">Doctor</th><th className="px-5 py-3 font-semibold">Registered</th>
            </tr></thead>
            <tbody>{data.patients.map((p) => (
              <tr key={p._id} className="border-b border-brand-100/40 last:border-0">
                <td className="px-5 py-3 font-medium text-ink">{p.fullName}</td>
                <td className="px-5 py-3 text-ink/60">{p.bloodGroup}</td>
                <td className="px-5 py-3 text-ink/60">{p.department?.name || "—"}</td>
                <td className="px-5 py-3 text-ink/60">{p.assignedDoctor?.name || "—"}</td>
                <td className="px-5 py-3 text-ink/60">{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  </div>
);

const AppointmentReport = ({ data }) => (
  <div className="space-y-4">
    <div className="grid sm:grid-cols-4 gap-4">
      <div className="card"><p className="text-xs uppercase text-ink/40 font-semibold">Total</p><p className="text-2xl font-display font-semibold mt-1">{data.total}</p></div>
      {data.byStatus.map((s) => (
        <div key={s._id} className="card"><p className="text-xs uppercase text-ink/40 font-semibold">{s._id}</p><p className="text-2xl font-display font-semibold mt-1">{s.count}</p></div>
      ))}
    </div>
    <div className="card !p-0 overflow-hidden">
      {data.appointments.length === 0 ? <EmptyState title="No appointments" /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs uppercase tracking-wide text-ink/40 border-b border-brand-100/60 bg-brand-50/40">
              <th className="px-5 py-3 font-semibold">Patient</th><th className="px-5 py-3 font-semibold">Doctor</th><th className="px-5 py-3 font-semibold">Department</th><th className="px-5 py-3 font-semibold">Date</th><th className="px-5 py-3 font-semibold">Status</th>
            </tr></thead>
            <tbody>{data.appointments.map((a) => (
              <tr key={a._id} className="border-b border-brand-100/40 last:border-0">
                <td className="px-5 py-3 font-medium text-ink">{a.patient?.fullName}</td>
                <td className="px-5 py-3 text-ink/60">{a.doctor?.name || "—"}</td>
                <td className="px-5 py-3 text-ink/60">{a.department?.name}</td>
                <td className="px-5 py-3 text-ink/60">{new Date(a.date).toLocaleDateString()}</td>
                <td className="px-5 py-3 text-ink/60">{a.status}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  </div>
);

const MonthlyReport = ({ data }) => (
  <div className="grid lg:grid-cols-2 gap-4">
    <div className="card">
      <h3 className="font-display font-semibold text-ink mb-4">Patients Registered / Month</h3>
      {data.patientsMonthly.length === 0 ? <EmptyState title="No data yet" /> : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data.patientsMonthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4EEEC" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#5A6B69" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#5A6B69" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #D2E7E5", fontSize: 13 }} />
            <Line type="monotone" dataKey="count" stroke="#0E7C7B" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
    <div className="card">
      <h3 className="font-display font-semibold text-ink mb-4">Appointments Booked / Month</h3>
      {data.appointmentsMonthly.length === 0 ? <EmptyState title="No data yet" /> : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data.appointmentsMonthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4EEEC" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#5A6B69" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#5A6B69" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #D2E7E5", fontSize: 13 }} />
            <Line type="monotone" dataKey="count" stroke="#6D5BD0" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  </div>
);

const MedicineReport = ({ data }) => (
  <div className="space-y-4">
    <div className="grid sm:grid-cols-4 gap-4">
      <div className="card"><p className="text-xs uppercase text-ink/40 font-semibold">Total Medicines</p><p className="text-2xl font-display font-semibold mt-1">{data.total}</p></div>
      <div className="card"><p className="text-xs uppercase text-ink/40 font-semibold">Inventory Value</p><p className="text-2xl font-display font-semibold mt-1">₹{data.totalInventoryValue.toLocaleString("en-IN")}</p></div>
      <div className="card"><p className="text-xs uppercase text-ink/40 font-semibold">Low Stock</p><p className="text-2xl font-display font-semibold mt-1 text-status-warning">{data.lowStockCount}</p></div>
      <div className="card"><p className="text-xs uppercase text-ink/40 font-semibold">Expired</p><p className="text-2xl font-display font-semibold mt-1 text-status-critical">{data.expiredCount}</p></div>
    </div>
    <div className="card !p-0 overflow-hidden">
      {data.medicines.length === 0 ? <EmptyState title="No medicines" /> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs uppercase tracking-wide text-ink/40 border-b border-brand-100/60 bg-brand-50/40">
              <th className="px-5 py-3 font-semibold">Name</th><th className="px-5 py-3 font-semibold">Stock</th><th className="px-5 py-3 font-semibold">Price</th><th className="px-5 py-3 font-semibold">Expiry</th>
            </tr></thead>
            <tbody>{data.medicines.map((m) => (
              <tr key={m._id} className="border-b border-brand-100/40 last:border-0">
                <td className="px-5 py-3 font-medium text-ink">{m.name}</td>
                <td className="px-5 py-3 text-ink/60">{m.stock} {m.unit}</td>
                <td className="px-5 py-3 text-ink/60">₹{m.price}</td>
                <td className="px-5 py-3 text-ink/60">{new Date(m.expiryDate).toLocaleDateString()}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  </div>
);

export default Reports;
