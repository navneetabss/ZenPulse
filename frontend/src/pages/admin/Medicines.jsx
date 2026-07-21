import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Pill, Search } from "lucide-react";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";

const EMPTY_FORM = { name: "", category: "", stock: "", unit: "tablets", price: "", expiryDate: "", manufacturer: "" };

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async (q = "") => {
    setLoading(true);
    try {
      const res = await api.get("/medicines", { params: q ? { search: q } : {} });
      setMedicines(res.data.medicines);
    } catch {
      toast.error("Could not load medicines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (m) => {
    setEditingId(m._id);
    setForm({
      name: m.name,
      category: m.category || "",
      stock: m.stock,
      unit: m.unit || "tablets",
      price: m.price,
      expiryDate: m.expiryDate?.slice(0, 10),
      manufacturer: m.manufacturer || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/medicines/${editingId}`, form);
        toast.success("Medicine updated");
      } else {
        await api.post("/medicines", form);
        toast.success("Medicine added");
      }
      setModalOpen(false);
      load(search);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save medicine");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this medicine?")) return;
    try {
      await api.delete(`/medicines/${id}`);
      toast.success("Medicine deleted");
      load(search);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete medicine");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <form onSubmit={(e) => { e.preventDefault(); load(search); }} className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" />
          <input className="input-field pl-9" placeholder="Search medicines..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </form>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add Medicine
        </button>
      </div>

      <div className="card !p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : medicines.length === 0 ? (
          <EmptyState icon={Pill} title="No medicines found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink/40 border-b border-brand-100/60 bg-brand-50/40">
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Stock</th>
                  <th className="px-5 py-3 font-semibold">Price</th>
                  <th className="px-5 py-3 font-semibold">Expiry</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((m) => (
                  <tr key={m._id} className="border-b border-brand-100/40 last:border-0 hover:bg-brand-50/20">
                    <td className="px-5 py-3 font-medium text-ink">{m.name}</td>
                    <td className="px-5 py-3 text-ink/60">{m.category || "—"}</td>
                    <td className="px-5 py-3 text-ink/60">{m.stock} {m.unit}</td>
                    <td className="px-5 py-3 text-ink/60">₹{m.price}</td>
                    <td className="px-5 py-3 text-ink/60">{new Date(m.expiryDate).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {m.isExpired && <span className="badge bg-status-critical/10 text-status-critical">Expired</span>}
                        {!m.isExpired && m.isExpiringSoon && <span className="badge bg-status-warning/10 text-status-warning">Expiring soon</span>}
                        {m.isLowStock && <span className="badge bg-status-warning/10 text-status-warning">Low stock</span>}
                        {!m.isExpired && !m.isExpiringSoon && !m.isLowStock && <span className="badge bg-status-stable/10 text-status-stable">OK</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(m)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-brand-100 text-brand-600"><Pencil size={15} /></button>
                        <button onClick={() => handleDelete(m._id)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-status-critical/10 text-status-critical"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Medicine" : "Add Medicine"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label-text">Medicine name</label>
              <input required className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label-text">Category</label>
              <input className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div>
              <label className="label-text">Manufacturer</label>
              <input className="input-field" value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} />
            </div>
            <div>
              <label className="label-text">Stock quantity</label>
              <input required type="number" min="0" className="input-field" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </div>
            <div>
              <label className="label-text">Unit</label>
              <input className="input-field" placeholder="tablets / bottles / strips" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            </div>
            <div>
              <label className="label-text">Price (₹)</label>
              <input required type="number" min="0" step="0.01" className="input-field" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className="label-text">Expiry date</label>
              <input required type="date" className="input-field" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save Medicine"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Medicines;
