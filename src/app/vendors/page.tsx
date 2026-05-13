"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import DataTable from "react-data-table-component";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { 
    PlusCircleIcon, 
    MagnifyingGlassIcon,
    ArrowDownIcon,
    EllipsisHorizontalIcon,
    FunnelIcon
} from "@heroicons/react/24/outline";
import { getVendors, deleteVendor, updateVendor } from "../../libs/vendorService";

interface Vendor {
    _id: string;
    businessName: string;
    contactPerson: string;
    phone: string;
    email: string;
    isActive: boolean;
    isVerified: boolean;
    supportedCategories: string[];
    address?: { formattedAddress: string };
}

// Custom Styles matching Product Management (with Poppins override)
const customStyles = {
    table: {
        style: {
            backgroundColor: "transparent",
        },
    },
    headRow: {
        style: {
            backgroundColor: "#f9fafb", // gray-50
            borderBottomWidth: "1px",
            borderBottomColor: "#e5e7eb", // gray-200
            minHeight: "40px",
        },
    },
    headCells: {
        style: {
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: "11px",
            fontWeight: "bold",
            textTransform: "uppercase" as const,
            letterSpacing: "0.05em",
            color: "#6b7280",
            paddingLeft: "16px",
            paddingRight: "16px",
        },
    },
    rows: {
        style: {
            fontSize: "12px",
            fontFamily: "var(--font-inter), sans-serif",
            minHeight: "56px",
            borderBottomColor: "#f3f4f6", // gray-100
            "&:hover": {
                backgroundColor: "#f9fafb",
            },
            cursor: "pointer",
        },
    },
    cells: {
        style: {
            paddingLeft: "16px",
            paddingRight: "16px",
            color: "#111827", // gray-900
        },
    },
    pagination: {
        style: {
            borderTopWidth: "1px",
            borderTopColor: "#e5e7eb",
            fontSize: "11px",
            fontFamily: "var(--font-inter), sans-serif",
            color: "#6b7280",
        },
    },
};

// Portal-based Actions Menu (Product Management Style)
function ActionsMenu({ row, onRefresh }: { row: Vendor, onRefresh: () => void }) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const iconRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (open && iconRef.current) {
            const rect = iconRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY + 6,
                left: rect.left + window.scrollX - 100,
            });
        }
    }, [open]);

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (
                (iconRef.current && iconRef.current.contains(event.target)) ||
                (dropdownRef.current && dropdownRef.current.contains(event.target))
            ) {
                return;
            }
            setOpen(false);
        };
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const handleApprove = async () => {
        if (confirm("Approve this vendor profile?")) {
            try {
                await updateVendor(row._id, { isVerified: true, isActive: true });
                onRefresh();
            } catch (error) {
                console.error("Failed to approve vendor", error);
            }
        }
        setOpen(false);
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this vendor?")) {
            try {
                await deleteVendor(row._id);
                onRefresh();
            } catch (error) {
                console.error("Failed to delete vendor", error);
            }
        }
        setOpen(false);
    };

    const Dropdown = (
        <div
            ref={dropdownRef}
            className="fixed w-36 text-gray-700 bg-white border border-gray-200 shadow-xl z-9999 font-inter text-[10px] uppercase font-bold tracking-widest"
            style={{ top: position.top, left: position.left }}
        >
            {!row.isVerified && (
                <button
                    className="block w-full text-left px-4 py-3 hover:bg-emerald-50 text-emerald-600 border-b border-gray-100"
                    onClick={handleApprove}
                >
                    Approve
                </button>
            )}
            <button
                className="block w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
                onClick={() => { router.push(`/vendors/input?id=${row._id}&mode=view`); setOpen(false); }}
            >
                View
            </button>
            <button
                className="block w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
                onClick={() => { router.push(`/vendors/input?id=${row._id}`); setOpen(false); }}
            >
                Edit
            </button>
            <button
                className="block w-full text-left px-4 py-3 hover:bg-red-50 text-red-600"
                onClick={handleDelete}
            >
                Delete
            </button>
        </div>
    );

    return (
        <div className="relative inline-block" ref={iconRef}>
            <EllipsisHorizontalIcon
                className="h-5 w-5 text-gray-400 hover:text-black cursor-pointer"
                onClick={() => setOpen((prev) => !prev)}
            />
            {open && createPortal(Dropdown, document.body)}
        </div>
    );
}

export default function VendorListPage() {
    const router = useRouter();
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const data = await getVendors();
            setVendors(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch vendors", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredVendors = useMemo(() => {
        return vendors.filter(v => {
            const matchesSearch = 
                v.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.phone.includes(searchQuery);
            
            if (statusFilter === "pending") return matchesSearch && !v.isVerified;
            if (statusFilter === "active") return matchesSearch && v.isActive && v.isVerified;
            if (statusFilter === "inactive") return matchesSearch && !v.isActive && v.isVerified;
            return matchesSearch;
        });
    }, [vendors, searchQuery, statusFilter]);

    // Stats
    const stats = useMemo(() => [
        { label: "TOTAL VENDORS", value: vendors.length },
        { label: "PENDING APPROVAL", value: vendors.filter(v => !v.isVerified).length },
        { label: "ACTIVE PARTNERS", value: vendors.filter(v => v.isActive && v.isVerified).length },
    ], [vendors]);

    // DataTable Columns
    const columns = [
        {
            name: "Business",
            selector: (row: Vendor) => row.businessName,
            sortable: true,
            cell: (row: Vendor) => (
                <div className="flex flex-col py-2">
                    <span className="font-bold uppercase tracking-tight">{row.businessName}</span>
                    <span className="text-[10px] text-gray-400 line-clamp-1 uppercase">{row.address?.formattedAddress || 'No Address'}</span>
                </div>
            ),
            width: "250px",
        },
        {
            name: "Owner / Contact",
            selector: (row: Vendor) => row.contactPerson,
            sortable: true,
            cell: (row: Vendor) => (
                <div className="flex flex-col">
                    <span className="font-bold uppercase text-[11px]">{row.contactPerson}</span>
                    <span className="text-[10px] text-gray-500 uppercase">{row.email} | {row.phone}</span>
                </div>
            ),
        },
        {
            name: "Service Range",
            selector: (row: Vendor) => row.supportedCategories?.join(", ") || "",
            sortable: true,
            cell: (row: Vendor) => (
                <div className="flex gap-1 flex-wrap">
                    {row.supportedCategories?.slice(0, 2).map((cat, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-50 text-[9px] font-bold border border-gray-100 rounded uppercase">
                            {cat}
                        </span>
                    ))}
                    {row.supportedCategories?.length > 2 && (
                        <span className="text-[9px] font-bold text-gray-300">+{row.supportedCategories.length - 2}</span>
                    )}
                </div>
            ),
        },
        {
            name: "Status",
            selector: (row: Vendor) => row.isVerified,
            sortable: true,
            cell: (row: Vendor) => (
                <span
                    className={`border py-0.5 px-2 text-[10px] uppercase font-bold tracking-wide ${
                        !row.isVerified
                        ? "border-amber-200 text-amber-700 bg-amber-50"
                        : row.isActive
                        ? "border-green-200 text-green-700 bg-green-50"
                        : "border-gray-200 text-gray-400 bg-gray-50"
                    }`}
                >
                    {!row.isVerified ? "Pending" : row.isActive ? "Active" : "Inactive"}
                </span>
            ),
            width: "120px",
        },
        {
            name: "Actions",
            cell: (row: Vendor) => <ActionsMenu row={row} onRefresh={fetchVendors} />,
            ignoreRowClick: true,
            width: "80px",
        },
    ];

    return (
        <div className="min-h-screen bg-white p-6 md:p-8 font-inter text-gray-900 w-full overflow-x-hidden">
            {/* Stats Bar */}
            <div className="flex items-center gap-8 py-4 border-b border-gray-200 mb-8 overflow-x-auto scrollbar-hide">
                {stats.map((stat, index) => (
                    <div 
                        key={index} 
                        className="shrink-0 cursor-pointer hover:opacity-70 transition-opacity"
                        onClick={() => {
                            if (stat.label === "PENDING APPROVAL") setStatusFilter("pending");
                            else if (stat.label === "ACTIVE PARTNERS") setStatusFilter("active");
                            else setStatusFilter("all");
                        }}
                    >
                        <div className="text-[10px] text-gray-400 tracking-widest font-bold uppercase">{stat.label}</div>
                        <div className="text-xl font-bold text-gray-900 mt-0.5">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="mb-6 pb-4 border-b border-gray-200 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold uppercase tracking-widest text-[#10b981]">
                            Vendor Management
                        </h1>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Manage your partner network</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                    {/* Search Bar */}
                    <div className="relative group flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH VENDORS, OWNERS, PHONES..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 text-xs w-full focus:outline-none focus:border-black transition-colors uppercase placeholder-gray-300 rounded-none shadow-none"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative md:w-56">
                        <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-9 pr-8 py-2 border border-gray-200 text-xs w-full focus:outline-none focus:border-black appearance-none bg-transparent uppercase cursor-pointer rounded-none"
                        >
                            <option value="all">Status: All Records</option>
                            <option value="pending">Awaiting Approval</option>
                            <option value="active">Active Members</option>
                            <option value="inactive">Inactive Members</option>
                        </select>
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={() => router.push("/vendors/input")}
                        className="bg-black text-white hover:bg-[#10b981] text-xs px-6 py-2 uppercase tracking-widest flex items-center justify-center gap-2 transition-all rounded-none"
                    >
                        <PlusCircleIcon className="w-4 h-4" />
                        Add Vendor
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div className="border border-gray-200 relative overflow-hidden bg-white w-full">
                <DataTable
                    columns={columns}
                    data={filteredVendors}
                    progressPending={loading}
                    progressComponent={
                        <div className="py-20 text-gray-400 text-xs uppercase tracking-widest animate-pulse flex flex-col items-center gap-3">
                            <div className="w-5 h-5 border-2 border-gray-100 border-t-[#10b981] rounded-full animate-spin"></div>
                            Loading vendor data...
                        </div>
                    }
                    pagination
                    paginationPerPage={10}
                    highlightOnHover
                    pointerOnHover
                    responsive
                    customStyles={customStyles}
                    sortIcon={<ArrowDownIcon className="ml-1 w-3 h-3 text-gray-400" />}
                />
            </div>
        </div>
    );
}
