"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { OrderSummaryUrl, CategoryManagementUrl } from "../../libs/utils/API/endpoints";
import { useLoading } from "@/src/libs/Hooks/LoadingContext";

interface BulkUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedCount: number;
    selectedIds: string[];
    onSuccess: () => void;
}

export default function BulkUpdateModal({ isOpen, onClose, selectedCount, selectedIds, onSuccess }: BulkUpdateModalProps) {
    const [field, setField] = useState("status");
    const [value, setValue] = useState("");
    const [categories, setCategories] = useState<any[]>([]);
    const { showLoader, hideLoader } = useLoading();

    useEffect(() => {
        if (isOpen && field === "category" && categories.length === 0) {
            fetchCategories();
        }
    }, [isOpen, field]);

    const fetchCategories = async () => {
        try {
            const res = await fetch(CategoryManagementUrl.getAllCategories);
            if (res.ok) {
                const data = await res.json();
                const catList = Array.isArray(data) ? data : (data.categories || []);
                setCategories(catList);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const handleSubmit = async () => {
        if (!value) return;

        showLoader(`Updating ${selectedCount} products...`);
        try {
            const updates: any = {};
            updates[field] = value;

            const res = await fetch(OrderSummaryUrl.bulkUpdateProducts, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    productIds: selectedIds,
                    updates: updates
                }),
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                console.error("Bulk update failed");
                alert("Failed to update products");
            }
        } catch (error) {
            console.error("Bulk update error", error);
        } finally {
            hideLoader();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-md p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 hover:bg-gray-100 transition-colors"
                >
                    <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>

                <div className="mb-6">
                    <h2 className="text-lg font-bold uppercase tracking-widest text-[#10b981]">
                        Bulk Update
                    </h2>
                    <p className="text-xs text-gray-400 mt-1 font-mono">
                        Updating {selectedCount} selected products
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5 font-mono">
                            Field to Update
                        </label>
                        <select
                            value={field}
                            onChange={(e) => {
                                setField(e.target.value);
                                setValue(""); // Reset value on field change
                            }}
                            className="w-full border-b border-gray-300 bg-transparent py-2 text-sm font-mono uppercase focus:border-black focus:outline-none"
                        >
                            <option value="status">Status</option>
                            <option value="category">Category</option>
                            <option value="stock">Stock Status</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1.5 font-mono">
                            New Value
                        </label>

                        {field === "status" && (
                            <select
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className="w-full border-b border-gray-300 bg-transparent py-2 text-sm font-mono uppercase focus:border-black focus:outline-none"
                            >
                                <option value="">-- Select Status --</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        )}

                        {field === "category" && (
                            <select
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className="w-full border-b border-gray-300 bg-transparent py-2 text-sm font-mono uppercase focus:border-black focus:outline-none"
                            >
                                <option value="">-- Select Category --</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat.categoryName}>
                                        {cat.categoryName.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        )}

                        {field === "stock" && (
                            <select
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className="w-full border-b border-gray-300 bg-transparent py-2 text-sm font-mono uppercase focus:border-black focus:outline-none"
                            >
                                <option value="">-- Select Stock Status --</option>
                                <option value="Available">Available</option>
                                <option value="Out of Stock">Out of Stock</option>
                            </select>
                        )}
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!value}
                        className="bg-black text-white px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-[#10b981] disabled:opacity-50 disabled:hover:bg-black transition-colors"
                    >
                        Update Products
                    </button>
                </div>
            </div>
        </div>
    );
}
