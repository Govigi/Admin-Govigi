"use client";
import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { GoogleMap, useJsApiLoader, Polygon, Autocomplete } from "@react-google-maps/api";
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
    const [mapCenter, setMapCenter] = useState(center);

    useEffect(() => {
        setMapCenter(center);
    }, [center.lat, center.lng]);

    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    const onPlaceChanged = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const newPos = { lat, lng };
                setMapCenter(newPos);
                if (map) {
                    map.panTo(newPos);
                    map.setZoom(16);
                }
            }
        }
    };

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

    const [drawMode, setDrawMode] = useState<"pan" | "draw" | "erase">("draw");
    const [isDrawing, setIsDrawing] = useState(false);
    const [isCtrlPressed, setIsCtrlPressed] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Control" || e.key === "Shift") {
                setIsCtrlPressed(true);
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === "Control" || e.key === "Shift") {
                setIsCtrlPressed(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown, { passive: true });
        window.addEventListener("keyup", handleKeyUp, { passive: true });
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);

    const toggleCellAt = useCallback((latLng: google.maps.LatLng | null, isDrag = false) => {
        if (!latLng || readOnly) return;
        const lat = latLng.lat();
        const lng = latLng.lng();

        // 1. Determine active H3 resolution based dynamically on current Google Map zoom
        let currentZoom = map ? map.getZoom() : DEFAULT_ZOOM;
        if (currentZoom === undefined) currentZoom = DEFAULT_ZOOM;

        let res = 9;
        if (currentZoom <= 10) res = 6;
        else if (currentZoom === 11 || currentZoom === 12) res = 7;
        else if (currentZoom === 13 || currentZoom === 14) res = 8;
        else if (currentZoom === 15 || currentZoom === 16) res = 9;
        else if (currentZoom === 17) res = 10;
        else res = 11;

        // 2. Resolve clicked location at the dynamic resolution
        const clickedHex = h3.latLngToCell(lat, lng, res);

        // 3. Map cell back to standard Resolution 9 (standard database resolution)
        let targetCells: string[] = [];
        if (res < HEX_RESOLUTION) {
            // Zoomed out: click/drag draws a larger cell, so expand it to standard resolution 9 children
            targetCells = h3.cellToChildren(clickedHex, HEX_RESOLUTION);
        } else if (res > HEX_RESOLUTION) {
            // Zoomed in: map to standard resolution 9 parent cell
            targetCells = [h3.cellToParent(clickedHex, HEX_RESOLUTION)];
        } else {
            targetCells = [clickedHex];
        }

        // 4. Batch update standard cells
        if (isDrag) {
            if (drawMode === "draw") {
                const toAdd = targetCells.filter(c => !selectedHexagons.includes(c));
                if (toAdd.length > 0) {
                    onChange([...selectedHexagons, ...toAdd]);
                }
            } else if (drawMode === "erase") {
                const filtered = selectedHexagons.filter(c => !targetCells.includes(c));
                if (filtered.length !== selectedHexagons.length) {
                    onChange(filtered);
                }
            }
        } else {
            // Click toggle
            const alreadySelected = selectedHexagons.includes(targetCells[0]);
            if (alreadySelected) {
                onChange(selectedHexagons.filter(c => !targetCells.includes(c)));
            } else {
                const toAdd = targetCells.filter(c => !selectedHexagons.includes(c));
                onChange([...selectedHexagons, ...toAdd]);
            }
        }
    }, [selectedHexagons, drawMode, onChange, readOnly, map]);

    const handleMouseDown = (e: google.maps.MapMouseEvent | any) => {
        const ctrlActive = e.domEvent?.ctrlKey || e.domEvent?.metaKey || e.domEvent?.shiftKey || isCtrlPressed;
        if (ctrlActive) {
            setIsDrawing(false);
            return;
        }
        if (drawMode !== "pan" && e.latLng) {
            setIsDrawing(true);
            toggleCellAt(e.latLng, false);
        }
    };

    const handleMouseMove = (e: google.maps.MapMouseEvent | any) => {
        const ctrlActive = e.domEvent?.ctrlKey || e.domEvent?.metaKey || e.domEvent?.shiftKey || isCtrlPressed;
        if (ctrlActive) {
            setIsDrawing(false);
            return;
        }
        if (isDrawing && e.latLng) {
            toggleCellAt(e.latLng, true);
        }
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
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

    const handleDragEnd = () => {
        if (map) {
            const newCenter = map.getCenter();
            if (newCenter) {
                setMapCenter({
                    lat: newCenter.lat(),
                    lng: newCenter.lng()
                });
            }
        }
    };

    if (!isLoaded) return <div className="h-96 w-full bg-gray-100 animate-pulse flex items-center justify-center text-xs font-mono text-gray-400">LOADING MAP...</div>;
    if (loadError) return <div className="h-96 w-full bg-red-50 text-red-500 flex items-center justify-center text-xs font-mono">Error Loading Map</div>;

    return (
        <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 bg-gray-50 p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Search:</span>
                    <Autocomplete
                        onLoad={(autocomplete) => { autocompleteRef.current = autocomplete; }}
                        onPlaceChanged={onPlaceChanged}
                    >
                        <input
                            type="text"
                            placeholder="SEARCH AREA OR CITY..."
                            className="text-xs border border-gray-300 rounded px-3 py-1.5 w-60 focus:outline-none focus:border-black font-mono uppercase bg-white placeholder-gray-300"
                        />
                    </Autocomplete>
                </div>

                <div className="h-px w-full sm:h-6 sm:w-px bg-gray-300 mx-1 hidden sm:block"></div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Tool:</span>
                    <div className="flex border border-gray-200 rounded overflow-hidden shadow-sm">
                        <button
                            type="button"
                            onClick={() => setDrawMode("draw")}
                            className={`text-[10px] px-3 py-1.5 font-mono uppercase font-bold tracking-wider transition-colors ${drawMode === 'draw' ? 'bg-[#10b981] text-white border-r border-[#10b981]' : 'bg-white text-gray-700 hover:bg-gray-50 border-r border-gray-200'}`}
                        >
                            ✏️ Draw (Drag)
                        </button>
                        <button
                            type="button"
                            onClick={() => setDrawMode("erase")}
                            className={`text-[10px] px-3 py-1.5 font-mono uppercase font-bold tracking-wider transition-colors ${drawMode === 'erase' ? 'bg-red-500 text-white border-r border-red-500' : 'bg-white text-gray-700 hover:bg-gray-50 border-r border-gray-200'}`}
                        >
                            ❌ Erase
                        </button>
                        <button
                            type="button"
                            onClick={() => setDrawMode("pan")}
                            className={`text-[10px] px-3 py-1.5 font-mono uppercase font-bold tracking-wider transition-colors ${drawMode === 'pan' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            🖐️ Pan
                        </button>
                    </div>
                </div>

                <div className="h-px w-full sm:h-6 sm:w-px bg-gray-300 mx-1 hidden sm:block"></div>

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
                    center={mapCenter}
                    zoom={DEFAULT_ZOOM}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    onDragEnd={handleDragEnd}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    options={{
                        draggable: drawMode === "pan" || isCtrlPressed, // Enable panning if Pan mode is on OR Ctrl/Shift is held!
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
                        <li>Select ✏️ Draw to drag & select hexagons.</li>
                        <li>Select ❌ Erase to drag & deselect hexagons.</li>
                        <li>Select 🖐️ Pan to drag & move the map.</li>
                        <li><strong>Tip:</strong> Hold <strong>Ctrl</strong> or <strong>Shift</strong> key while dragging to pan the map at any time!</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
