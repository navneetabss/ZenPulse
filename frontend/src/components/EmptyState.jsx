import React from "react";
import { Inbox } from "lucide-react";

const EmptyState = ({ icon: Icon = Inbox, title = "Nothing here yet", message }) => (
  <div className="flex flex-col items-center justify-center text-center py-14 px-4">
    <div className="h-12 w-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
      <Icon size={22} />
    </div>
    <p className="font-display font-semibold text-ink">{title}</p>
    {message && <p className="text-sm text-ink/50 mt-1 max-w-sm">{message}</p>}
  </div>
);

export default EmptyState;
