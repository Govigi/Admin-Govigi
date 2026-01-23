"use client";

import React, { useEffect, useState } from "react";
import { XMarkIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { SourcingUrl } from "@/src/libs/utils/API/endpoints";
import { useLoading } from "@/src/libs/Hooks/LoadingContext";
import { useUI } from "@/src/libs/Hooks/UIContext";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    selectedOrders: any[];
    onAssignSuccess: () => void;
}

export default function VendorAssignmentModal({ isOpen, onClose, selectedOrders, onAssignSuccess }: Props) {
    const [vendors, setVendors] = useState<any[]>([]);
    const [selectedVendorId, setSelectedVendorId] = useState<string>("");
    const { showLoader, hideLoader } = useLoading();
    const { showToast } = useUI();

    useEffect(() => {
        if (isOpen) {
            fetchVendors();
        }
    }, [isOpen]);

    const fetchVendors = async () => {
        try {
            // Pass orderIds to backend
            const orderIds = selectedOrders.map(o => o.id).join(',');

            // Extract Categories from Orders (for Smart Matching)
            // Flatten all products from all selected orders and get unique categories
            const categoriesSet = new Set<string>();
            selectedOrders.forEach(o => {
                (o.products || []).forEach((p: any) => {
                    if (p.category) categoriesSet.add(p.category);
                });
            });
            const categories = Array.from(categoriesSet).filter(Boolean).join(',');

            // Extract Location for Distance Calculation
            // We'll use the first order's location as the reference.
            // If missing (legacy data), fallback to Hyderabad center for demo purposes.
            let lat = "", lng = "";
            if (selectedOrders.length > 0 && selectedOrders[0].address?.location?.coordinates) {
                lng = String(selectedOrders[0].address.location.coordinates[0]);
                lat = String(selectedOrders[0].address.location.coordinates[1]);
            } else {
                // Default Demo Location (Hyderabad)
                lat = "17.4485";
                lng = "78.3741";
            }

            const query = `?orderIds=${orderIds}&categories=${encodeURIComponent(categories)}&lat=${lat}&lng=${lng}`;

            const res = await fetch(SourcingUrl.getNearbyVendors + query);
            const data = await res.json();

            if (Array.isArray(data)) {
                setVendors(data);
            }
        } catch (error) {
            console.error("Error fetching vendors:", error);
        }
    };

    const handleAssign = async () => {
        if (!selectedVendorId) {
            showToast("Please select a vendor.", "error");
            return;
        }

        try {
            showLoader("Assigning Orders...");
            const res = await fetch(SourcingUrl.assignOrders, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    vendorId: selectedVendorId,
                    orderIds: selectedOrders.map(o => o.id)
                })
            });

            if (res.ok) {
                showToast(`Assigned ${selectedOrders.length} orders successfully!`, "success");
                onAssignSuccess();
                onClose();
            } else {
                const err = await res.json();
                showToast(err.message || "Failed to assign orders.", "error");
            }
        } catch (error) {
            showToast("Error assigning orders.", "error");
        } finally {
            hideLoader();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-white/80 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative bg-white w-full max-w-2xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b-2 border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold font-mono uppercase tracking-widest text-black">
                            Assign Vendor
                        </h2>
                        <p className="text-xs text-gray-500 font-mono mt-1">
                            Assigning {selectedOrders.length} selected orders
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-black transition-colors"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {vendors.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 font-mono text-sm uppercase">
                            No active vendors found.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {vendors.map((vendor) => (
                                <div
                                    key={vendor._id}
                                    onClick={() => setSelectedVendorId(vendor._id)}
                                    className={`border-2 p-4 cursor-pointer transition-all ${selectedVendorId === vendor._id
                                        ? "border-[#10b981] bg-green-50"
                                        : "border-gray-200 hover:border-black"
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold uppercase font-mono text-sm">{vendor.businessName}</h3>

                                                {/* Smart Recommendations Tags */}
                                                {(vendor.recommendationTags || []).map((tag: string, idx: number) => {
                                                    let color = "bg-gray-100 text-gray-600";
                                                    if (tag.includes("Full")) color = "bg-green-100 text-green-700";
                                                    if (tag.includes("Partial")) color = "bg-yellow-100 text-yellow-700";
                                                    if (tag.includes("Mismatch")) color = "bg-red-100 text-red-700";
                                                    return (
                                                        <span key={idx} className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${color}`}>
                                                            {tag}
                                                        </span>
                                                    );
                                                })}

                                                {/* Distance Tag */}
                                                {vendor.distance !== null && vendor.distance !== undefined && (
                                                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                                                        {vendor.distance} km away
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1 text-gray-500">
                                                <MapPinIcon className="h-3 w-3" />
                                                <span className="text-xs font-mono truncate max-w-[300px]">
                                                    {vendor.address?.formattedAddress || "No Address"}
                                                </span>
                                            </div>
                                        </div>
                                        {selectedVendorId === vendor._id && (
                                            <span className="text-[10px] uppercase font-bold text-[#10b981] bg-white px-2 py-1 border border-[#10b981]">
                                                Selected
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t-2 border-gray-100 flex justify-end gap-3 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 border-2 border-transparent text-xs font-bold font-mono uppercase tracking-widest text-gray-500 hover:text-black hover:bg-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={!selectedVendorId}
                        className={`px-6 py-3 border-2 text-xs font-bold font-mono uppercase tracking-widest text-white transition-transform active:translate-y-0.5 ${selectedVendorId
                            ? "bg-black border-black hover:bg-gray-800"
                            : "bg-gray-300 border-gray-300 cursor-not-allowed"
                            }`}
                    >
                        Assign Vendor
                    </button>
                </div>
            </div>
        </div>
    );
}
