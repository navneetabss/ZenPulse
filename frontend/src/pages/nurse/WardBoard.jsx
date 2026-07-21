import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HeartPulse } from "lucide-react";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { StatusBadge } from "../../components/Badge";

const WardBoard = () => {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/vitals/board/latest")
      .then((res) => setBoard(res.data.board))
      .catch(() => toast.error("Could not load ward board"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="card !p-0 overflow-hidden">
      {board.length === 0 ? (
        <EmptyState icon={HeartPulse} title="No vitals recorded yet" message="Once you log vitals for patients, the ward board will show the latest reading for each." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink/40 border-b border-brand-100/60 bg-brand-50/40">
                <th className="px-5 py-3 font-semibold">Patient</th>
                <th className="px-5 py-3 font-semibold">BP</th>
                <th className="px-5 py-3 font-semibold">Temp</th>
                <th className="px-5 py-3 font-semibold">Heart Rate</th>
                <th className="px-5 py-3 font-semibold">Oxygen</th>
                <th className="px-5 py-3 font-semibold">Medication</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {board.map((v) => (
                <tr key={v._id} className="border-b border-brand-100/40 last:border-0 hover:bg-brand-50/20">
                  <td className="px-5 py-3 font-medium text-ink">{v.patient?.fullName}</td>
                  <td className="px-5 py-3 text-ink/60">{v.bloodPressure}</td>
                  <td className="px-5 py-3 text-ink/60">{v.temperature}°F</td>
                  <td className="px-5 py-3 text-ink/60">{v.heartRate} bpm</td>
                  <td className="px-5 py-3 text-ink/60">{v.oxygenLevel}%</td>
                  <td className="px-5 py-3"><StatusBadge value={v.medicationGiven} /></td>
                  <td className="px-5 py-3"><StatusBadge value={v.status} /></td>
                  <td className="px-5 py-3 text-ink/40 text-xs">{new Date(v.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WardBoard;
