"use client";
import React, { useState, useEffect } from "react";
import PathShower from "@/src/components/pathShower";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { AdminUrl } from "@/src/libs/utils/API/endpoints";

// Types
type DeliveryZone = {
    id: string; // generated client side for now, or use index if stored as array
    name: string;
    pincodes: string[];
    deliveryCharge: number;
};

export default function Settings() {
    const [walletPercentage, setWalletPercentage] = useState<number>(30);
    const [zones, setZones] = useState<DeliveryZone[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Zone Form
    const [newZone, setNewZone] = useState({ name: "", pincodes: "", deliveryCharge: 0 });

    useEffect(() => {
        // Load Settings
        const load = async () => {
            setLoading(true);
            try {
                const [walletRes, zoneRes] = await Promise.all([
                    axios.get(AdminUrl.getSettings.replace("{key}", "wallet_percentage")),
                    axios.get(AdminUrl.getSettings.replace("{key}", "delivery_zones"))
                ]);

                if (walletRes.data.value !== null) setWalletPercentage(Number(walletRes.data.value));
                if (zoneRes.data.value !== null) setZones(zoneRes.data.value); // Assuming stored as JSON array

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const saveSetting = async (key: string, value: any) => {
        setSaving(true);
        try {
            await axios.put(AdminUrl.updateSettings, { key, value });
            alert(`${key === 'wallet_percentage' ? 'Wallet' : 'Zone'} settings saved!`);
        } catch (error) {
            alert("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const handleAddZone = () => {
        if (!newZone.name || !newZone.pincodes) return;
        const zone: DeliveryZone = {
            id: Math.random().toString(),
            name: newZone.name,
            pincodes: newZone.pincodes.split(",").map(p => p.trim()),
            deliveryCharge: newZone.deliveryCharge
        };
        const updated = [...zones, zone];
        setZones(updated);
        setNewZone({ name: "", pincodes: "", deliveryCharge: 0 });
        // Auto save zones
        saveSetting("delivery_zones", updated);
    };

    const handleDeleteZone = (id: string) => {
        const updated = zones.filter(z => z.id !== id);
        setZones(updated);
        saveSetting("delivery_zones", updated);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <PathShower
                pathList={[
                    ["settings", "Settings"],
                ]}
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-8">
                <h1 className="text-2xl font-bold text-gray-900">Global Settings</h1>

                {/* 1. Wallet Settings */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Finance Configuration</h2>
                    <div className="max-w-md">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Wallet Usage (%)</label>
                        <p className="text-xs text-gray-500 mb-2">Maximum percentage of order total payble via wallet.</p>
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={walletPercentage}
                                    onChange={(e) => setWalletPercentage(Number(e.target.value))}
                                    className="block w-full rounded-md border border-gray-300 pl-3 pr-8 py-2 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                />
                                <span className="absolute right-3 top-2 text-gray-500">%</span>
                            </div>
                            <button
                                onClick={() => saveSetting("wallet_percentage", walletPercentage)}
                                disabled={saving}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </section>

                {/* 2. Delivery Zones */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Zones & Charges</h2>

                    {/* Add Zone Form */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Add New Zone</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="text"
                                placeholder="Zone Name (e.g. North City)"
                                value={newZone.name}
                                onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Pincodes (comma separated)"
                                value={newZone.pincodes}
                                onChange={(e) => setNewZone({ ...newZone, pincodes: e.target.value })}
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Charge (₹)"
                                    value={newZone.deliveryCharge}
                                    onChange={(e) => setNewZone({ ...newZone, deliveryCharge: Number(e.target.value) })}
                                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                />
                                <button
                                    onClick={handleAddZone}
                                    className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Zones List */}
                    <div className="overflow-hidden border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pincodes</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Charge</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {zones.length > 0 ? zones.map((zone) => (
                                    <tr key={zone.id}>
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{zone.name}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate" title={Array.isArray(zone.pincodes) ? zone.pincodes.join(", ") : zone.pincodes}>
                                            {Array.isArray(zone.pincodes) ? zone.pincodes.join(", ") : zone.pincodes}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">₹{zone.deliveryCharge}</td>
                                        <td className="px-4 py-3 text-right text-sm font-medium">
                                            <button onClick={() => handleDeleteZone(zone.id)} className="text-red-600 hover:text-red-900">
                                                <TrashIcon className="w-4 h-4 ml-auto" />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">No delivery zones configured.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    );
}
