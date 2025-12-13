"use client";
import React, { useState, useEffect } from "react";
import { PlusIcon, UserIcon, TruckIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { AdminUrl } from "@/src/libs/utils/API/endpoints";

type Driver = {
    _id: string;
    name: string;
    phone: string;
    vehicleNumber?: string;
    status: "active" | "inactive" | "busy";
    createdAt: string;
};

export default function DriversPage() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        vehicleNumber: ""
    });

    const fetchDrivers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(AdminUrl.getAllDrivers);
            setDrivers(res.data);
        } catch (error) {
            console.error("Failed to fetch drivers", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(AdminUrl.createDriver, formData);
            fetchDrivers();
            setIsModalOpen(false);
            setFormData({ name: "", phone: "", vehicleNumber: "" });
        } catch (err) {
            alert("Failed to create driver");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Add Driver</span>
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading drivers...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {drivers.map(driver => (
                            <div key={driver._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-start gap-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <UserIcon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900">{driver.name}</h3>
                                    <p className="text-sm text-gray-500 mb-2">{driver.phone}</p>

                                    <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                        <TruckIcon className="w-4 h-4" />
                                        {driver.vehicleNumber || "No Vehicle Info"}
                                    </div>
                                </div>
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 uppercase">
                                    {driver.status}
                                </span>
                            </div>
                        ))}
                        {drivers.length === 0 && (
                            <div className="col-span-full text-center py-10 text-gray-500 bg-white border border-gray-200 rounded-xl">
                                No drivers found. Add one to get started.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Add New Driver</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input type="text" required
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input type="text" required
                                    value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Vehicle Number</label>
                                <input type="text"
                                    value={formData.vehicleNumber} onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
