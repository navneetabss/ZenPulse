import React from "react";

const STATUS_STYLES = {
  // appointment / generic statuses
  Pending: "bg-status-warning/10 text-status-warning",
  Confirmed: "bg-status-info/10 text-status-info",
  Completed: "bg-status-stable/10 text-status-stable",
  Cancelled: "bg-status-critical/10 text-status-critical",
  // vitals statuses
  Stable: "bg-status-stable/10 text-status-stable",
  Critical: "bg-status-critical/10 text-status-critical",
  "Under Observation": "bg-status-warning/10 text-status-warning",
  Recovering: "bg-status-info/10 text-status-info",
  // medication given
  Given: "bg-status-stable/10 text-status-stable",
  Skipped: "bg-status-critical/10 text-status-critical",
};

const ROLE_STYLES = {
  admin: "bg-role-admin/10 text-role-admin",
  doctor: "bg-role-doctor/10 text-role-doctor",
  nurse: "bg-role-nurse/10 text-role-nurse",
  staff: "bg-role-staff/10 text-role-staff",
  patient: "bg-role-patient/10 text-role-patient",
};

export const StatusBadge = ({ value }) => (
  <span className={`badge ${STATUS_STYLES[value] || "bg-ink/5 text-ink/60"}`}>{value}</span>
);

export const RoleBadge = ({ role }) => (
  <span className={`badge capitalize ${ROLE_STYLES[role] || "bg-ink/5 text-ink/60"}`}>{role}</span>
);
