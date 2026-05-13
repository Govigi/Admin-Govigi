"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function MobileAppSettings() {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/admin/settings/mobile_config`);
            const data = await response.json();
            if (data && data.value) {
                setConfig(data.value);
            } else {
                // Default structure if empty
                setConfig({
                    bottomTabs: [],
                    addressLimit: 5,
                    profileOptions: []
                });
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching config:", error);
            setLoading(false);
            setMessage("Failed to load settings.");
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage("");
        try {
            await fetch(`${BACKEND_URL}/admin/settings`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    key: "mobile_config",
                    value: config,
                }),
            });
            setMessage("Settings saved successfully!");
            setSaving(false);
        } catch (error) {
            console.error("Error saving config:", error);
            setMessage("Failed to save settings.");
            setSaving(false);
        }
    };

    const toggleTab = (name: string) => {
        if (!config) return;
        const newTabs = config.bottomTabs.map((tab: any) =>
            tab.name === name ? { ...tab, enabled: !tab.enabled } : tab
        );
        setConfig({ ...config, bottomTabs: newTabs });
    };

    const toggleProfileOption = (id: string) => {
        if (!config) return;
        const newOptions = config.profileOptions.map((opt: any) =>
            opt.id === id ? { ...opt, enabled: !opt.enabled } : opt
        );
        setConfig({ ...config, profileOptions: newOptions });
    };

    if (loading) return <div className="min-h-screen bg-white p-8 font-mono text-gray-900">Loading settings...</div>;

    return (
        <div className="min-h-screen bg-white p-2 md:p-8 font-mono text-gray-900 w-full max-w-[100vw] overflow-x-hidden">
            {/* Header with Save Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-gray-200 pb-6 gap-6">
                <div>
                    <h1 className="text-xl font-bold uppercase tracking-widest text-[#10b981]">Mobile App Configuration</h1>
                    <p className="text-xs text-gray-400 mt-1">Manage feature visibility and limits</p>
                </div>
                <div className="flex items-center">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-black text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#10b981] disabled:opacity-50 transition-all rounded-none shadow-none"
                    >
                        {saving ? "SAVING..." : "SAVE CHANGES"}
                    </button>
                </div>
            </div>

            {config && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Bottom Navigation Section */}
                    <div className="border border-gray-200 p-6">
                        <h2 className="text-xs font-bold uppercase tracking-widest mb-4 border-b border-gray-100 pb-2 text-gray-500">Bottom Navigation</h2>
                        <div className="space-y-3">
                            {config.bottomTabs.map((tab: any) => (
                                <div key={tab.name} className="flex items-center justify-between p-3 border border-gray-100 hover:border-black transition-colors group">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold uppercase tracking-wide group-hover:text-[#10b981] transition-colors">{tab.label}</span>
                                        <span className="text-[10px] text-gray-400">{tab.name}</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={tab.enabled}
                                            onChange={() => toggleTab(tab.name)}
                                        />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10b981]"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Profile Menu Section */}
                    <div className="border border-gray-200 p-6">
                        <h2 className="text-xs font-bold uppercase tracking-widest mb-4 border-b border-gray-100 pb-2 text-gray-500">Profile Menu</h2>
                        <div className="space-y-3">
                            {config.profileOptions.map((opt: any) => (
                                <div key={opt.id} className="flex items-center justify-between p-3 border border-gray-100 hover:border-black transition-colors group">
                                    <span className="text-xs font-bold uppercase tracking-wide group-hover:text-[#10b981] transition-colors">{opt.label}</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={opt.enabled}
                                            onChange={() => toggleProfileOption(opt.id)}
                                        />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10b981]"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Limits Section */}
                    <div className="border border-gray-200 p-6 lg:col-span-2">
                        <h2 className="text-xs font-bold uppercase tracking-widest mb-4 border-b border-gray-100 pb-2 text-gray-500">Feature Limits</h2>
                        <div className="max-w-xs">
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Max Saved Addresses</label>
                            <input
                                type="number"
                                value={config.addressLimit}
                                onChange={(e) => setConfig({ ...config, addressLimit: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-2 border border-gray-200 text-sm focus:outline-none focus:border-black transition-colors font-mono rounded-none"
                            />
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}
