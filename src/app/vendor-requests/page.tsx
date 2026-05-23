"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { VendorUrl, CategoryManagementUrl } from "@/src/libs/utils/API/endpoints";
import { 
    MagnifyingGlassIcon, 
    FunnelIcon,
    CheckIcon,
    XMarkIcon,
    EyeIcon,
    ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline";

export default function AdminVendorRequests() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    const { data: requests = [], isLoading } = useQuery({
        queryKey: ["vendorProductRequests"],
        queryFn: async () => {
            const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
            const { data } = await axios.get(VendorUrl.getAllVendorProductRequests, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data;
        },
    });

    const { data: categories = [] } = useQuery<any[]>({
        queryKey: ["categories"],
        queryFn: async () => {
            const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
            const { data } = await axios.get(CategoryManagementUrl.getAllCategories, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return Array.isArray(data) ? data : data.categories || [];
        }
    });

    const mutation = useMutation({
        mutationFn: async ({ id, status, notes, category }: { id: string, status: string, notes: string, category?: string }) => {
            const token = localStorage.getItem("token") || localStorage.getItem("admin_token");
            const endpoint = status === 'Approved'
                ? VendorUrl.approveVendorProductRequest(id)
                : VendorUrl.rejectVendorProductRequest(id);

            await axios.patch(endpoint, { adminNotes: notes, category }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vendorProductRequests"] });
            setSelectedRequest(null);
            setAdminNotes("");
            setSelectedCategory("");
        }
    });

    const filteredRequests = requests.filter((req: any) => {
        const matchesSearch =
            req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.vendorId?.businessName?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || req.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleAction = (status: string) => {
        if (!selectedRequest) return;
        if (status === 'Approved' && !selectedCategory) {
            alert("Please assign a valid product category before approving.");
            return;
        }
        mutation.mutate({ 
            id: selectedRequest._id, 
            status, 
            notes: adminNotes,
            category: status === 'Approved' ? selectedCategory : undefined
        });
    };

    return (
        <div className="min-h-screen bg-white p-6 md:p-8 font-inter text-gray-900 w-full overflow-x-hidden">
            {/* Header */}
            <div className="mb-6 pb-4 border-b border-gray-200 flex flex-col gap-4">
                <div>
                    <h1 className="text-xl font-bold uppercase tracking-widest text-[#10b981]">
                        Vendor Submissions
                    </h1>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Review products requested by vendors</p>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative group flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH BY PRODUCT OR VENDOR..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 text-xs w-full focus:outline-none focus:border-black transition-colors uppercase placeholder-gray-300 rounded-none"
                        />
                    </div>
                    <div className="relative md:w-56">
                        <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-9 pr-8 py-2 border border-gray-200 text-xs w-full focus:outline-none focus:border-black appearance-none bg-transparent uppercase cursor-pointer rounded-none"
                        >
                            <option value="all">Status: All</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="border border-gray-200 overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 uppercase tracking-wider border-b border-gray-200 font-bold text-gray-500">
                            <tr>
                                <th className="px-6 py-4">Vendor</th>
                                <th className="px-6 py-4">Product Details</th>
                                <th className="px-6 py-4">Price/Stock</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400 uppercase tracking-widest animate-pulse">Loading Submissions...</td></tr>
                            ) : filteredRequests.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400 uppercase tracking-widest">No vendor requests found</td></tr>
                            ) : (
                                filteredRequests.map((req: any) => (
                                    <tr key={req._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold uppercase text-gray-900">{req.vendorId?.businessName}</span>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-tight">{req.vendorId?.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 shrink-0 overflow-hidden border border-gray-100">
                                                    {req.image?.url && <img src={req.image.url} className="w-full h-full object-cover" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold uppercase text-gray-900">{req.name}</span>
                                                    <span className="text-[10px] text-[#10b981] font-bold uppercase">{req.category}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">₹{req.pricePerKg} / {req.unit}</span>
                                                <span className="text-[10px] text-gray-400 uppercase">Stock: {req.stock}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border ${
                                                req.status === 'Approved' ? 'border-green-200 text-green-700 bg-green-50' :
                                                req.status === 'Rejected' ? 'border-red-200 text-red-700 bg-red-50' :
                                                'border-amber-200 text-amber-700 bg-amber-50'
                                            }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => {
                                                    setSelectedRequest(req);
                                                    setAdminNotes(req.adminNotes || "");
                                                    // Prefill selectedCategory based on request category name match
                                                    const matchedCat = categories.find((c: any) => 
                                                        c._id === req.category || 
                                                        String(c.categoryName || "").toLowerCase() === String(req.category || "").toLowerCase()
                                                     );
                                                     setSelectedCategory(matchedCat?._id || "");
                                                 }}
                                                 className="text-gray-400 hover:text-black transition-colors"
                                             >
                                                 <EyeIcon className="w-5 h-5" />
                                             </button>
                                         </td>
                                     </tr>
                                 ))
                             )}
                         </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-2xl rounded-none shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#10b981]">Submission Review</h2>
                            <button onClick={() => setSelectedRequest(null)}><XMarkIcon className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <div className="p-8 overflow-y-auto space-y-8">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="w-full md:w-48 aspect-square bg-gray-50 border border-gray-100 overflow-hidden">
                                    {selectedRequest.image?.url ? (
                                        <img src={selectedRequest.image.url} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-200 font-bold text-[10px] uppercase">No Image</div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Product Identity</label>
                                        <h3 className="text-xl font-bold uppercase tracking-tight text-gray-900">{selectedRequest.name}</h3>
                                        <span className="text-[10px] font-bold text-[#10b981] uppercase">{selectedRequest.category}</span>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Description</label>
                                        <p className="text-xs text-gray-600 leading-relaxed italic">{selectedRequest.description || "NO DESCRIPTION PROVIDED"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 py-6 border-t border-b border-gray-50">
                                <div>
                                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Price Point</label>
                                    <p className="text-lg font-bold text-gray-900">₹{selectedRequest.pricePerKg} / {selectedRequest.unit}</p>
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Initial Stock</label>
                                    <p className="text-lg font-bold text-gray-900">{selectedRequest.stock} {selectedRequest.unit.toUpperCase()}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Assign Category <span className="text-red-500">*</span></label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full border border-gray-200 p-3 text-xs font-bold uppercase tracking-wider text-gray-900 outline-none transition focus:border-black bg-gray-50/30"
                                >
                                    <option value="">-- SELECT PRODUCT CATEGORY --</option>
                                    {categories.map((cat: any) => (
                                        <option key={cat._id} value={cat._id}>
                                            {String(cat.categoryName || "").toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Internal Admin Notes</label>
                                <div className="relative">
                                    <ChatBubbleLeftRightIcon className="absolute left-3 top-3 w-4 h-4 text-gray-300" />
                                    <textarea 
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="ADD NOTES FOR THE VENDOR..."
                                        className="w-full h-24 border border-gray-200 p-3 pl-10 text-xs font-medium uppercase outline-none focus:border-black bg-gray-50/30 transition-all resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
                            <button 
                                onClick={() => handleAction('Rejected')}
                                className="flex-1 border border-red-200 text-red-600 bg-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                            >
                                <XMarkIcon className="w-4 h-4" /> Reject
                            </button>
                            <button 
                                onClick={() => handleAction('Approved')}
                                className="flex-1 bg-black text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#10b981] transition-all flex items-center justify-center gap-2"
                            >
                                <CheckIcon className="w-4 h-4" /> Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
