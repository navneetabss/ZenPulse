import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const EMPTY_FORM = {
  fullName: "", age: "", gender: "Male", bloodGroup: "O+", phone: "", email: "",
  address: "", emergencyContact: "", medicalHistory: "", department: "", assignedDoctor: "",
};

const RegisterPatient = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/departments").then((res) => setDepartments(res.data.departments)).catch(() => {});
    api.get("/users/doctors/list").then((res) => setDoctors(res.data.doctors)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post("/patients", form);
      toast.success("Patient registered successfully");
      setForm(EMPTY_FORM);
      navigate(`/staff/appointments?patient=${res.data.patient._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not register patient");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Full name</label>
              <input required className="input-field" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div>
              <label className="label-text">Phone</label>
              <input required className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="label-text">Age</label>
              <input required type="number" min="0" className="input-field" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
            </div>
            <div>
              <label className="label-text">Gender</label>
              <select className="input-field" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="label-text">Blood group</label>
              <select className="input-field" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
                {BLOOD_GROUPS.map((bg) => <option key={bg}>{bg}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Email</label>
              <input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label-text">Department</label>
              <select className="input-field" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                <option value="">Not assigned</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text">Assign Doctor</label>
              <select className="input-field" value={form.assignedDoctor} onChange={(e) => setForm({ ...form, assignedDoctor: e.target.value })}>
                <option value="">Not assigned</option>
                {doctors.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label-text">Address</label>
              <input className="input-field" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <label className="label-text">Emergency contact</label>
              <input className="input-field" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label-text">Medical history</label>
              <textarea rows={3} className="input-field" value={form.medicalHistory} onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })} />
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            <UserPlus size={16} /> {saving ? "Registering..." : "Register Patient"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPatient;
