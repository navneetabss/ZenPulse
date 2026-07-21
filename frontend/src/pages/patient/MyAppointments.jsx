import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarDays, Plus, X, Ticket } from "lucide-react";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import { StatusBadge } from "../../components/Badge";
import { useAuth } from "../../context/AuthContext";

const MyAppointments = () => {
  const { user } = useAuth();
  const patientId = user.patientProfile;

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ department: "", doctor: "", date: "", time: "", reason: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!patientId) return;
    setLoading(true);
    api
      .get("/appointments", { params: { patient: patientId } })
      .then((res) => setAppointments(res.data.appointments))
      .catch(() => toast.error("Could not load appointments"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api.get("/departments").then((res) => setDepartments(res.data.departments)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (form.department) {
      api.get("/users/doctors/list", { params: { department: form.department } }).then((res) => setDoctors(res.data.doctors));
    } else {
      setDoctors([]);
    }
  }, [form.department]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId) {
      toast.error("Your patient profile isn't set up yet. Please contact reception.");
      return;
    }
    setSaving(true);
    try {
      const res = await api.post("/appointments", { ...form, patient: patientId });
      toast.success(`Appointment booked — Token #${res.data.appointment.tokenNumber}`);
      setModalOpen(false);
      setForm({ department: "", doctor: "", date: "", time: "", reason: "" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not book appointment");
    } finally {
      setSaving(false);
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

  if (!patientId) {
    return (
      <div className="card">
        <EmptyState
          icon={CalendarDays}
          title="Patient profile not linked"
          message="Please contact hospital reception to link your account with a patient record before booking appointments."
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus size={16} /> Book Appointment
        </button>
      </div>

      <div className="card !p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : appointments.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No appointments yet" message="Book your first appointment to get started." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink/40 border-b border-brand-100/60 bg-brand-50/40">
                  <th className="px-5 py-3 font-semibold">Token</th>
                  <th className="px-5 py-3 font-semibold">Doctor</th>
                  <th className="px-5 py-3 font-semibold">Department</th>
                  <th className="px-5 py-3 font-semibold">Date / Time</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a._id} className="border-b border-brand-100/40 last:border-0">
                    <td className="px-5 py-3 font-medium text-ink">#{a.tokenNumber}</td>
                    <td className="px-5 py-3 text-ink/60">{a.doctor?.name || "Any available doctor"}</td>
                    <td className="px-5 py-3 text-ink/60">{a.department?.name}</td>
                    <td className="px-5 py-3 text-ink/60">{new Date(a.date).toLocaleDateString()} · {a.time}</td>
                    <td className="px-5 py-3"><StatusBadge value={a.status} /></td>
                    <td className="px-5 py-3 text-right">
                      {["Pending", "Confirmed"].includes(a.status) && (
                        <button onClick={() => handleCancel(a._id)} className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-status-critical/10 text-status-critical"><X size={15} /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Book Appointment">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Department</label>
            <select required className="input-field" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value, doctor: "" })}>
              <option value="">Select department</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label-text">Doctor (optional)</label>
            <select className="input-field" value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} disabled={!form.department}>
              <option value="">Any available doctor</option>
              {doctors.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Date</label>
              <input required type="date" min={new Date().toISOString().slice(0, 10)} className="input-field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="label-text">Time</label>
              <input required className="input-field" placeholder="10:30 AM" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label-text">Reason for visit</label>
            <textarea rows={2} className="input-field" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary"><Ticket size={16} /> {saving ? "Booking..." : "Book Appointment"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyAppointments;
