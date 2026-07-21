import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/departments");
      setDepartments(res.data.departments);
    } catch {
      toast.error("Could not load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: "", description: "" });
    setModalOpen(true);
  };

  const openEdit = (d) => {
    setEditingId(d._id);
    setForm({ name: d.name, description: d.description || "" });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/departments/${editingId}`, form);
        toast.success("Department updated");
      } else {
        await api.post("/departments", form);
        toast.success("Department created");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save department");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    try {
      await api.delete(`/departments/${id}`);
      toast.success("Department deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete department");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add Department
        </button>
      </div>

      {departments.length === 0 ? (
        <div className="card"><EmptyState icon={Building2} title="No departments yet" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((d) => (
            <div key={d._id} className="card">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-xl2 bg-brand-50 text-brand-700 flex items-center justify-center">
                  <Building2 size={18} />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(d)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-brand-100 text-brand-600">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(d._id)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-status-critical/10 text-status-critical">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="font-display font-semibold text-ink mt-3">{d.name}</p>
              <p className="text-sm text-ink/50 mt-1">{d.description || "No description"}</p>
              <span className={`badge mt-3 ${d.isActive ? "bg-status-stable/10 text-status-stable" : "bg-ink/5 text-ink/40"}`}>
                {d.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Department" : "Add Department"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Department name</label>
            <input required className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label-text">Description</label>
            <textarea rows={3} className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Departments;
