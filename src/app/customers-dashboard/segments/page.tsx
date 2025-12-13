"use client";
import React, { useState, useEffect } from "react";
import { PlusIcon, TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
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

    // Form State
    const [formData, setFormData] = useState({
        typeName: "",
        description: "",
        discountPercentage: 0,
        status: "active" as "active" | "inactive",
    });

    const fetchTypes = async () => {
        setLoading(true);
        try {
            // Use existing endpoint for fetching all types
            const response = await axios.get(CustomerTypesUrl.getAllTypes);
            // Handle response structure { types: [] } or just []
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
                discountPercentage: type.discountPercentage || 0,
                status: type.status,
            });
        } else {
            setEditingType(null);
            setFormData({ typeName: "", description: "", discountPercentage: 0, status: "active" });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingType) {
                const url = AdminUrl.updateCustomerType.replace("{id}", editingType._id);
                await axios.put(url, formData);
            } else {
                await axios.post(AdminUrl.createCustomerType, formData);
            }
            await fetchTypes();
            closeModal();
        } catch (error) {
            alert("Failed to save segment");
            console.error(error);
        }
    };

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

    return (
        <div className="min-h-screen bg-gray-50 pb-20">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Customer Segments</h1>
                        <p className="text-sm text-gray-500">Manage customer types and pricing tiers.</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Add Segment</span>
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading segments...</div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {types.map((type) => (
                                    <tr key={type._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{type.typeName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{type.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{type.discountPercentage || 0}%</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${type.status === "active" || !type.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {type.status || 'active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openModal(type)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(type._id)} className="text-red-600 hover:text-red-900">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">{editingType ? "Edit Segment" : "New Segment"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.typeName}
                                    onChange={(e) => setFormData({ ...formData, typeName: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                                    placeholder="e.g. Wholesale"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.discountPercentage}
                                        onChange={(e) => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
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
