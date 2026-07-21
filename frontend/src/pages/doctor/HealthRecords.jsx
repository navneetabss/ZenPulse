import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Trash2, FileHeart, Upload, ClipboardPlus } from "lucide-react";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

const EMPTY_ITEM = { medicineName: "", dosage: "", duration: "", notes: "" };

const HealthRecords = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const patientId = searchParams.get("patient") || "";
  const appointmentId = searchParams.get("appointment") || "";

  const [patients, setPatients] = useState([]);
  const [records, setRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [saving, setSaving] = useState(false);

  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [prescription, setPrescription] = useState([{ ...EMPTY_ITEM }]);

  useEffect(() => {
    api.get("/patients/my/assigned").then((res) => setPatients(res.data.patients)).catch(() => {});
  }, []);

  const loadRecords = (pid) => {
    if (!pid) return;
    setLoadingRecords(true);
    api
      .get("/health-records", { params: { patient: pid } })
      .then((res) => setRecords(res.data.records))
      .catch(() => toast.error("Could not load medical history"))
      .finally(() => setLoadingRecords(false));
  };

  useEffect(() => {
    loadRecords(patientId);
  }, [patientId]);

  const selectPatient = (pid) => {
    setSearchParams(pid ? { patient: pid } : {});
  };

  const updateItem = (idx, field, value) => {
    setPrescription((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const addItem = () => setPrescription((prev) => [...prev, { ...EMPTY_ITEM }]);
  const removeItem = (idx) => setPrescription((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId) {
      toast.error("Select a patient first");
      return;
    }
    setSaving(true);
    try {
      await api.post("/health-records", {
        patient: patientId,
        appointment: appointmentId || undefined,
        diagnosis,
        notes,
        prescription: prescription.filter((p) => p.medicineName.trim()),
      });
      toast.success("Health record saved");
      setDiagnosis("");
      setNotes("");
      setPrescription([{ ...EMPTY_ITEM }]);
      loadRecords(patientId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save record");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadReport = (recordId, file) => {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Please choose a file under 4MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await api.post(`/health-records/${recordId}/reports`, { fileName: file.name, fileUrl: reader.result });
        toast.success("Report uploaded");
        loadRecords(patientId);
      } catch (err) {
        toast.error(err.response?.data?.message || "Could not upload report");
      }
    };
    reader.readAsDataURL(file);
  };

  const selectedPatient = patients.find((p) => p._id === patientId);

  return (
    <div className="space-y-6">
      <div className="card">
        <label className="label-text">Select patient</label>
        <select className="input-field max-w-md" value={patientId} onChange={(e) => selectPatient(e.target.value)}>
          <option value="">-- Choose an assigned patient --</option>
          {patients.map((p) => (
            <option key={p._id} value={p._id}>{p.fullName} — {p.phone}</option>
          ))}
        </select>
      </div>

      {!patientId ? (
        <div className="card"><EmptyState icon={FileHeart} title="Select a patient to continue" message="Choose a patient above to view or add health records." /></div>
      ) : (
        <>
          <div className="card">
            <h3 className="font-display font-semibold text-ink mb-4">
              New Record for {selectedPatient?.fullName || "patient"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-text">Diagnosis</label>
                <textarea rows={2} className="input-field" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g. Acute viral fever with mild dehydration" />
              </div>

              <div>
                <label className="label-text">Prescription</label>
                <div className="space-y-2">
                  {prescription.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-start">
                      <input className="input-field col-span-4" placeholder="Medicine" value={item.medicineName} onChange={(e) => updateItem(idx, "medicineName", e.target.value)} />
                      <input className="input-field col-span-3" placeholder="Dosage (1-0-1)" value={item.dosage} onChange={(e) => updateItem(idx, "dosage", e.target.value)} />
                      <input className="input-field col-span-2" placeholder="Duration" value={item.duration} onChange={(e) => updateItem(idx, "duration", e.target.value)} />
                      <input className="input-field col-span-2" placeholder="Notes" value={item.notes} onChange={(e) => updateItem(idx, "notes", e.target.value)} />
                      <button type="button" onClick={() => removeItem(idx)} className="col-span-1 h-10 flex items-center justify-center text-status-critical hover:bg-status-critical/10 rounded-lg">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addItem} className="mt-2 text-sm text-brand-600 font-medium flex items-center gap-1 hover:text-brand-700">
                  <Plus size={14} /> Add medicine
                </button>
              </div>

              <div>
                <label className="label-text">Notes</label>
                <textarea rows={2} className="input-field" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="General notes, follow-up instructions..." />
              </div>

              <button type="submit" disabled={saving} className="btn-primary">
                <ClipboardPlus size={16} /> {saving ? "Saving..." : "Save Record"}
              </button>
            </form>
          </div>

          <div className="card">
            <h3 className="font-display font-semibold text-ink mb-4">Medical History</h3>
            {loadingRecords ? (
              <LoadingSpinner />
            ) : records.length === 0 ? (
              <EmptyState title="No records yet" message="Health records added for this patient will appear here." />
            ) : (
              <div className="space-y-4">
                {records.map((r) => (
                  <div key={r._id} className="border border-brand-100 rounded-xl2 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-ink">{new Date(r.createdAt).toLocaleString()}</p>
                      <p className="text-xs text-ink/40">Dr. {r.doctor?.name}</p>
                    </div>
                    {r.diagnosis && <p className="text-sm text-ink/70 mb-2"><span className="font-medium text-ink">Diagnosis:</span> {r.diagnosis}</p>}
                    {r.prescription?.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-semibold uppercase text-ink/40 mb-1">Prescription</p>
                        <ul className="text-sm text-ink/70 space-y-0.5">
                          {r.prescription.map((item, i) => (
                            <li key={i}>• {item.medicineName} {item.dosage && `(${item.dosage})`} {item.duration && `— ${item.duration}`}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {r.notes && <p className="text-sm text-ink/70 mb-2"><span className="font-medium text-ink">Notes:</span> {r.notes}</p>}

                    <div className="flex items-center gap-2 flex-wrap mt-3">
                      {r.reportFiles?.map((f, i) => (
                        <a key={i} href={f.fileUrl} download={f.fileName} className="badge bg-brand-50 text-brand-700 hover:bg-brand-100">
                          {f.fileName}
                        </a>
                      ))}
                      <label className="badge bg-white border border-dashed border-brand-200 text-brand-600 cursor-pointer hover:bg-brand-50">
                        <Upload size={12} /> Upload report
                        <input type="file" hidden onChange={(e) => handleUploadReport(r._id, e.target.files?.[0])} />
                      </label>
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

export default HealthRecords;
