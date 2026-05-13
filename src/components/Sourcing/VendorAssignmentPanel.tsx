import React, { useState, useEffect } from "react";
import { XMarkIcon, MapPinIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { SourcingUrl } from "@/src/libs/utils/API/endpoints";
import { useLoading } from "@/src/libs/Hooks/LoadingContext";
import { useUI } from "@/src/libs/Hooks/UIContext";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    selectedOrders: any[];
    onAssignSuccess: () => void;
}

export default function VendorAssignmentPanel({ isOpen, onClose, selectedOrders, onAssignSuccess }: Props) {
    const [vendors, setVendors] = useState<any[]>([]);

    // State: Map Category -> Selected Vendor ID
    const [assignments, setAssignments] = useState<Record<string, string>>({});

    const [categoriesToSource, setCategoriesToSource] = useState<string[]>([]);

    const { showLoader, hideLoader } = useLoading();
    const { showToast } = useUI();

    useEffect(() => {
        if (isOpen && selectedOrders.length > 0) {
            // 1. Extract Categories
            const categoriesSet = new Set<string>();
            selectedOrders.forEach(o => {
                (o.products || []).forEach((p: any) => {
                    // Assuming 'category' is available in product object
                    if (p.category) categoriesSet.add(p.category);
                });

                // Also check items array if products is empty (depending on data structure)
                if (o.items) {
                    o.items.forEach((i: any) => {
                        if (i.category) categoriesSet.add(i.category);
                    });
                }
            });
            const cats = Array.from(categoriesSet).filter(Boolean);
            setCategoriesToSource(cats);

            // Initialize assignments map (empty)
            setAssignments({});

            // Fetch Vendors (Once)
            fetchVendors(cats);
        }
    }, [isOpen, selectedOrders]);

    const fetchVendors = async (cats: string[]) => {
        try {
            const token = localStorage.getItem("admin_token");
            const orderIds = selectedOrders.map(o => o.id).join(',');
            const catString = cats.join(',');

            let lat = "17.4485", lng = "78.3741";
            if (selectedOrders.length > 0 && selectedOrders[0].address?.location?.coordinates) {
                lng = String(selectedOrders[0].address.location.coordinates[0]);
                lat = String(selectedOrders[0].address.location.coordinates[1]);
            }

            const query = `?orderIds=${orderIds}&categories=${encodeURIComponent(catString)}&lat=${lat}&lng=${lng}`;
            const res = await fetch(SourcingUrl.getNearbyVendors + query, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();

            if (Array.isArray(data)) {
                setVendors(data);
            }
        } catch (error) {
            console.error("Error fetching vendors:", error);
        }
    };

    const handleSelectVendor = (category: string, vendorId: string) => {
        setAssignments(prev => ({
            ...prev,
            [category]: vendorId
        }));
    };

    const handleConfirmAssignments = async () => {
        const assignedCategories = Object.keys(assignments);
        if (assignedCategories.length === 0) {
            showToast("Please assign at least one category.", "error");
            return;
        }

        try {
            showLoader("Processing Assignments...");
            const token = localStorage.getItem("admin_token");

            const results = await Promise.all(
                Object.entries(assignments).map(async ([category, vendorId]) => {
                    const res = await fetch(SourcingUrl.assignOrders, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            vendorId,
                            orderIds: selectedOrders.map(o => o.id),
                            categories: [category]
                        })
                    });
                    return { category, ok: res.ok, data: await res.json() };
                })
            );

            const failed = results.filter(r => !r.ok);
            if (failed.length === 0) {
                showToast(`Successfully assigned all categories!`, "success");
                onAssignSuccess();
                onClose();
            } else {
                const failedNames = failed.map(f => f.category).join(", ");
                showToast(`Failed to assign: ${failedNames}. Please try again.`, "error");
            }
        } catch (error) {
            showToast("Error assigning orders.", "error");
        } finally {
            hideLoader();
        }
    };

    return (
        <div
            className={`flex flex-col bg-white transition-all duration-300 ease-in-out fixed top-0 right-0 h-screen shadow-2xl z-[70] border-l border-gray-100 ${isOpen ? "w-2/3 md:w-1/2 lg:w-2/5 translate-x-0" : "w-0 translate-x-full opacity-0"}`}
        >
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-gray-900">
                        Assign Vendors
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Select the best vendor for each category.
                    </p>
                </div>
                <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50 space-y-8">
                {categoriesToSource.map(category => {
                    // Strict Filtering: Only show vendors that support this category (Case Insensitive)
                    const relevantVendors = vendors.filter(v =>
                        v.supportedCategories?.some((c: string) => c.toLowerCase() === category.toLowerCase())
                    );

                    return (
                        <div key={category} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Category Header */}
                            <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 uppercase tracking-wider text-sm">
                                    {category}
                                </h3>
                                {assignments[category] ? (
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                                        <CheckCircleIcon className="w-4 h-4" />
                                        Vendor Selected
                                    </span>
                                ) : (
                                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                                        Pending Selection
                                    </span>
                                )}
                            </div>

                            {/* Vendors List */}
                            <div className="p-4 space-y-3">
                                {relevantVendors.length === 0 ? (
                                    <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            No vendors found for {category}
                                        </p>
                                    </div>
                                ) : (
                                    relevantVendors.map(vendor => {
                                        const isSelected = assignments[category] === vendor._id;

                                        return (
                                            <div
                                                key={vendor._id}
                                                onClick={() => handleSelectVendor(category, vendor._id)}
                                                className={`relative flex items-center p-4 rounded-xl border transition-all cursor-pointer group ${isSelected
                                                        ? "border-black bg-gray-900 text-white shadow-lg scale-[1.01]"
                                                        : "border-gray-100 bg-white hover:border-gray-300 hover:shadow-md"
                                                    }`}
                                            >
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className={`font-bold ${isSelected ? "text-white" : "text-gray-900"}`}>
                                                            {vendor.businessName}
                                                        </h4>
                                                        {vendor.distance && (
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700"
                                                                }`}>
                                                                {vendor.distance} km
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs opacity-80">
                                                        <MapPinIcon className="w-3.5 h-3.5" />
                                                        <span className="truncate max-w-[250px]">{vendor.address?.formattedAddress}</span>
                                                    </div>
                                                </div>

                                                {/* Selection Circle */}
                                                <div className={`ml-4 w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-white bg-white" : "border-gray-300 group-hover:border-gray-400"
                                                    }`}>
                                                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center mb-4 text-sm font-medium">
                    <span className="text-gray-500">Categories Assigned:</span>
                    <span className="text-gray-900">{Object.keys(assignments).length} / {categoriesToSource.length}</span>
                </div>
                <button
                    onClick={handleConfirmAssignments}
                    disabled={Object.keys(assignments).length === 0}
                    className={`nav-btn w-full py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${Object.keys(assignments).length > 0
                        ? "bg-black text-white hover:bg-gray-800 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                >
                    Confirm Assignments
                </button>
            </div>
        </div>
    );
}
