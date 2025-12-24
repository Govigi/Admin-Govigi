"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
    ArrowLeftIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    CheckIcon,
    XMarkIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { OrderSummaryUrl, ProductManagementUrl, CategoryManagementUrl } from "@/src/libs/utils/API/endpoints";
import DataTable from "react-data-table-component";

const customStyles = {
    table: { style: { backgroundColor: "transparent" } },
    headRow: {
        style: {
            backgroundColor: "#f9fafb",
            borderBottomWidth: "1px",
            borderBottomColor: "#e5e7eb",
            minHeight: "40px",
        },
    },
    headCells: {
        style: {
            fontFamily: "monospace",
            fontSize: "11px",
            fontWeight: "bold",
            textTransform: "uppercase" as "uppercase",
            letterSpacing: "0.05em",
            color: "#6b7280",
            paddingLeft: "16px",
            paddingRight: "16px",
        },
    },
    rows: {
        style: {
            fontSize: "12px",
            fontFamily: "monospace",
            minHeight: "56px",
            borderBottomColor: "#f3f4f6",
            "&:hover": { backgroundColor: "#f9fafb" },
        },
    },
    cells: {
        style: {
            paddingLeft: "16px",
            paddingRight: "16px",
            color: "#111827",
        },
    },
    pagination: {
        style: {
            borderTopWidth: "1px",
            borderTopColor: "#e5e7eb",
            fontSize: "11px",
            fontFamily: "monospace",
            color: "#6b7280",
        },
    },
};

import { useUI } from "@/src/libs/Hooks/UIContext";

export default function BulkPricingPage() {
    const router = useRouter();
    const { showToast, showModal } = useUI();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    // Filters & Pagination
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [totalRows, setTotalRows] = useState(0);
    const [perPage, setPerPage] = useState(20); // Higher default for pricing
    const [currentPage, setCurrentPage] = useState(1);

    // Edit State
    // keys are product IDs. storing strings to allow empty inputs during typing.
    const [pricingState, setPricingState] = useState<Record<string, { base: string, commission: string }>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        setHasUnsavedChanges(Object.keys(pricingState).length > 0);
    }, [pricingState]);

    // Warn before leaving if changes exist
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasUnsavedChanges]);


    const fetchCategories = async () => {
        try {
            const res = await fetch(CategoryManagementUrl.getAllCategories);
            if (res.ok) {
                const data = await res.json();
                setCategories(Array.isArray(data) ? data : data.categories || []);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchProducts = async (page = 1, limit = 20) => {
        setLoading(true);
        try {
            // Note: Using existing getAllProducts which supports pagination
            const queryParams = new URLSearchParams({
                page: page.toString(),
                perPage: limit.toString(),
            });

            const res = await fetch(`${OrderSummaryUrl.getAllProducts}?${queryParams.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const json = await res.json();

            setProducts(json.products || []);
            setTotalRows(json.total || 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = "Bulk Pricing - Admin | Govigi";
        fetchProducts(currentPage, perPage);
        fetchCategories();
    }, []);

    const handlePageChange = (page: number) => {
        if (hasUnsavedChanges) {
            showModal(
                "Unsaved Changes",
                "You have unsaved changes. Discard them?",
                "confirm",
                () => {
                    setPricingState({});
                    setCurrentPage(page);
                    fetchProducts(page, perPage);
                }
            );
            return;
        }
        setCurrentPage(page);
        fetchProducts(page, perPage);
    };

    const handlePerRowsChange = async (newPerPage: number, page: number) => {
        if (hasUnsavedChanges) {
            showModal(
                "Unsaved Changes",
                "You have unsaved changes. Discard them?",
                "confirm",
                () => {
                    setPricingState({});
                    setPerPage(newPerPage);
                    setCurrentPage(page);
                    fetchProducts(page, newPerPage);
                }
            );
            return;
        }
        setPerPage(newPerPage);
        setCurrentPage(page);
        fetchProducts(page, newPerPage);
    };

    const handlePricingChange = (id: string, type: 'base' | 'commission', val: string, currentPrice: number) => {
        if (val === "" || /^\d*\.?\d*$/.test(val)) {
            setPricingState(prev => {
                const existing = prev[id] || { base: currentPrice.toString(), commission: "0" };
                return {
                    ...prev,
                    [id]: {
                        ...existing,
                        [type]: val
                    }
                };
            });
        }
    };

    const saveChanges = async () => {
        // Validation: reject empty or invalid strings
        const invalidKeys = Object.entries(pricingState).filter(([_, vals]) => {
            return vals.base === "" || isNaN(Number(vals.base)) || vals.commission === "" || isNaN(Number(vals.commission));
        });

        if (invalidKeys.length > 0) {
            showToast("Please fix invalid or empty price fields before saving.", "error");
            return;
        }

        setIsSaving(true);
        const updates = Object.entries(pricingState).map(([id, vals]) => {
            const base = Number(vals.base);
            const comm = Number(vals.commission);
            const finalPrice = base + (base * (comm / 100)); // Percentage Calculation

            const formData = new FormData();
            formData.append("pricePerKg", finalPrice.toString());
            return fetch(`${OrderSummaryUrl.updateProduct}/${id}`, {
                method: 'PATCH',
                body: formData
            });
        });

        try {
            await Promise.all(updates);
            setPricingState({});
            fetchProducts(currentPage, perPage); // Refresh to get unified state
            showToast("Prices updated successfully", "success");
        } catch (error) {
            console.error("Failed to save", error);
            showToast("Errors occurred during save.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    // Client-side filtering for current page (since backend filter not unified yet)
    // In a real bulk editor, backend filtering is crucial. Assuming current pagination constraint.
    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchCat = categoryFilter === "all" || p.category === categoryFilter || p.category?.name === categoryFilter; // Handle populated vs string
            return matchSearch && matchCat;
        });
    }, [products, searchQuery, categoryFilter]);

    const columns = useMemo(() => [
        {
            name: "Product Name",
            selector: (row: any) => row.name,
            sortable: true,
            cell: (row: any) => (
                <div className="flex flex-col py-1">
                    <span className="font-bold uppercase text-xs">{row.name}</span>
                    <span className="text-[10px] text-gray-400">{row.category}</span>
                </div>
            ),
            width: "250px"
        },
        {
            name: "Current",
            selector: (row: any) => row.pricePerKg,
            width: "100px",
            cell: (row: any) => (
                <span className="font-mono text-gray-400 text-xs">₹{row.pricePerKg}</span>
            )
        },
        {
            name: "Base Price",
            cell: (row: any) => {
                const isEdited = pricingState[row._id] !== undefined;
                const value = isEdited ? pricingState[row._id].base : row.pricePerKg;

                return (
                    <input
                        type="text"
                        inputMode="decimal"
                        value={value}
                        onChange={(e) => handlePricingChange(row._id, 'base', e.target.value, row.pricePerKg)}
                        className={`w-20 py-2 px-2 text-sm font-bold font-mono border transition-all outline-none
                            ${isEdited
                                ? 'bg-yellow-50 border-yellow-400 text-black'
                                : 'border-gray-200 focus:border-black focus:bg-gray-50'
                            }`}
                        placeholder="Base"
                    />
                )
            },
            width: "130px"
        },
        {
            name: "+ Comm. (%)",
            cell: (row: any) => {
                const isEdited = pricingState[row._id] !== undefined;
                const value = isEdited ? pricingState[row._id].commission : "0";

                return (
                    <input
                        type="text"
                        inputMode="decimal"
                        value={value}
                        onChange={(e) => handlePricingChange(row._id, 'commission', e.target.value, row.pricePerKg)}
                        className={`w-20 py-2 px-2 text-sm font-bold font-mono border transition-all outline-none
                            ${isEdited ? 'bg-blue-50 border-blue-400 text-black' : 'border-gray-200 focus:border-black focus:bg-gray-50'}`}
                        placeholder="0"
                    />
                )
            },
            width: "130px"
        },
        {
            name: "Final Price",
            cell: (row: any) => {
                // Calculate
                const state = pricingState[row._id];
                const base = state ? Number(state.base) : row.pricePerKg;
                const comm = state ? Number(state.commission) : 0;
                // Handle NaN during typing
                const final = isNaN(base) || isNaN(comm) ? "---" : (base + (base * (comm / 100)));
                const isEdited = pricingState[row._id] !== undefined;

                return (
                    <span className={`font-bold font-mono text-sm ${isEdited ? 'text-[#10b981]' : 'text-gray-400'}`}>
                        ₹{typeof final === 'number' ? final.toFixed(2) : final}
                    </span>
                )
            },
            width: "120px"
        },
        {
            name: "Diff",
            cell: (row: any) => {
                const state = pricingState[row._id];
                if (!state) return null;

                const base = Number(state.base);
                const comm = Number(state.commission);

                if (state.base === "" || state.commission === "" || isNaN(base) || isNaN(comm)) return null;

                const final = base + (base * (comm / 100));
                const diff = final - row.pricePerKg;
                if (diff === 0) return null;
                const isPositive = diff > 0;
                return (
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 ${isPositive ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {isPositive ? '+' : ''}{diff.toFixed(2)}
                    </span>
                )
            }
        }
    ], [pricingState]);

    return (
        <div className="min-h-screen bg-gray-50/50 pb-24 font-mono">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold uppercase tracking-widest text-[#10b981]">Bulk Pricing</h1>
                            <p className="text-xs text-gray-400">Quickly update product prices</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative group">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="SEARCH..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-gray-200 text-xs w-64 focus:outline-none focus:border-black transition-colors uppercase"
                            />
                        </div>
                        {/* Category Filter */}
                        <div className="relative">
                            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="pl-9 pr-8 py-2 border border-gray-200 text-xs w-48 focus:outline-none focus:border-black appearance-none bg-transparent uppercase cursor-pointer bg-white"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(c => (
                                    <option key={c._id} value={c.categoryName}>{c.categoryName}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8">
                <div className="border border-gray-200 bg-white shadow-sm">
                    <DataTable
                        columns={columns}
                        data={filteredProducts}
                        pagination
                        paginationServer
                        paginationTotalRows={totalRows}
                        onChangePage={handlePageChange}
                        onChangeRowsPerPage={handlePerRowsChange}
                        paginationPerPage={20}
                        paginationRowsPerPageOptions={[20, 50, 100]}
                        customStyles={customStyles}
                        highlightOnHover
                    />
                </div>
            </div>

            {/* Sticky Save Bar */}
            {hasUnsavedChanges && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-8 py-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-8 rounded-none z-50 w-[90%] md:w-auto border border-gray-800 animate-in slide-in-from-bottom-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <ExclamationTriangleIcon className="w-3 h-3 text-yellow-400" />
                            Unsaved Changes
                        </span>
                        <span className="font-bold font-mono text-lg">{Object.keys(pricingState).length} Updates Ready</span>
                    </div>

                    <div className="h-10 w-px bg-gray-800"></div>

                    <button
                        onClick={saveChanges}
                        disabled={isSaving}
                        className="bg-[#10b981] text-white px-8 py-3 font-bold uppercase text-xs hover:bg-emerald-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? "Saving..." : "Save All Changes"}
                        {!isSaving && <CheckIcon className="w-4 h-4" />}
                    </button>

                    <button
                        onClick={() => {
                            showModal(
                                "Discard Changes?",
                                "This will revert all unsaved price updates. Are you sure?",
                                "confirm",
                                () => setPricingState({})
                            );
                        }}
                        disabled={isSaving}
                        className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
    );
}
