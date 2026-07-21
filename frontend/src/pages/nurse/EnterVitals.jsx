import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Activity, Search } from "lucide-react";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { StatusBadge } from "../../components/Badge";

const EMPTY_FORM = {
  patient: "",
  bloodPressure: "",
  temperature: "",
  heartRate: "",
  oxygenLevel: "",
  wardNotes: "",
  medicationGiven: "Pending",
  status: "Stable",
};

const EnterVitals = () => {
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const searchPatients = async (q) => {
    try {
      const res = await api.get("/patients", { params: { search: q, limit: 6 } });
      setPatients(res.data.patients);
    } catch {
      /* silent */
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (search.trim()) searchPatients(search);
      else setPatients([]);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const loadHistory = (patientId) => {
    setLoadingHistory(true);
    api
      .get("/vitals", { params: { patient: patientId } })
      .then((res) => setHistory(res.data.vitals))
      .catch(() => toast.error("Could not load vitals history"))
      .finally(() => setLoadingHistory(false));
  };

  const selectPatient = (p) => {
    setForm({ ...EMPTY_FORM, patient: p._id });
    setSearch(p.fullName);
    setPatients([]);
    loadHistory(p._id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient) {
      toast.error("Please select a patient first");
      return;
    }
    setSaving(true);
    try {
      await api.post("/vitals", form);
      toast.success("Vitals recorded successfully");
      setForm({ ...EMPTY_FORM, patient: form.patient });
      loadHistory(form.patient);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save vitals");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <label className="label-text">Find patient</label>
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
          <input
            className="input-field pl-9"
            placeholder="Search patient by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {patients.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-surface border border-brand-100 rounded-lg shadow-card overflow-hidden">
              {patients.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => selectPatient(p)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-brand-50 text-sm border-b border-brand-100/50 last:border-0"
                >
                  <span className="font-medium text-ink">{p.fullName}</span>
                  <span className="text-ink/40 ml-2">{p.phone}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {form.patient && (
        <>
          <div className="card">
            <h3 className="font-display font-semibold text-ink mb-4">Record Vitals</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="label-text">Blood Pressure</label>
                  <input required className="input-field" placeholder="120/80" value={form.bloodPressure} onChange={(e) => setForm({ ...form, bloodPressure: e.target.value })} />
                </div>
                <div>
                  <label className="label-text">Temperature (°F)</label>
                  <input required type="number" step="0.1" className="input-field" placeholder="98.6" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} />
                </div>
                <div>
                  <label className="label-text">Heart Rate (bpm)</label>
                  <input required type="number" className="input-field" placeholder="78" value={form.heartRate} onChange={(e) => setForm({ ...form, heartRate: e.target.value })} />
                </div>
                <div>
                  <label className="label-text">Oxygen Level (%)</label>
                  <input required type="number" className="input-field" placeholder="99" value={form.oxygenLevel} onChange={(e) => setForm({ ...form, oxygenLevel: e.target.value })} />
                </div>
                <div>
                  <label className="label-text">Medication Given</label>
                  <select className="input-field" value={form.medicationGiven} onChange={(e) => setForm({ ...form, medicationGiven: e.target.value })}>
                    <option>Pending</option>
                    <option>Given</option>
                    <option>Skipped</option>
                  </select>
                </div>
                <div>
                  <label className="label-text">Status</label>
                  <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option>Stable</option>
                    <option>Under Observation</option>
                    <option>Critical</option>
                    <option>Recovering</option>
                  </select>
                </div>
                <div className="sm:col-span-2 lg:col-span-2">
                  <label className="label-text">Ward Notes</label>
                  <input className="input-field" placeholder="Any additional notes..." value={form.wardNotes} onChange={(e) => setForm({ ...form, wardNotes: e.target.value })} />
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn-primary">
                <Activity size={16} /> {saving ? "Saving..." : "Save Vitals"}
              </button>
            </form>
          </div>

          <div className="card">
            <h3 className="font-display font-semibold text-ink mb-4">Vitals History</h3>
            {loadingHistory ? (
              <LoadingSpinner />
            ) : history.length === 0 ? (
              <EmptyState title="No vitals recorded for this patient yet" />
            ) : (
              <div className="overflow-x-auto -mx-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-ink/40 border-b border-brand-100/60">
                      <th className="px-5 py-2.5 font-semibold">Date</th>
                      <th className="px-5 py-2.5 font-semibold">BP</th>
                      <th className="px-5 py-2.5 font-semibold">Temp</th>
                      <th className="px-5 py-2.5 font-semibold">Oxygen</th>
                      <th className="px-5 py-2.5 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((v) => (
                      <tr key={v._id} className="border-b border-brand-100/40 last:border-0">
                        <td className="px-5 py-3 text-ink/60">{new Date(v.createdAt).toLocaleString()}</td>
                        <td className="px-5 py-3 text-ink/60">{v.bloodPressure}</td>
                        <td className="px-5 py-3 text-ink/60">{v.temperature}°F</td>
                        <td className="px-5 py-3 text-ink/60">{v.oxygenLevel}%</td>
                        <td className="px-5 py-3"><StatusBadge value={v.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EnterVitals;
