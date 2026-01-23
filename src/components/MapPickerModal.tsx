"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

// Default to Hyderabad
const DEFAULT_CENTER = {
    lat: 17.3850,
    lng: 78.4867
};

const LIBRARIES: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

type MapPickerModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (locationData: any) => void;
    apiKey: string;
};

export default function MapPickerModal({ isOpen, onClose, onConfirm, apiKey }: MapPickerModalProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: apiKey,
        libraries: LIBRARIES,
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [center, setCenter] = useState(DEFAULT_CENTER);
    const [markerPosition, setMarkerPosition] = useState(DEFAULT_CENTER);
    const [searchQuery, setSearchQuery] = useState("");
    const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<any>(null);

    // Services Refs
    const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
    const geocoder = useRef<google.maps.Geocoder | null>(null);
    const placesService = useRef<google.maps.places.PlacesService | null>(null);

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
        autocompleteService.current = new google.maps.places.AutocompleteService();
        geocoder.current = new google.maps.Geocoder();
        placesService.current = new google.maps.places.PlacesService(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    // Handle Search Input
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (value.length > 2 && autocompleteService.current) {
            autocompleteService.current.getPlacePredictions(
                { input: value },
                (results) => {
                    setPredictions(results || []);
                }
            );
        } else {
            setPredictions([]);
        }
    };

    const updateLocationFromCoordinates = (lat: number, lng: number) => {
        const newPos = { lat, lng };
        setMarkerPosition(newPos);

        if (geocoder.current) {
            geocoder.current.geocode({ location: newPos }, (results, status) => {
                if (status === "OK" && results && results[0]) {
                    const place = results[0];
                    setSelectedPlace(place);
                    setSearchQuery(place.formatted_address);
                } else {
                    console.error("Geocoder failed due to: " + status);
                }
            });
        }
    };

    const handlePredictionSelect = (placeId: string, description: string) => {
        setSearchQuery(description);
        setPredictions([]);

        if (placesService.current) {
            placesService.current.getDetails({ placeId }, (place, status) => {
                if (status === "OK" && place && place.geometry && place.geometry.location) {
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    const newPos = { lat, lng };

                    setCenter(newPos);
                    setMarkerPosition(newPos);
                    setSelectedPlace(place);

                    map?.panTo(newPos);
                    map?.setZoom(17);
                } else {
                    console.error("Place details failed: " + status);
                }
            });
        }
    };

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            updateLocationFromCoordinates(e.latLng.lat(), e.latLng.lng());
        }
    };

    const handleConfirm = () => {
        if (!selectedPlace) {
            alert("Please select a location");
            return;
        }

        const result = selectedPlace;
        const components: any = {};

        // Extract address components
        if (result.address_components) {
            result.address_components.forEach((c: google.maps.GeocoderAddressComponent) => {
                const types = c.types;
                if (types.includes("street_number")) components.houseNumber = c.long_name;
                if (types.includes("route")) components.street = c.long_name;
                if (types.includes("sublocality") || types.includes("sublocality_level_1")) components.area = c.long_name;
                if (types.includes("locality")) components.city = c.long_name;
                if (types.includes("administrative_area_level_1")) components.state = c.long_name;
                if (types.includes("postal_code")) components.postalCode = c.long_name;
                if (types.includes("country")) components.country = c.long_name;
            });
        }

        const formatted = result.formatted_address || result.name || "";
        const lat = markerPosition.lat;
        const lng = markerPosition.lng;

        const payload = {
            placeId: result.place_id,
            formattedAddress: formatted,
            rawAddress: formatted,
            components,
            location: {
                type: "Point",
                coordinates: [lng, lat],
            },
            label: "Business",
            isPrimary: true,
        };

        onConfirm(payload);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white w-full h-[90vh] sm:max-w-4xl sm:h-[80vh] rounded-t-xl sm:rounded-xl overflow-hidden flex flex-col shadow-2xl relative">

                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 relative">
                    <h2 className="text-lg font-bold uppercase tracking-wider">Select Location</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 relative flex flex-col min-h-0"> {/* min-h-0 ensures flex child shrinks properly */}

                    {/* Search Bar */}
                    <div className="absolute top-4 left-4 right-4 z-20 max-w-md w-auto sm:w-full mx-auto">
                        <div className="relative shadow-xl">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 z-30" />
                            <input
                                type="text"
                                placeholder="Search area..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black text-sm font-mono text-black bg-white placeholder-gray-400"
                            />

                            {predictions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl overflow-hidden max-h-60 overflow-y-auto z-30 border border-gray-100">
                                    {predictions.map((p) => (
                                        <button
                                            key={p.place_id}
                                            onClick={() => handlePredictionSelect(p.place_id, p.description)}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 text-xs border-b border-gray-100 last:border-0 text-gray-800 bg-white"
                                        >
                                            <span className="font-bold block text-black">{p.structured_formatting.main_text}</span>
                                            <span className="text-gray-500">{p.structured_formatting.secondary_text}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Map Area */}
                    <div className="flex-1 bg-gray-100 relative h-full">
                        {loadError && (
                            <div className="absolute inset-0 flex items-center justify-center text-red-500 p-4 text-center z-10 bg-white">
                                Error loading Google Maps. Please check API Key.
                            </div>
                        )}

                        {isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={{ width: '100%', height: '100%' }}
                                center={center}
                                zoom={15}
                                onLoad={onLoad}
                                onUnmount={onUnmount}
                                onClick={handleMapClick}
                                options={{
                                    disableDefaultUI: false,
                                    streetViewControl: false,
                                    mapTypeControl: false,
                                    fullscreenControl: false,
                                    zoomControl: true, // Enable zoom control for mobile usability
                                }}
                            >
                                <Marker
                                    position={markerPosition}
                                    draggable={true}
                                    onDragEnd={(e) => {
                                        if (e.latLng) {
                                            updateLocationFromCoordinates(e.latLng.lat(), e.latLng.lng());
                                        }
                                    }}
                                />
                            </GoogleMap>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500 z-10 bg-gray-100">
                                Loading Map...
                            </div>
                        )}

                        {/* Floating "Select This Location" Helper Button */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-max max-w-[90%]">
                            <button
                                onClick={() => {
                                    if (map && map.getCenter()) {
                                        const c = map.getCenter();
                                        if (c) updateLocationFromCoordinates(c.lat(), c.lng());
                                    }
                                }}
                                className="bg-white text-black px-4 py-2 rounded-full shadow-lg text-xs font-bold uppercase tracking-wider hover:bg-gray-50 border border-gray-200 w-full truncate"
                            >
                                Set Pin at Center
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-center z-50 relative gap-4 shrink-0 pb-6 sm:pb-4">
                    <div className="flex-1 w-full sm:mr-4 min-w-0">
                        <p className="text-xs text-gray-500 font-mono uppercase">Selected Address</p>
                        <p className="text-sm font-bold break-all line-clamp-2">
                            {selectedPlace ? selectedPlace.formatted_address : "No location selected"}
                        </p>
                    </div>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedPlace}
                        className={`w-full sm:w-auto px-6 py-3 text-xs uppercase font-bold tracking-widest text-white transition-colors shrink-0 ${selectedPlace ? 'bg-black hover:bg-[#10b981]' : 'bg-gray-300 cursor-not-allowed'}`}
                    >
                        Confirm Location
                    </button>
                </div>

            </div>
        </div >
    );
}
