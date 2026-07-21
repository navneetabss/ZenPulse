import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Search, CalendarDays, Ticket, X } from "lucide-react";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { StatusBadge } from "../../components/Badge";

const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [form, setForm] = useState({ department: "", doctor: "", date: "", time: "", reason: "" });
  const [saving, setSaving] = useState(false);
  const [bookedToken, setBookedToken] = useState(null);

  const [upcoming, setUpcoming] = useState([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);

  useEffect(() => {
    api.get("/departments").then((res) => setDepartments(res.data.departments)).catch(() => {});
  }, []);

  useEffect(() => {
    const pid = searchParams.get("patient");
    if (pid) {
      api.get(`/patients/${pid}`).then((res) => {
        setSelectedPatient(res.data.patient);
        setSearch(res.data.patient.fullName);
        loadUpcoming(pid);
      }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (form.department) {
      api.get("/users/doctors/list", { params: { department: form.department } }).then((res) => setDoctors(res.data.doctors)).catch(() => {});
    } else {
      setDoctors([]);
    }
  }, [form.department]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (search.trim() && !selectedPatient) {
        api.get("/patients", { params: { search, limit: 6 } }).then((res) => setPatients(res.data.patients));
      } else {
        setPatients([]);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [search, selectedPatient]);

  const loadUpcoming = (patientId) => {
    setLoadingUpcoming(true);
    api.get("/appointments/list/upcoming", { params: { patient: patientId } })
      .then((res) => setUpcoming(res.data.appointments))
      .finally(() => setLoadingUpcoming(false));
  };

  const selectPatient = (p) => {
    setSelectedPatient(p);
    setSearch(p.fullName);
    setPatients([]);
    loadUpcoming(p._id);
  };

  const clearPatient = () => {
    setSelectedPatient(null);
    setSearch("");
    setUpcoming([]);
    setBookedToken(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) {
      toast.error("Please select a patient first");
      return;
    }
    setSaving(true);
    try {
      const res = await api.post("/appointments", { ...form, patient: selectedPatient._id });
      toast.success("Appointment booked successfully");
      setBookedToken(res.data.appointment.tokenNumber);
      setForm({ department: "", doctor: "", date: "", time: "", reason: "" });
      loadUpcoming(selectedPatient._id);
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
      loadUpcoming(selectedPatient._id);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not cancel appointment");
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="card">
        <label className="label-text">Patient</label>
        {selectedPatient ? (
          <div className="flex items-center justify-between bg-brand-50/60 rounded-lg px-3.5 py-2.5">
            <div>
              <p className="text-sm font-medium text-ink">{selectedPatient.fullName}</p>
              <p className="text-xs text-ink/50">{selectedPatient.phone}</p>
            </div>
            <button onClick={clearPatient} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-brand-100 text-ink/50"><X size={14} /></button>
          </div>
        ) : (
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
            <input className="input-field pl-9" placeholder="Search patient by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
            {patients.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-surface border border-brand-100 rounded-lg shadow-card overflow-hidden">
                {patients.map((p) => (
                  <button key={p._id} type="button" onClick={() => selectPatient(p)} className="w-full text-left px-3.5 py-2.5 hover:bg-brand-50 text-sm border-b border-brand-100/50 last:border-0">
                    <span className="font-medium text-ink">{p.fullName}</span>
                    <span className="text-ink/40 ml-2">{p.phone}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedPatient && (
        <>
          <div className="card">
            <h3 className="font-display font-semibold text-ink mb-4">Book New Appointment</h3>
            {bookedToken && (
              <div className="mb-4 flex items-center gap-2 bg-status-stable/10 text-status-stable px-4 py-2.5 rounded-lg text-sm font-medium">
                <Ticket size={16} /> Appointment booked — Token #{bookedToken}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
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
                <div>
                  <label className="label-text">Date</label>
                  <input required type="date" min={new Date().toISOString().slice(0, 10)} className="input-field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div>
                  <label className="label-text">Time</label>
                  <input required className="input-field" placeholder="10:30 AM" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="label-text">Reason for visit</label>
                  <input className="input-field" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn-primary">
                <CalendarDays size={16} /> {saving ? "Booking..." : "Book Appointment"}
              </button>
            </form>
          </div>

          <div className="card">
            <h3 className="font-display font-semibold text-ink mb-4">Upcoming Appointments</h3>
            {loadingUpcoming ? <LoadingSpinner /> : upcoming.length === 0 ? (
              <EmptyState title="No upcoming appointments" />
            ) : (
              <div className="space-y-2.5">
                {upcoming.map((a) => (
                  <div key={a._id} className="flex items-center justify-between border border-brand-100 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-ink">{a.department?.name} {a.doctor?.name ? `— Dr. ${a.doctor.name}` : ""}</p>
                      <p className="text-xs text-ink/50">{new Date(a.date).toLocaleDateString()} · {a.time} · Token #{a.tokenNumber}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge value={a.status} />
                      <button onClick={() => handleCancel(a._id)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-status-critical/10 text-status-critical"><X size={15} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BookAppointment;
