"use client";

import React, { useState, useEffect } from "react";
import { ArrowUpTrayIcon, XMarkIcon, TrashIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { useUI } from "@/src/libs/Hooks/UIContext";

// Placeholder URL - will be replaced with real endpoint later
// Placeholder URL - will be replaced with real endpoint later
const API_URL = "http://localhost:5000/api/banner";

interface Banner {
    _id: string;
    imageUrl: string;
    isActive?: boolean;
}

export default function BannerPage() {
    const { showToast, showModal } = useUI();
    const [banners, setBanners] = useState<Banner[]>([]);
    const [uploading, setUploading] = useState(false);
    const [newImage, setNewImage] = useState<{ file: File, preview: string } | null>(null);

    // Initial Fetch
    useEffect(() => {
        // Will fetch real banners here
        // fetchBanners();

        // Mock data for UI preview
        setBanners([
            { _id: '1', imageUrl: 'https://via.placeholder.com/800x400/10b981/ffffff?text=Promo+1' },
            { _id: '2', imageUrl: 'https://via.placeholder.com/800x400/3b82f6/ffffff?text=Promo+2' },
        ]);
    }, []);

    const handleImageSelect = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewImage({
                file,
                preview: URL.createObjectURL(file)
            });
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setNewImage({
                file,
                preview: URL.createObjectURL(file)
            });
        }
    };

    const handleUpload = async () => {
        if (!newImage) return;
        setUploading(true);

        try {
            // Mock Upload Delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Add to local state for now
            setBanners(prev => [...prev, { _id: Date.now().toString(), imageUrl: newImage.preview }]);
            setNewImage(null);
            showToast("Banner uploaded successfully", "success");
        } catch (error) {
            showToast("Failed to upload banner", "error");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = (id: string) => {
        showModal(
            "Delete Banner?",
            "Are you sure you want to remove this banner from the mobile app?",
            "delete",
            () => {
                setBanners(prev => prev.filter(b => b._id !== id));
                showToast("Banner removed", "success");
            }
        );
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-8 font-mono">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold uppercase tracking-widest text-[#10b981]">Mobile Banners</h1>
                    <p className="text-xs text-gray-400 mt-1">Manage promotional banners visible on the mobile app home screen.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Upload Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-gray-200 p-6 sticky top-8 rounded-none shadow-sm">
                            <h2 className="text-sm font-bold uppercase mb-6 flex items-center gap-2 text-[#059669]">
                                <ArrowUpTrayIcon className="w-4 h-4" />
                                Upload New Banner
                            </h2>

                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed transition-all duration-200 aspect-video flex flex-col items-center justify-center p-4 text-center cursor-pointer relative overflow-hidden group
                                    ${newImage ? 'border-[#10b981] bg-emerald-50' : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'}`}
                            >
                                {newImage ? (
                                    <>
                                        <img src={newImage.preview} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                                        <div className="relative z-10 flex flex-col items-center">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setNewImage(null); }}
                                                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors mb-2"
                                            >
                                                <XMarkIcon className="w-5 h-5" />
                                            </button>
                                            <span className="text-xs font-bold text-black bg-white/80 px-2 py-1 rounded">Change Image</span>
                                        </div>
                                    </>
                                ) : (
                                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                                        <PhotoIcon className="w-12 h-12 text-gray-300 mb-3" />
                                        <span className="text-xs font-bold text-gray-600">Click or Drag Image Here</span>
                                        <span className="text-[10px] text-gray-400 mt-1">Rec: 800x400px (2:1 Ratio)</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
                                    </label>
                                )}
                            </div>

                            <button
                                onClick={handleUpload}
                                disabled={!newImage || uploading}
                                className="w-full mt-6 bg-black text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {uploading ? "Uploading..." : "Publish Banner"}
                            </button>
                        </div>
                    </div>

                    {/* Right: Gallery Grid */}
                    <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                            {banners.map((banner) => (
                                <div key={banner._id} className="group relative bg-white border border-gray-200 shadow-sm transition-all hover:shadow-md">
                                    <div className="aspect-[2/1] bg-gray-100 relative overflow-hidden">
                                        <img src={banner.imageUrl} alt="Banner" className="w-full h-full object-cover" />

                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                            <button
                                                onClick={() => handleDelete(banner._id)}
                                                className="bg-white text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300"
                                                title="Delete Banner"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-white border-t border-gray-100 flex justify-between items-center">
                                        <span className="text-[10px] uppercase text-gray-400 font-mono">ID: {banner._id.slice(-6)}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            <span className="text-[10px] font-bold text-green-600 uppercase">Active</span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {banners.length === 0 && (
                                <div className="text-center py-20 text-gray-400">
                                    <PhotoIcon className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                                    <p className="text-xs uppercase tracking-widest">No Active Banners</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
