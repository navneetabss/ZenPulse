import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Bell, CheckCheck, Trash2, AlertCircle, CheckCircle2, Info, CalendarClock } from "lucide-react";
import api from "../../api/axios";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

const TYPE_STYLES = {
  reminder: { icon: CalendarClock, class: "bg-status-info/10 text-status-info" },
  success: { icon: CheckCircle2, class: "bg-status-stable/10 text-status-stable" },
  error: { icon: AlertCircle, class: "bg-status-critical/10 text-status-critical" },
  info: { icon: Info, class: "bg-brand-50 text-brand-700" },
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications);
    } catch (err) {
      toast.error("Could not load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch {
      toast.error("Could not update notification");
    }
  };

  const markAllRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All marked as read");
    } catch {
      toast.error("Could not update notifications");
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch {
      toast.error("Could not delete notification");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-ink/50">{notifications.filter((n) => !n.isRead).length} unread</p>
        {notifications.length > 0 && (
          <button onClick={markAllRead} className="btn-secondary !py-2 !px-3 text-xs">
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card">
          <EmptyState icon={Bell} title="No notifications yet" message="Appointment reminders and alerts will show up here." />
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => {
            const style = TYPE_STYLES[n.type] || TYPE_STYLES.info;
            const Icon = style.icon;
            return (
              <div
                key={n._id}
                className={`card flex items-start gap-3.5 !py-4 ${!n.isRead ? "border-brand-300 bg-brand-50/30" : ""}`}
              >
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${style.class}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink">{n.title}</p>
                  <p className="text-sm text-ink/60 mt-0.5">{n.message}</p>
                  <p className="text-xs text-ink/35 mt-1.5">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!n.isRead && (
                    <button
                      onClick={() => markRead(n._id)}
                      className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-brand-100 text-brand-600"
                      title="Mark as read"
                    >
                      <CheckCheck size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => remove(n._id)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-status-critical/10 text-status-critical"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
