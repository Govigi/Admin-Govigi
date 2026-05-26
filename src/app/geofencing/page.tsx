"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { AdminUrl } from "@/src/libs/utils/API/endpoints";
import ServiceRangeSelector from "@/src/components/ServiceRangeSelector";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function Geofencing() {
    const [appHexagons, setAppHexagons] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [savingGeofence, setSavingGeofence] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const hexRes = await axios.get(AdminUrl.getSettings.replace("{key}", "app_service_hexagons"));
                if (hexRes.data?.value !== null && hexRes.data?.value !== undefined) {
                    setAppHexagons(hexRes.data.value);
                }
            } catch (error) {
                console.error("Error loading geofence settings:", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const saveGeofence = async () => {
        setSavingGeofence(true);
        try {
            await axios.put(AdminUrl.updateSettings, { key: "app_service_hexagons", value: appHexagons });
            alert("App Hexagonal Geofence saved successfully!");
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to save geofence settings");
        } finally {
            setSavingGeofence(false);
        }
    };

    return (
        <div className="min-h-screen bg-white p-4 md:p-8 font-mono text-gray-900 w-full max-w-[100vw] overflow-x-hidden">
            {/* Header */}
            <div className="mb-8 border-b border-gray-200 pb-6">
                <h1 className="text-xl font-bold uppercase tracking-widest text-[#10b981]">Global Service Boundaries</h1>
                <p className="text-xs text-gray-400 mt-1">Geographic Range Configuration</p>
            </div>

            {loading ? (
                <div className="py-20 text-center text-xs uppercase tracking-widest text-gray-400">Loading Geofence Map...</div>
            ) : (
                <div className="max-w-7xl space-y-8">
                    {/* Map Zone */}
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xs font-bold uppercase tracking-widest text-[#10b981] border-l-4 border-[#10b981] pl-3">
                                Hexagonal Operating Zones (H3 Grid)
                            </h2>
                            <span className="text-[10px] uppercase tracking-widest bg-gray-100 px-3 py-1 text-gray-500 font-bold">
                                {appHexagons.length} Active Zones
                            </span>
                        </div>

                        <div className="bg-white border border-gray-200 p-6 rounded-none space-y-6">
                            <p className="text-xs text-gray-500 uppercase leading-relaxed max-w-2xl">
                                Click & drag to paint operating hexagons, or erase zones globally. Search Hyderabad suburbs directly below to quickly zoom and locate neighborhoods.
                            </p>

                            <ServiceRangeSelector
                                center={{ lat: 17.3850, lng: 78.4867 }} // Hyderabad Default Center
                                selectedHexagons={appHexagons}
                                onChange={(hexagons) => setAppHexagons(hexagons)}
                                apiKey={GOOGLE_MAPS_API_KEY}
                            />

                            <div className="flex justify-end pt-4 border-t border-gray-100">
                                <button
                                    onClick={saveGeofence}
                                    disabled={savingGeofence}
                                    className="bg-black text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-[#10b981] disabled:opacity-50 transition-colors"
                                >
                                    {savingGeofence ? "SAVING..." : "SAVE GEOFENCE"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
