import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FileHeart, Download } from "lucide-react";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { useAuth } from "../../context/AuthContext";

const Prescriptions = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user.patientProfile) {
      setLoading(false);
      return;
    }
    api
      .get("/health-records", { params: { patient: user.patientProfile } })
      .then((res) => setRecords(res.data.records))
      .catch(() => toast.error("Could not load prescriptions"))
      .finally(() => setLoading(false));
  }, [user.patientProfile]);

  if (loading) return <LoadingSpinner />;

  if (!user.patientProfile) {
    return (
      <div className="card">
        <EmptyState icon={FileHeart} title="Patient profile not linked" message="Please contact hospital reception to link your account with a patient record." />
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="card">
        <EmptyState icon={FileHeart} title="No prescriptions yet" message="Prescriptions from your doctor visits will appear here." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((r) => (
        <div key={r._id} className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-ink">{new Date(r.createdAt).toLocaleDateString()}</p>
            <p className="text-xs text-ink/40">Dr. {r.doctor?.name} {r.doctor?.specialization ? `— ${r.doctor.specialization}` : ""}</p>
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
          {r.reportFiles?.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mt-3">
              {r.reportFiles.map((f, i) => (
                <a key={i} href={f.fileUrl} download={f.fileName} className="badge bg-brand-50 text-brand-700 hover:bg-brand-100">
                  <Download size={12} /> {f.fileName}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Prescriptions;
