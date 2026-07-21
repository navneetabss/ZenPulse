import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Ticket } from "lucide-react";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { StatusBadge } from "../../components/Badge";

const AppointmentQueue = () => {
  const [departments, setDepartments] = useState([]);
  const [department, setDepartment] = useState("");
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/departments").then((res) => setDepartments(res.data.departments)).catch(() => {});
  }, []);

  const load = () => {
    setLoading(true);
    api
      .get("/appointments/list/queue", { params: department ? { department } : {} })
      .then((res) => setQueue(res.data.appointments))
      .catch(() => toast.error("Could not load queue"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department]);

  const handlePrint = () => window.print();

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <select className="input-field max-w-xs" value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="">All departments</option>
          {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <button onClick={handlePrint} className="btn-secondary">Print Token Board</button>
      </div>

      <div className="card !p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : queue.length === 0 ? (
          <EmptyState icon={Ticket} title="No appointments in today's queue" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink/40 border-b border-brand-100/60 bg-brand-50/40">
                  <th className="px-5 py-3 font-semibold">Token</th>
                  <th className="px-5 py-3 font-semibold">Patient</th>
                  <th className="px-5 py-3 font-semibold">Doctor</th>
                  <th className="px-5 py-3 font-semibold">Department</th>
                  <th className="px-5 py-3 font-semibold">Time</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((a) => (
                  <tr key={a._id} className="border-b border-brand-100/40 last:border-0">
                    <td className="px-5 py-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-white font-semibold text-xs">
                        {a.tokenNumber}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-ink">{a.patient?.fullName}</td>
                    <td className="px-5 py-3 text-ink/60">{a.doctor?.name || "—"}</td>
                    <td className="px-5 py-3 text-ink/60">{a.department?.name}</td>
                    <td className="px-5 py-3 text-ink/60">{a.time}</td>
                    <td className="px-5 py-3"><StatusBadge value={a.status} /></td>
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

export default AppointmentQueue;
