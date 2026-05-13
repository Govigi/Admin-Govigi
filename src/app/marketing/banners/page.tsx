"use client";

import React, { useState, useEffect } from "react";
import { ArrowUpTrayIcon, XMarkIcon, TrashIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { useUI } from "@/src/libs/Hooks/UIContext";
import axios from "axios";

interface Banner {
    _id: string;
    bannerImage: {
        url: string;
        public_id: string;
    };
    altText?: string;
    link?: string;
    type?: string;
    weight?: string;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
}

export default function BannerPage() {
    const { showToast, showModal } = useUI();
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [newImage, setNewImage] = useState<{ file: File, preview: string } | null>(null);

    const [formData, setFormData] = useState({
        altText: "",
        link: "",
        type: "",
        weight: "0",
        startDate: "",
        endDate: "",
        isActive: true
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/banners`);
            setBanners(response.data);
        } catch (error: any) {
            console.error('Error fetching banners:', error);
            showToast("Failed to load banners", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

        const data = new FormData();
        data.append("image", newImage.file);
        data.append("altText", formData.altText);
        data.append("link", formData.link);
        data.append("type", formData.type);
        data.append("weight", formData.weight);
        data.append("startDate", formData.startDate);
        data.append("endDate", formData.endDate);
        data.append("isActive", String(formData.isActive));

        try {
            await axios.post(`${API_URL}/banners`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            showToast("Banner published successfully", "success");
            setNewImage(null);
            setFormData({
                altText: "",
                link: "",
                type: "",
                weight: "0",
                startDate: "",
                endDate: "",
                isActive: true
            });
            fetchBanners();
        } catch (error: any) {
            console.error('Error uploading banner:', error);
            showToast(error.response?.data?.message || "Failed to upload banner", "error");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = (id: string) => {
        showModal(
            "Delete Banner?",
            "Are you sure you want to remove this banner? This action cannot be undone.",
            "delete",
            async () => {
                try {
                    await axios.delete(`${API_URL}/banners/${id}`);
                    setBanners(prev => prev.filter(b => b._id !== id));
                    showToast("Banner removed", "success");
                } catch (error: any) {
                    showToast("Failed to delete banner", "error");
                }
            }
        );
    };

    const handleToggleStatus = async (id: string) => {
        try {
            const response = await axios.patch(`${API_URL}/banners/${id}/toggle`);
            setBanners(prev => prev.map(b => b._id === id ? response.data : b));
            showToast("Status updated", "success");
        } catch (error: any) {
            showToast("Failed to update status", "error");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-8 font-mono">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold uppercase tracking-widest text-[#10b981]">Marketing Banners</h1>
                    <p className="text-xs text-gray-400 mt-1">Manage promotional banners visible on the mobile app home screen.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Upload & Details Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-gray-200 p-6 sticky top-8 rounded-none shadow-sm">
                            <h2 className="text-sm font-bold uppercase mb-6 flex items-center gap-2 text-[#059669]">
                                <ArrowUpTrayIcon className="w-4 h-4" />
                                Banner Configuration
                            </h2>

                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed transition-all duration-200 aspect-video flex flex-col items-center justify-center p-4 text-center cursor-pointer relative overflow-hidden group mb-6
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

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Alt Text (Accessibility)</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors"
                                        placeholder="e.g. Summer Sale 50% Off"
                                        value={formData.altText}
                                        onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Deep Link / URL</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors"
                                        placeholder="e.g. /category/fruits or https://..."
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Type</label>
                                        <select
                                            className="w-full p-2 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors bg-white"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="">Main Banner</option>
                                            <option value="promo">Promo Section</option>
                                            <option value="footer">Footer Banner</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Display Weight</label>
                                        <input
                                            type="number"
                                            className="w-full p-2 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors"
                                            placeholder="0"
                                            value={formData.weight}
                                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            className="w-full p-2 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">End Date</label>
                                        <input
                                            type="date"
                                            className="w-full p-2 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 py-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        className="accent-[#10b981]"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    <label htmlFor="isActive" className="text-[10px] uppercase font-bold text-gray-600 cursor-pointer">Set as Active Immediately</label>
                                </div>
                            </div>

                            <button
                                onClick={handleUpload}
                                disabled={!newImage || uploading}
                                className="w-full mt-6 bg-black text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {uploading ? "Uploading to Cloudinary..." : "Publish Banner"}
                            </button>
                        </div>
                    </div>

                    {/* Right: Gallery Grid */}
                    <div className="lg:col-span-2">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10b981] mb-4"></div>
                                <p className="text-[10px] uppercase tracking-widest">Loading Banners...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {banners.map((banner) => (
                                    <div key={banner._id} className="group relative bg-white border border-gray-200 shadow-sm transition-all hover:shadow-md overflow-hidden">
                                        <div className="aspect-[2.5/1] bg-gray-100 relative overflow-hidden">
                                            <img src={banner.bannerImage.url} alt={banner.altText} className="w-full h-full object-cover" />

                                            {/* Status Badge */}
                                            <div className="absolute top-4 left-4 z-10">
                                                <div className={`px-2 py-1 flex items-center gap-1.5 backdrop-blur-md border ${banner.isActive ? 'bg-green-500/10 border-green-500/50 text-green-600' : 'bg-gray-500/10 border-gray-500/50 text-gray-600'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${banner.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                                    <span className="text-[8px] font-bold uppercase tracking-wider">{banner.isActive ? 'Active' : 'Inactive'}</span>
                                                </div>
                                            </div>

                                            {/* Overlay Actions */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                <button
                                                    onClick={() => handleToggleStatus(banner._id)}
                                                    className="bg-white text-black px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-[#10b981] hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                                                >
                                                    {banner.isActive ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(banner._id)}
                                                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                                                    title="Delete Banner"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-4 flex flex-col md:flex-row justify-between md:items-center gap-2">
                                            <div className="space-y-1">
                                                <h3 className="text-xs font-bold text-gray-800">{banner.altText || "No Alt Text Provided"}</h3>
                                                <p className="text-[10px] text-gray-400 font-mono flex items-center gap-2">
                                                    <span className="bg-gray-100 px-1 rounded">TYPE: {banner.type || "MAIN"}</span>
                                                    <span className="bg-gray-100 px-1 rounded">LINK: {banner.link || "N/A"}</span>
                                                    <span className="bg-gray-100 px-1 rounded">WEIGHT: {banner.weight || 0}</span>
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[9px] uppercase text-gray-300 font-mono">Created: {new Date(banner.startDate || (banner as any).createdAt).toLocaleDateString()}</span>
                                                {banner.endDate && (
                                                    <span className="text-[9px] uppercase text-red-300 font-mono">Expires: {new Date(banner.endDate).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {banners.length === 0 && (
                                    <div className="text-center py-20 bg-white border border-dashed border-gray-200">
                                        <PhotoIcon className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                                        <p className="text-[10px] uppercase tracking-widest text-gray-400">No Banners Configured</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
