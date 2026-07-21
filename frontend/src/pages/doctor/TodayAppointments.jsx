import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarDays, ClipboardPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

const TodayAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/appointments/list/today")
      .then((res) => setAppointments(res.data.appointments))
      .catch(() => toast.error("Could not load today's appointments"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="card !p-0 overflow-hidden">
      {appointments.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No appointments today" message="Enjoy the quiet — check back tomorrow." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink/40 border-b border-brand-100/60 bg-brand-50/40">
                <th className="px-5 py-3 font-semibold">Token</th>
                <th className="px-5 py-3 font-semibold">Patient</th>
                <th className="px-5 py-3 font-semibold">Age / Gender</th>
                <th className="px-5 py-3 font-semibold">Blood Group</th>
                <th className="px-5 py-3 font-semibold">Time</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a._id} className="border-b border-brand-100/40 last:border-0 hover:bg-brand-50/20">
                  <td className="px-5 py-3 font-medium text-ink">#{a.tokenNumber}</td>
                  <td className="px-5 py-3 text-ink">{a.patient?.fullName}</td>
                  <td className="px-5 py-3 text-ink/60">{a.patient?.age} / {a.patient?.gender}</td>
                  <td className="px-5 py-3 text-ink/60">{a.patient?.bloodGroup}</td>
                  <td className="px-5 py-3 text-ink/60">{a.time}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => navigate(`/doctor/records?patient=${a.patient?._id}&appointment=${a._id}`)}
                      className="btn-secondary !py-1.5 !px-3 text-xs"
                    >
                      <ClipboardPlus size={14} /> Add Record
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

export default TodayAppointments;
