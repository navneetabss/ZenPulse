import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Search, Plus, Pencil, Trash2, Eye, X } from "lucide-react";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const EMPTY_FORM = {
  fullName: "",
  age: "",
  gender: "Male",
  bloodGroup: "O+",
  phone: "",
  email: "",
  address: "",
  emergencyContact: "",
  medicalHistory: "",
  department: "",
  assignedDoctor: "",
};

const Patients = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [viewPatient, setViewPatient] = useState(null);

  const loadPatients = async (p = 1, q = search) => {
    setLoading(true);
    try {
      const res = await api.get("/patients", { params: { page: p, limit: 8, search: q } });
      setPatients(res.data.patients);
      setPage(res.data.page);
      setPages(res.data.pages || 1);
    } catch {
      toast.error("Could not load patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients(1, "");
    api.get("/departments").then((res) => setDepartments(res.data.departments)).catch(() => {});
    api.get("/users/doctors/list").then((res) => setDoctors(res.data.doctors)).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadPatients(1, search);
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingId(p._id);
    setForm({
      fullName: p.fullName,
      age: p.age,
      gender: p.gender,
      bloodGroup: p.bloodGroup,
      phone: p.phone,
      email: p.email || "",
      address: p.address || "",
      emergencyContact: p.emergencyContact || "",
      medicalHistory: p.medicalHistory || "",
      department: p.department?._id || "",
      assignedDoctor: p.assignedDoctor?._id || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/patients/${editingId}`, form);
        toast.success("Patient updated successfully");
      } else {
        await api.post("/patients", form);
        toast.success("Patient added successfully");
      }
      setModalOpen(false);
      loadPatients(page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save patient");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this patient record? This cannot be undone.")) return;
    try {
      await api.delete(`/patients/${id}`);
      toast.success("Patient deleted");
      loadPatients(page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete patient");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
          <input
            className="input-field pl-9"
            placeholder="Search by name, phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        {(user.role === "admin" || user.role === "staff") && (
          <button onClick={openAddModal} className="btn-primary">
            <Plus size={16} /> Add Patient
          </button>
        )}
      </div>

      <div className="card !p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : patients.length === 0 ? (
          <EmptyState title="No patients found" message="Try a different search or add a new patient." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-ink/40 border-b border-brand-100/60 bg-brand-50/40">
                    <th className="px-5 py-3 font-semibold">Name</th>
                    <th className="px-5 py-3 font-semibold">Age / Gender</th>
                    <th className="px-5 py-3 font-semibold">Blood</th>
                    <th className="px-5 py-3 font-semibold">Phone</th>
                    <th className="px-5 py-3 font-semibold">Doctor</th>
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
                      <td className="px-5 py-3 text-ink/60">{p.assignedDoctor?.name || "—"}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setViewPatient(p)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-brand-100 text-brand-600" title="View">
                            <Eye size={15} />
                          </button>
                          {(user.role === "admin" || user.role === "staff") && (
                            <button onClick={() => openEditModal(p)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-brand-100 text-brand-600" title="Edit">
                              <Pencil size={15} />
                            </button>
                          )}
                          {user.role === "admin" && (
                            <button onClick={() => handleDelete(p._id)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-status-critical/10 text-status-critical" title="Delete">
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 py-4 border-t border-brand-100/60">
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => loadPatients(n)}
                    className={`h-8 w-8 rounded-lg text-sm font-medium ${n === page ? "bg-brand-700 text-white" : "text-ink/50 hover:bg-brand-50"}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Patient" : "Add Patient"} maxWidth="max-w-2xl">
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
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
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
              <label className="label-text">Assigned Doctor</label>
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
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save Patient"}</button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal open={!!viewPatient} onClose={() => setViewPatient(null)} title="Patient Details">
        {viewPatient && (
          <div className="space-y-3 text-sm">
            {[
              ["Full Name", viewPatient.fullName],
              ["Age / Gender", `${viewPatient.age} / ${viewPatient.gender}`],
              ["Blood Group", viewPatient.bloodGroup],
              ["Phone", viewPatient.phone],
              ["Email", viewPatient.email || "—"],
              ["Address", viewPatient.address || "—"],
              ["Emergency Contact", viewPatient.emergencyContact || "—"],
              ["Department", viewPatient.department?.name || "—"],
              ["Assigned Doctor", viewPatient.assignedDoctor?.name || "—"],
              ["Medical History", viewPatient.medicalHistory || "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-2 border-b border-brand-100/50 last:border-0">
                <span className="text-ink/45 font-medium">{label}</span>
                <span className="text-ink text-right">{value}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Patients;
