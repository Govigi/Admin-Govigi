"use client";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Polygon } from "@react-google-maps/api";
import * as h3 from "h3-js";
import { TrashIcon } from "@heroicons/react/24/outline";

// Configuration
const HEX_RESOLUTION = 9; // Size of hexagons (~0.1 - 0.5km edge)
const DEFAULT_ZOOM = 15;

const LIBRARIES: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

type ServiceRangeSelectorProps = {
    center: { lat: number; lng: number };
    selectedHexagons: string[];
    onChange: (hexagons: string[]) => void;
    apiKey: string;
    readOnly?: boolean;
};

// Helpers
const deg2rad = (deg: number) => deg * (Math.PI / 180);
const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

export default function ServiceRangeSelector({ center, selectedHexagons = [], onChange, apiKey, readOnly = false }: ServiceRangeSelectorProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: "google-map-script", // Standardized generic ID
        googleMapsApiKey: apiKey,
        libraries: LIBRARIES, // Standardized libraries
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [hoveredHex, setHoveredHex] = useState<string | null>(null);
    const [radius, setRadius] = useState(0);

    const maxRadius = useMemo(() => {
        if (!center || !selectedHexagons || selectedHexagons.length === 0) return 0;
        let max = 0;
        selectedHexagons.forEach(hex => {
            const [lat, lng] = h3.cellToLatLng(hex);
            const dist = haversineDistance(center.lat, center.lng, lat, lng);
            if (dist > max) max = dist;
        });
        return (max + 0.2).toFixed(2);
    }, [selectedHexagons, center]);

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const polygons = useMemo(() => {
        if (!selectedHexagons) return [];
        return selectedHexagons.map(hex => {
            const boundary = h3.cellToBoundary(hex);
            return {
                hex,
                paths: boundary.map(([lat, lng]) => ({ lat, lng })),
            };
        });
    }, [selectedHexagons]);

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (readOnly || !e.latLng) return;
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        const hex = h3.latLngToCell(lat, lng, HEX_RESOLUTION);

        if (selectedHexagons.includes(hex)) {
            onChange(selectedHexagons.filter(h => h !== hex));
        } else {
            onChange([...selectedHexagons, hex]);
        }
    };

    // Bulk Select by Radius
    const handleRadiusSelect = () => {
        if (!center || radius <= 0) return;
        const centerHex = h3.latLngToCell(center.lat, center.lng, HEX_RESOLUTION);
        // Estimate K ring size based on radius (very rough approx for H3 res 9)
        // Edge length of res 9 is ~0.174km.
        // k ~ radius / (0.174 * 1.5) ? It's approximate.
        // Let's just use gridDisk with a manual K slider instead of "km" to be precise, 
        // OR map "km" to K roughly. 
        // Res 9 edge ~174m. Center to center ~300m.
        // Let's say 1 unit radius = 1 ring.

        const k = Math.floor(radius * 3); // Arbitrary scale factor for UI "intensity"
        if (k === 0) return;

        const newHexes = h3.gridDisk(centerHex, k);
        // Merge unique
        const merged = Array.from(new Set([...selectedHexagons, ...newHexes]));
        onChange(merged);
        setRadius(0); // Reset
    };

    // Clear All
    const handleClear = () => {
        if (confirm("Are you sure you want to clear the service range?")) {
            onChange([]);
        }
    }

    if (!isLoaded) return <div className="h-96 w-full bg-gray-100 animate-pulse flex items-center justify-center text-xs font-mono text-gray-400">LOADING MAP...</div>;
    if (loadError) return <div className="h-96 w-full bg-red-50 text-red-500 flex items-center justify-center text-xs font-mono">Error Loading Map</div>;

    return (
        <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 bg-gray-50 p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Selection Mode:</span>
                    <span className="text-xs font-mono bg-white px-2 py-1 border border-gray-200 rounded">Single Click</span>
                </div>

                <div className="h-px w-full sm:h-6 sm:w-px bg-gray-300 mx-2 hidden sm:block"></div>

                {!readOnly && (
                    <div className="flex items-center gap-2 flex-1 w-full sm:w-auto justify-between sm:justify-start">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">Bulk Add (Radius):</span>
                        <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="1"
                                value={radius}
                                onChange={(e) => setRadius(parseInt(e.target.value))}
                                className="w-full sm:w-32 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                            />
                            <button
                                onClick={handleRadiusSelect}
                                disabled={radius === 0}
                                className="bg-black text-white px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                Apply (+{radius})
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                    <div className="text-xs font-mono text-gray-600 flex flex-col items-end">
                        <div><strong>{selectedHexagons.length}</strong> zones selected</div>
                        <div className="text-[10px] text-gray-400">~{maxRadius} km radius</div>
                    </div>
                    {!readOnly && (
                        <button
                            onClick={handleClear}
                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                            title="Clear Selection"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Map */}
            <div className="h-[500px] w-full border border-gray-200 rounded-lg overflow-hidden relative">
                <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={center}
                    zoom={DEFAULT_ZOOM}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    onClick={handleMapClick}
                    options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                        zoomControl: true,
                        // Uber-like style (simplified)
                        styles: [
                            { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
                        ]
                    }}
                >
                    {/* Render Polygon for selected Hexagons */}
                    {polygons.map((poly) => (
                        <Polygon
                            key={poly.hex}
                            paths={poly.paths}
                            options={{
                                fillColor: "#10b981", // Emerald-500
                                fillOpacity: 0.35,
                                strokeColor: "#059669", // Emerald-600
                                strokeOpacity: 0.8,
                                strokeWeight: 1,
                                clickable: false // Let the map handle clicks for toggling
                            }}
                        />
                    ))}

                    {/* Highlight Hover/Click area (Optional visual guide?) 
                        Actually, map click is enough. But we can show a marker for the vendor center.
                    */}
                    {/* Center Marker */}
                    <Polygon
                        paths={h3.cellToBoundary(h3.latLngToCell(center.lat, center.lng, HEX_RESOLUTION)).map(([lat, lng]) => ({ lat, lng }))}
                        options={{
                            fillColor: "black",
                            fillOpacity: 0.1,
                            strokeColor: "black",
                            strokeOpacity: 0.5,
                            strokeWeight: 2,
                        }}
                    />
                </GoogleMap>

                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-3 rounded shadow-lg max-w-xs text-[10px] text-gray-500 font-mono border border-gray-100 pointer-events-none">
                    <p className="font-bold text-black mb-1">INSTRUCTIONS</p>
                    <ul className="list-disc pl-3 space-y-1">
                        <li>Click anywhere on the map to toggle a service zone.</li>
                        <li>Use the slider above to bulk-select surrounding zones.</li>
                        <li>The outlined zone represents the vendor location.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
