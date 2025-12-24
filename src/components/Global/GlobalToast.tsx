"use client";

import React from "react";
import { useUI } from "@/src/libs/Hooks/UIContext";
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function GlobalToast() {
    const { toast, hideToast } = useUI();

    if (!toast.isVisible) return null;

    const icons = {
        success: <CheckCircleIcon className="h-5 w-5 text-green-600" />,
        error: <XCircleIcon className="h-5 w-5 text-red-600" />,
        info: <InformationCircleIcon className="h-5 w-5 text-blue-600" />,
        warning: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />,
    };

    const borders = {
        success: "border-green-600",
        error: "border-red-600",
        info: "border-blue-600",
        warning: "border-yellow-600",
    };

    const bgs = {
        success: "bg-green-50",
        error: "bg-red-50",
        info: "bg-blue-50",
        warning: "bg-yellow-50"
    };

    return (
        <div className="fixed top-6 right-6 z-[110] animate-in slide-in-from-right duration-300">
            <div className={`flex items-center gap-3 px-4 py-3 bg-white border-l-4 shadow-[4px_4px_10px_0px_rgba(0,0,0,0.1)] min-w-[300px] max-w-md ${borders[toast.type]}`}>
                <div className={`p-1 rounded-full ${bgs[toast.type]}`}>
                    {icons[toast.type]}
                </div>

                <div className="flex-1">
                    <p className="text-xs font-bold font-mono uppercase tracking-widest text-black">
                        {toast.type}
                    </p>
                    <p className="text-xs font-mono text-gray-600 mt-0.5">
                        {toast.message}
                    </p>
                </div>

                <button
                    onClick={hideToast}
                    className="text-gray-400 hover:text-black transition-colors"
                >
                    <XMarkIcon className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
