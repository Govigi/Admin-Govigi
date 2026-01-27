"use client";
import React, { useState, useEffect } from "react";
import { PlusIcon, TrashIcon, PencilIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { AdminUrl, CustomerTypesUrl } from "@/src/libs/utils/API/endpoints";
import axios from "axios";

// Types
type CustomerType = {
    _id: string;
    typeName: string;
    description: string;
    discountPercentage?: number;
    status: "active" | "inactive";
};

export default function CustomerSegments() {
    const [types, setTypes] = useState<CustomerType[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<CustomerType | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        typeName: "",
        description: "",
        discountPercentage: 0 as number | "",
        status: "active" as "active" | "inactive",
    });

    const fetchTypes = async () => {
        setLoading(true);
        try {
            const response = await axios.get(CustomerTypesUrl.getAllTypes);
            setTypes(response.data.types || response.data || []);
        } catch (error) {
            console.error("Failed to fetch types", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    const openModal = (type?: CustomerType) => {
        if (type) {
            setEditingType(type);
            setFormData({
                typeName: type.typeName,
                description: type.description,
                discountPercentage: type.discountPercentage ?? "",
                status: type.status,
            });
        } else {
            setEditingType(null);
            setFormData({ typeName: "", description: "", discountPercentage: "", status: "active" });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const submitData = {
                ...formData,
                discountPercentage: Number(formData.discountPercentage) || 0
            };

            if (editingType) {
                const url = AdminUrl.updateCustomerType.replace("{id}", editingType._id);
                await axios.put(url, submitData);
            } else {
                await axios.post(AdminUrl.createCustomerType, submitData);
            }
            await fetchTypes();
            closeModal();
        } catch (error) {
            alert("Failed to save segment");
            console.error(error);
        }
    };

    // ... existing code ...

    <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Discount (%)</label>
        <input
            type="number"
            min="0"
            max="100"
            value={formData.discountPercentage}
            onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value === "" ? "" : Number(e.target.value) })}
            className="block w-full border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none transition-colors"
        />
    </div>

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this segment?")) {
            try {
                const url = AdminUrl.deleteCustomerType.replace("{id}", id);
                await axios.delete(url);
                await fetchTypes();
            } catch (error) {
                alert("Failed to delete segment");
                console.error(error);
            }
        }
    };

    const filteredTypes = types.filter(t =>
        t.typeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-white p-2 md:p-8 font-mono text-gray-900 w-full max-w-[100vw] overflow-x-hidden pb-24">

            {/* Header Section */}
            <div className="mb-6 pb-4 border-b border-gray-200 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold uppercase tracking-widest text-[#10b981]">Customer Segments</h1>
                        <p className="text-xs text-gray-400 mt-1">Manage customer types and pricing tiers.</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Search Bar */}
                    <div className="relative group w-full md:w-96">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH SEGMENTS..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 text-xs w-full focus:outline-none focus:border-black transition-colors uppercase placeholder-gray-300"
                        />
                    </div>

                    <button
                        onClick={() => openModal()}
                        className="bg-black text-white hover:bg-[#10b981] text-xs px-4 py-2 uppercase tracking-widest flex items-center justify-center gap-2 transition-colors rounded-none"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Add Segment
                    </button>
                </div>
            </div>

            {/* Table Section */}
            {loading ? (
                <div className="text-center py-10 text-xs uppercase text-gray-400 tracking-widest">Loading segments...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Name</th>
                                <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Description</th>
                                <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Discount</th>
                                <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredTypes.map((type) => (
                                <tr key={type._id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{type.typeName}</td>
                                    <td className="py-3 px-4 text-xs text-gray-500">{type.description}</td>
                                    <td className="py-3 px-4 text-xs text-gray-500 font-mono">{type.discountPercentage || 0}%</td>
                                    <td className="py-3 px-4">
                                        <span
                                            className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${type.status === "active" || !type.status
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {type.status || 'active'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openModal(type)} className="text-gray-400 hover:text-black transition-colors">
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(type._id)} className="text-gray-400 hover:text-red-600 transition-colors">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredTypes.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-xs text-gray-400 uppercase tracking-widest">
                                        No segments found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white shadow-xl max-w-md w-full p-8 font-mono border border-gray-100">
                        <h2 className="text-lg font-bold uppercase tracking-widest mb-6 border-b border-gray-100 pb-2">
                            {editingType ? "Edit Segment" : "New Segment"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.typeName}
                                    onChange={(e) => setFormData({ ...formData, typeName: e.target.value })}
                                    className="block w-full border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none transition-colors placeholder-gray-300"
                                    placeholder="E.G. WHOLESALE"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="block w-full border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none transition-colors"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Discount (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.discountPercentage}
                                        onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value === "" ? "" : Number(e.target.value) })}
                                        className="block w-full border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                                        className="block w-full border border-gray-200 px-3 py-2 text-sm focus:border-black focus:outline-none transition-colors uppercase bg-transparent"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                                <button type="button" onClick={closeModal} className="px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-[#10b981] transition-colors">
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
