import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, UserCog, Search } from "lucide-react";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import { RoleBadge } from "../../components/Badge";

const ROLES = ["admin", "doctor", "nurse", "staff"];
const EMPTY_FORM = { name: "", email: "", password: "", role: "doctor", phone: "", department: "", specialization: "" };

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users", { params: { search, role: roleFilter } });
      setUsers(res.data.users);
    } catch {
      toast.error("Could not load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    api.get("/departments").then((res) => setDepartments(res.data.departments)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditingId(u._id);
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
      phone: u.phone || "",
      department: u.department?._id || "",
      specialization: u.specialization || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, form);
        toast.success("User updated");
      } else {
        await api.post("/users", form);
        toast.success(`${form.role} account created`);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save user");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (u) => {
    try {
      await api.put(`/users/${u._id}`, { isActive: !u.isActive });
      toast.success(u.isActive ? "User deactivated" : "User activated");
      load();
    } catch {
      toast.error("Could not update user status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user account?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("User deleted");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete user");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <form onSubmit={(e) => { e.preventDefault(); load(); }} className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
            <input className="input-field pl-9 w-56" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </form>
          <select className="input-field w-40" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All roles</option>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            <option value="patient">patient</option>
          </select>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="card !p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : users.length === 0 ? (
          <EmptyState icon={UserCog} title="No users found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink/40 border-b border-brand-100/60 bg-brand-50/40">
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Department</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-brand-100/40 last:border-0 hover:bg-brand-50/20">
                    <td className="px-5 py-3 font-medium text-ink">{u.name}</td>
                    <td className="px-5 py-3 text-ink/60">{u.email}</td>
                    <td className="px-5 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-5 py-3 text-ink/60">{u.department?.name || "—"}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleToggleActive(u)}
                        disabled={u.role === "admin"}
                        className={`badge cursor-pointer disabled:cursor-not-allowed ${u.isActive ? "bg-status-stable/10 text-status-stable" : "bg-ink/5 text-ink/40"}`}
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(u)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-brand-100 text-brand-600"><Pencil size={15} /></button>
                        {u.role !== "admin" && (
                          <button onClick={() => handleDelete(u._id)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-status-critical/10 text-status-critical"><Trash2 size={15} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit User" : "Add User"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Full name</label>
            <input required className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Email</label>
              <input required type="email" disabled={!!editingId} className="input-field disabled:bg-brand-50/60" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label-text">Phone</label>
              <input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          {!editingId && (
            <div>
              <label className="label-text">Temporary password</label>
              <input required type="password" minLength={6} className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Role</label>
              <select className="input-field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {form.role === "doctor" && (
              <div>
                <label className="label-text">Department</label>
                <select className="input-field" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                  <option value="">Select department</option>
                  {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
            )}
          </div>
          {form.role === "doctor" && (
            <div>
              <label className="label-text">Specialization</label>
              <input className="input-field" placeholder="e.g. Cardiologist" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageUsers;
