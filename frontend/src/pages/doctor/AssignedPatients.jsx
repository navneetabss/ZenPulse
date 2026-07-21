import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Stethoscope, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

const AssignedPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/patients/my/assigned")
      .then((res) => setPatients(res.data.patients))
      .catch(() => toast.error("Could not load assigned patients"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="card !p-0 overflow-hidden">
      {patients.length === 0 ? (
        <EmptyState icon={Stethoscope} title="No patients assigned yet" message="Patients assigned to you by the admin or reception will appear here." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink/40 border-b border-brand-100/60 bg-brand-50/40">
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Age / Gender</th>
                <th className="px-5 py-3 font-semibold">Blood Group</th>
                <th className="px-5 py-3 font-semibold">Phone</th>
                <th className="px-5 py-3 font-semibold">Department</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p._id} className="border-b border-brand-100/40 last:border-0 hover:bg-brand-50/20">
                  <td className="px-5 py-3 font-medium text-ink">{p.fullName}</td>
                  <td className="px-5 py-3 text-ink/60">{p.age} / {p.gender}</td>
                  <td className="px-5 py-3 text-ink/60">{p.bloodGroup}</td>
                  <td className="px-5 py-3 text-ink/60">{p.phone}</td>
                  <td className="px-5 py-3 text-ink/60">{p.department?.name || "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => navigate(`/doctor/records?patient=${p._id}`)}
                      className="btn-secondary !py-1.5 !px-3 text-xs"
                    >
                      <FileText size={14} /> View History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AssignedPatients;
