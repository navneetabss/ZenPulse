import React from "react";

const ACCENT_CLASSES = {
  brand: "bg-brand-50 text-brand-700",
  admin: "bg-role-admin/10 text-role-admin",
  doctor: "bg-role-doctor/10 text-role-doctor",
  nurse: "bg-role-nurse/10 text-role-nurse",
  staff: "bg-role-staff/10 text-role-staff",
  patient: "bg-role-patient/10 text-role-patient",
  critical: "bg-status-critical/10 text-status-critical",
  warning: "bg-status-warning/10 text-status-warning",
};

const StatCard = ({ icon: Icon, label, value, accent = "brand", sublabel }) => {
  const accentClass = ACCENT_CLASSES[accent] || ACCENT_CLASSES.brand;
  return (
    <div className="card flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/45">{label}</p>
        <p className="text-3xl font-display font-semibold text-ink mt-1.5">{value}</p>
        {sublabel && <p className="text-xs text-ink/40 mt-1">{sublabel}</p>}
      </div>
      {Icon && (
        <div className={`shrink-0 h-11 w-11 rounded-xl2 flex items-center justify-center ${accentClass}`}>
          <Icon size={20} strokeWidth={2} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
