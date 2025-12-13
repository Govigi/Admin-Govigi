"use client";

import React from "react";
import { useUI } from "@/src/libs/Hooks/UIContext";
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

export default function GlobalModal() {
    const { modal, closeModal } = useUI();

    if (!modal.isOpen) return null;

    const handleConfirm = () => {
        if (modal.onConfirm) modal.onConfirm();
        closeModal();
    };

    const handleCancel = () => {
        if (modal.onCancel) modal.onCancel();
        closeModal();
    };

    const isDelete = modal.type === "delete";
    const icon = isDelete ? (
        <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
    ) : modal.type === "confirm" ? (
        <InformationCircleIcon className="h-8 w-8 text-blue-500" />
    ) : (
        <InformationCircleIcon className="h-8 w-8 text-gray-500" />
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-white/80 backdrop-blur-sm transition-opacity"
                onClick={handleCancel}
            ></div>

            {/* Modal */}
            <div className={`relative bg-white w-full max-w-md p-6 border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] animate-in fade-in zoom-in-95 duration-200 ${isDelete ? "border-red-500" : "border-black"
                }`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {icon}
                        <h2 className={`text-lg font-bold font-mono uppercase tracking-widest ${isDelete ? "text-red-600" : "text-black"
                            }`}>
                            {modal.title}
                        </h2>
                    </div>
                    <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-black transition-colors"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="mb-8">
                    <p className="text-sm font-mono text-gray-600 leading-relaxed uppercase">
                        {modal.message}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    {modal.type !== "info" && (
                        <button
                            onClick={handleCancel}
                            className="px-6 py-2 border-2 border-transparent text-xs font-bold font-mono uppercase tracking-widest text-gray-500 hover:text-black hover:bg-gray-50 transition-colors"
                        >
                            {modal.cancelText || "Cancel"}
                        </button>
                    )}
                    <button
                        onClick={handleConfirm}
                        className={`px-6 py-2 border-2 text-xs font-bold font-mono uppercase tracking-widest text-white shadow-sm transition-transform active:translate-y-0.5 ${isDelete
                                ? "bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600"
                                : "bg-black border-black hover:bg-gray-800 hover:border-gray-800"
                            }`}
                    >
                        {modal.confirmText || "Confirm"}
                    </button>
                </div>
            </div>
        </div>
    );
}
