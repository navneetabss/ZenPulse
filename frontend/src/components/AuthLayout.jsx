import React from "react";
import { HeartPulse, ShieldCheck, Activity, Stethoscope } from "lucide-react";

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex bg-canvas">
      <div className="hidden lg:flex lg:w-[42%] bg-brand-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-700/40 blur-3xl" />
        <div className="absolute -left-16 bottom-10 h-56 w-56 rounded-full bg-brand-600/30 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-lg bg-brand-600 flex items-center justify-center">
            <HeartPulse size={20} />
          </div>
          <span className="font-display font-semibold text-lg">HealthCare Pro</span>
        </div>

        <div className="relative space-y-6">
          <h2 className="text-3xl font-display font-semibold leading-tight">
            One system, five roles, <br /> zero paperwork.
          </h2>
          <p className="text-brand-100/80 text-sm leading-relaxed max-w-sm">
            Admins, doctors, nurses, receptionists and patients — each gets a dashboard built for
            exactly what they need to do.
          </p>
          <div className="space-y-3 pt-2">
            {[
              { icon: Stethoscope, text: "Diagnosis & prescriptions in one place" },
              { icon: Activity, text: "Live vitals tracking on the ward board" },
              { icon: ShieldCheck, text: "Role-based access, end to end" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-brand-50/90">
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon size={15} />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-brand-200/60">
          &copy; {new Date().getFullYear()} HealthCare Pro. Smart Health Management System.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-brand-700 flex items-center justify-center text-white">
              <HeartPulse size={18} />
            </div>
            <span className="font-display font-semibold text-lg text-ink">HealthCare Pro</span>
          </div>
          <h1 className="text-2xl font-display font-semibold text-ink">{title}</h1>
          {subtitle && <p className="text-sm text-ink/50 mt-1.5 mb-7">{subtitle}</p>}
          {!subtitle && <div className="mb-7" />}
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
