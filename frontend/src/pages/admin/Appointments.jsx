import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarDays, X, Pencil } from "lucide-react";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import { StatusBadge } from "../../components/Badge";

const STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled"];

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/appointments", { params: statusFilter ? { status: statusFilter } : {} });
      setAppointments(res.data.appointments);
    } catch {
      toast.error("Could not load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      toast.success("Appointment updated");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update appointment");
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await api.put(`/appointments/${id}/cancel`);
      toast.success("Appointment cancelled");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not cancel appointment");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/appointments/${editing._id}`, {
        date: editing.date,
        time: editing.time,
        reason: editing.reason,
      });
      toast.success("Appointment updated");
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update appointment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setStatusFilter("")}
          className={`badge cursor-pointer ${statusFilter === "" ? "bg-brand-700 text-white" : "bg-brand-50 text-brand-700"}`}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`badge cursor-pointer ${statusFilter === s ? "bg-brand-700 text-white" : "bg-brand-50 text-brand-700"}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="card !p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : appointments.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No appointments found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink/40 border-b border-brand-100/60 bg-brand-50/40">
                  <th className="px-5 py-3 font-semibold">Token</th>
                  <th className="px-5 py-3 font-semibold">Patient</th>
                  <th className="px-5 py-3 font-semibold">Doctor</th>
                  <th className="px-5 py-3 font-semibold">Department</th>
                  <th className="px-5 py-3 font-semibold">Date / Time</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a._id} className="border-b border-brand-100/40 last:border-0 hover:bg-brand-50/20">
                    <td className="px-5 py-3 font-medium text-ink">#{a.tokenNumber}</td>
                    <td className="px-5 py-3 text-ink">{a.patient?.fullName}</td>
                    <td className="px-5 py-3 text-ink/60">{a.doctor?.name || "—"}</td>
                    <td className="px-5 py-3 text-ink/60">{a.department?.name}</td>
                    <td className="px-5 py-3 text-ink/60">{new Date(a.date).toLocaleDateString()} · {a.time}</td>
                    <td className="px-5 py-3">
                      <select
                        value={a.status}
                        onChange={(e) => handleStatusChange(a._id, e.target.value)}
                        className="text-xs font-semibold rounded-full border-0 bg-transparent focus:ring-1 focus:ring-brand-400 cursor-pointer"
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setEditing({ ...a, date: a.date.slice(0, 10) })} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-brand-100 text-brand-600" title="Edit">
                          <Pencil size={15} />
                        </button>
                        {a.status !== "Cancelled" && (
                          <button onClick={() => handleCancel(a._id)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-status-critical/10 text-status-critical" title="Cancel">
                            <X size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Appointment">
        {editing && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="label-text">Date</label>
              <input type="date" required className="input-field" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} />
            </div>
            <div>
              <label className="label-text">Time</label>
              <input required className="input-field" placeholder="10:30 AM" value={editing.time} onChange={(e) => setEditing({ ...editing, time: e.target.value })} />
            </div>
            <div>
              <label className="label-text">Reason</label>
              <textarea rows={3} className="input-field" value={editing.reason || ""} onChange={(e) => setEditing({ ...editing, reason: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save Changes"}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Appointments;
