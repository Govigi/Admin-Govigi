"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { AdminUrl } from "@/src/libs/utils/API/endpoints";

interface TimeSlot {
    start: string;
    end: string;
}

interface SchedulingSettings {
    morningSlots: TimeSlot[];
    eveningSlots: TimeSlot[];
    maxDays: number;
    allowToday: boolean;
}


export default function SchedulingPage() {
    const [settings, setSettings] = useState<SchedulingSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            // Assuming no auth header needed for internal/local admin or it uses cookies
            // If auth is needed, we might need to retrieve token from storage
            const res = await axios.get(AdminUrl.getSchedulingSettings);
            setSettings(res.data);
        } catch (error) {
            console.error("Failed to fetch settings", error);
            // Fallback
            setSettings({
                morningSlots: [],
                eveningSlots: [],
                maxDays: 7,
                allowToday: false
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            await axios.patch(AdminUrl.updateSchedulingSettings, settings);
            alert("Settings saved successfully!");
        } catch (error) {
            console.error("Failed to save settings", error);
            alert("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const updateSlot = (
        type: "morningSlots" | "eveningSlots",
        index: number,
        field: "start" | "end",
        value: string
    ) => {
        if (!settings) return;
        const newSlots = [...settings[type]];
        newSlots[index] = { ...newSlots[index], [field]: value };
        setSettings({ ...settings, [type]: newSlots });
    };

    const addSlot = (type: "morningSlots" | "eveningSlots") => {
        if (!settings) return;
        setSettings({
            ...settings,
            [type]: [...settings[type], { start: "00:00", end: "00:00" }],
        });
    };

    const removeSlot = (type: "morningSlots" | "eveningSlots", index: number) => {
        if (!settings) return;
        const newSlots = settings[type].filter((_, i) => i !== index);
        setSettings({ ...settings, [type]: newSlots });
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!settings) return <div className="p-8">Error loading settings</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Scheduling Settings</h1>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* General Settings */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 md:col-span-2">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4">General Configuration</h2>
                        <div className="flex items-center gap-4">
                            <label className="text-gray-600 font-medium">Max Days to Schedule Advance:</label>
                            <input
                                type="number"
                                min="1"
                                value={settings.maxDays}
                                onChange={(e) =>
                                    setSettings({ ...settings, maxDays: parseInt(e.target.value) || 7 })
                                }
                                className="border border-gray-300 rounded px-3 py-1 w-24"
                            />
                        </div>
                    </div>

                    {/* Morning Slots */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-700">Morning Slots</h2>
                            <button
                                onClick={() => addSlot("morningSlots")}
                                className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                                <PlusIcon className="w-4 h-4" /> Add Slot
                            </button>
                        </div>
                        <div className="space-y-3">
                            {settings.morningSlots.map((slot, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="time"
                                        value={slot.start}
                                        onChange={(e) => updateSlot("morningSlots", index, "start", e.target.value)}
                                        className="border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50"
                                    />
                                    <span className="text-gray-400">-</span>
                                    <input
                                        type="time"
                                        value={slot.end}
                                        onChange={(e) => updateSlot("morningSlots", index, "end", e.target.value)}
                                        className="border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50"
                                    />
                                    <button
                                        onClick={() => removeSlot("morningSlots", index)}
                                        className="p-1 hover:bg-red-50 rounded text-red-500"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Evening Slots */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-700">Evening Slots</h2>
                            <button
                                onClick={() => addSlot("eveningSlots")}
                                className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                                <PlusIcon className="w-4 h-4" /> Add Slot
                            </button>
                        </div>
                        <div className="space-y-3">
                            {settings.eveningSlots.map((slot, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="time"
                                        value={slot.start}
                                        onChange={(e) => updateSlot("eveningSlots", index, "start", e.target.value)}
                                        className="border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50"
                                    />
                                    <span className="text-gray-400">-</span>
                                    <input
                                        type="time"
                                        value={slot.end}
                                        onChange={(e) => updateSlot("eveningSlots", index, "end", e.target.value)}
                                        className="border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50"
                                    />
                                    <button
                                        onClick={() => removeSlot("eveningSlots", index)}
                                        className="p-1 hover:bg-red-50 rounded text-red-500"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
