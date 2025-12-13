"use client";

import React from "react";
import { useLoading } from "@/src/libs/Hooks/LoadingContext";

export default function GlobalLoader() {
  const { isLoading, message } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[9999] flex items-center justify-center transition-all duration-300">
      <div className="flex flex-col items-center gap-6">
        {/* Industrial Spinner */}
        <div className="relative w-16 h-16">
          {/* Static Ring */}
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full opacity-30"></div>
          {/* Spinning Segment */}
          <div className="absolute inset-0 border-4 border-[#10b981] rounded-full border-t-transparent animate-spin"></div>
          {/* Inner Pulse */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Tech Text */}
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-gray-900 animate-pulse">
            {message || "Processing"}
          </span>
          <div className="h-0.5 w-12 bg-[#10b981]/30 rounded-full overflow-hidden">
            <div className="h-full w-full bg-[#10b981] animate-progress origin-left"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
