import React from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

type MapSnapshotProps = {
    apiKey: string;
    lat: number;
    lng: number;
};

const LIBRARIES: any[] = ["places"];

export default function MapSnapshot({ apiKey, lat, lng }: MapSnapshotProps) {
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: apiKey,
        libraries: LIBRARIES
    });

    const center = { lat, lng };

    if (!isLoaded) {
        return (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center animate-pulse">
                <span className="text-xs text-gray-400 font-mono">Loading Map Preview...</span>
            </div>
        );
    }

    return (
        <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={center}
            zoom={16}
            options={{
                disableDefaultUI: false,
                draggable: true,
                gestureHandling: "greedy",
                disableDoubleClickZoom: false,
                keyboardShortcuts: false,
                clickableIcons: true,
                streetViewControl: true,
            }}
        >
            <Marker position={center} />
        </GoogleMap>
    );
}
