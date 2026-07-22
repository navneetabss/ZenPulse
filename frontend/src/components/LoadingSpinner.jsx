import React from "react";

const LoadingSpinner = ({ fullScreen, label = "Loading, please wait..." }) => {  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className="h-9 w-9 rounded-full border-[3px] border-brand-100 border-t-brand-600 animate-spin" />
      <span className="text-sm text-ink/50 font-medium">{label}</span>
    </div>
  );

  if (fullScreen) {
    return <div className="min-h-screen w-full flex items-center justify-center bg-canvas">{spinner}</div>;
  }
  return <div className="flex items-center justify-center py-16">{spinner}</div>;
};

export default LoadingSpinner;
