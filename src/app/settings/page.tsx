"use client";
import React, { useState, useEffect } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { AdminUrl } from "@/src/libs/utils/API/endpoints";

// Types
type DeliveryZone = {
    id: string;
    name: string;
    pincodes: string[];
    deliveryCharge: number;
};

export default function Settings() {
    const [walletPercentage, setWalletPercentage] = useState<number>(30);
    const [orderBooking, setOrderBooking] = useState({
        minimumOrderAmount: 499,
        minimumOrderEnabled: true,
        deliveryFee: 0,
        freeDeliveriesPerCustomer: 0,
        freeDeliveryEnabled: false,
    });
    const [zones, setZones] = useState<DeliveryZone[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Zone Form
    const [newZone, setNewZone] = useState({ name: "", pincodes: "", deliveryCharge: 0 });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [walletRes, zoneRes, orderBookingRes] = await Promise.all([
                    axios.get(AdminUrl.getSchedulingSettings.replace("/settings/scheduling", "/admin/settings/wallet")),
                    axios.get(AdminUrl.getSettings.replace("{key}", "delivery_zones")),
                    axios.get(AdminUrl.getOrderBookingSettings)
                ]);

                if (walletRes.data.percentage !== undefined) {
                    setWalletPercentage(Number(walletRes.data.percentage));
                }
                if (zoneRes.data?.value !== null && zoneRes.data?.value !== undefined) {
                    setZones(zoneRes.data.value);
                }
                if (orderBookingRes.data) {
                    setOrderBooking(orderBookingRes.data);
                }
            } catch (error) {
                console.error("Error loading settings:", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const saveSetting = async (key: string, value: any) => {
        setSaving(true);
        try {
            if (key === "wallet_percentage") {
                await axios.put(AdminUrl.updateSettings + "/wallet", { percentage: value });
            } else {
                await axios.put(AdminUrl.updateSettings, { key, value });
            }
            alert(`${key === 'wallet_percentage' ? 'Wallet' : 'Zone'} settings saved!`);
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to save settings");
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
        saveSetting("delivery_zones", updated);
    };

    const handleDeleteZone = (id: string) => {
        const updated = zones.filter(z => z.id !== id);
        setZones(updated);
        saveSetting("delivery_zones", updated);
    };

    return (
        <div className="min-h-screen bg-white p-4 md:p-8 font-mono text-gray-900 w-full max-w-[100vw] overflow-x-hidden">
            <div className="mb-8 border-b border-gray-200 pb-6">
                <h1 className="text-xl font-bold uppercase tracking-widest text-[#10b981]">General Settings</h1>
                <p className="text-xs text-gray-400 mt-1">Global Configuration</p>
            </div>

            {loading ? (
                <div className="py-20 text-center text-xs uppercase tracking-widest text-gray-400">Loading Configuration...</div>
            ) : (
                <div className="max-w-7xl space-y-12">

                    {/* 1. Wallet Settings */}
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-[#10b981] mb-6 border-l-4 border-[#10b981] pl-3">
                            01. Finance Configuration
                        </h2>
                        <div className="max-w-md">
                            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Max Wallet Usage (%)</label>
                            <div className="flex gap-6 items-end">
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={walletPercentage}
                                        onChange={(e) => setWalletPercentage(Number(e.target.value))}
                                        placeholder="0"
                                        className="block w-full border-b border-gray-300 bg-transparent py-2 px-0 text-sm focus:border-black focus:ring-0 focus:outline-none transition-colors placeholder-gray-300"
                                    />
                                    <span className="absolute right-0 top-2 text-gray-400 text-xs">%</span>
                                </div>
                                <button
                                    onClick={() => saveSetting("wallet_percentage", walletPercentage)}
                                    disabled={saving}
                                    className="bg-black text-white px-8 py-2 text-xs uppercase tracking-widest hover:bg-[#10b981] disabled:opacity-50 transition-colors h-[38px]"
                                >
                                    {saving ? "SAVING..." : "SAVE"}
                                </button>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-wide">Percentage of order total payable via wallet</p>
                        </div>
                    </div>

                    {/* 2. Delivery Zones */}
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-[#10b981] border-l-4 border-[#10b981] pl-3">
                                02. Delivery Zones
                            </h2>
                            <span className="text-[10px] uppercase tracking-widest bg-gray-100 px-3 py-1 text-gray-500 font-bold">
                                {zones.length} Active Zones
                            </span>
                        </div>

                        {/* Add Zone Form */}
                        <div className="mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                                <div className="md:col-span-4">
                                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Zone Name</label>
                                    <input
                                        type="text"
                                        placeholder="ENTER NAME"
                                        value={newZone.name}
                                        onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                                        className="block w-full border-b border-gray-300 bg-transparent py-2 px-0 text-sm focus:border-black focus:ring-0 focus:outline-none transition-colors placeholder-gray-300 uppercase"
                                    />
                                </div>
                                <div className="md:col-span-4">
                                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Pincodes</label>
                                    <input
                                        type="text"
                                        placeholder="COMMA SEPARATED"
                                        value={newZone.pincodes}
                                        onChange={(e) => setNewZone({ ...newZone, pincodes: e.target.value })}
                                        className="block w-full border-b border-gray-300 bg-transparent py-2 px-0 text-sm focus:border-black focus:ring-0 focus:outline-none transition-colors placeholder-gray-300 uppercase"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Charge</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={newZone.deliveryCharge}
                                        onChange={(e) => setNewZone({ ...newZone, deliveryCharge: Number(e.target.value) })}
                                        className="block w-full border-b border-gray-300 bg-transparent py-2 px-0 text-sm focus:border-black focus:ring-0 focus:outline-none transition-colors placeholder-gray-300 uppercase"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <button
                                        onClick={handleAddZone}
                                        className="w-full bg-black text-white px-4 py-2 text-xs uppercase tracking-widest hover:bg-[#10b981] transition-colors h-[38px] flex items-center justify-center gap-2"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                        ADD
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Zones List */}
                        <div className="border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Zone Name</th>
                                        <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Pincodes</th>
                                        <th className="px-5 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Charge</th>
                                        <th className="px-5 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-widest">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {zones.length > 0 ? zones.map((zone) => (
                                        <tr key={zone.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-4 text-xs font-bold text-gray-900 uppercase">{zone.name}</td>
                                            <td className="px-5 py-4 text-xs text-gray-500 max-w-xs truncate font-mono" title={Array.isArray(zone.pincodes) ? zone.pincodes.join(", ") : zone.pincodes}>
                                                {Array.isArray(zone.pincodes) ? zone.pincodes.join(", ") : zone.pincodes}
                                            </td>
                                            <td className="px-5 py-4 text-xs font-bold text-gray-900">₹{zone.deliveryCharge}</td>
                                            <td className="px-5 py-4 text-right text-xs">
                                                <button
                                                    onClick={() => handleDeleteZone(zone.id)}
                                                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                                    title="DELETE"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-10 text-center text-xs text-gray-500 uppercase tracking-widest">
                                                No zones found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}

