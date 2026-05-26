"use client";

import React, { useState, useEffect } from "react";
import { 
    PhotoIcon, 
    ArrowUpTrayIcon, 
    ClipboardDocumentIcon, 
    TrashIcon, 
    MagnifyingGlassIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";
import { useUI } from "@/src/libs/Hooks/UIContext";
import axios from "axios";
import { AdminUrl } from "@/src/libs/utils/API/endpoints";

interface CloudinaryImage {
    url: string;
    public_id: string;
    format: string;
    created_at: string;
    bytes: number;
}

export default function MediaGalleryPage() {
    const { showToast, showModal } = useUI();
    const [images, setImages] = useState<CloudinaryImage[]>([]);
    const [filteredImages, setFilteredImages] = useState<CloudinaryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("all");
    const [newImage, setNewImage] = useState<{ file: File; preview: string } | null>(null);

    const fetchMedia = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("admin_token");
            const response = await axios.get(AdminUrl.getMedia, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data || [];
            setImages(data);
            setFilteredImages(data);
        } catch (error) {
            console.error("Failed to load Cloudinary media:", error);
            showToast("Failed to fetch Cloudinary media library", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedia();
    }, []);

    // Handle real-time filtering & searching
    useEffect(() => {
        let result = images;
        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase();
            result = result.filter(img => img.public_id.toLowerCase().includes(query));
        }
        if (selectedType !== "all") {
            result = result.filter(img => img.format.toLowerCase() === selectedType.toLowerCase());
        }
        setFilteredImages(result);
    }, [searchTerm, selectedType, images]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
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

        const formData = new FormData();
        formData.append("image", newImage.file);

        try {
            const token = localStorage.getItem("admin_token");
            await axios.post(AdminUrl.uploadMedia, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            showToast("Image uploaded to Cloudinary successfully!", "success");
            setNewImage(null);
            fetchMedia();
        } catch (error) {
            console.error("Upload failed:", error);
            showToast("Failed to upload image", "error");
        } finally {
            setUploading(false);
        }
    };

    const handleCopy = (url: string) => {
        navigator.clipboard.writeText(url);
        showToast("Secure URL copied to Clipboard!", "success");
    };

    const handleDelete = (public_id: string) => {
        showModal(
            "Purge Media Asset?",
            "Are you sure you want to permanently delete this image from your Cloudinary bucket? This action is irreversible.",
            "delete",
            async () => {
                try {
                    const token = localStorage.getItem("admin_token");
                    await axios.post(
                        AdminUrl.deleteMedia,
                        { public_id },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        }
                    );
                    setImages(prev => prev.filter(img => img.public_id !== public_id));
                    showToast("Asset purged successfully!", "success");
                } catch (error) {
                    console.error("Delete failed:", error);
                    showToast("Failed to delete media asset", "error");
                }
            }
        );
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const dm = 1;
        const sizes = ["Bytes", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-8 font-mono">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 border-b border-gray-200 pb-4">
                    <h1 className="text-2xl font-bold uppercase tracking-widest text-[#10b981]">Cloudinary Media</h1>
                    <p className="text-xs text-gray-400 mt-1">Upload, delete, and copy links for all dynamic catalog media assets.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Panel: Upload Area */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-gray-200 p-6 sticky top-8 rounded-none shadow-sm space-y-6">
                            <h2 className="text-xs font-bold uppercase flex items-center gap-2 text-[#059669]">
                                <ArrowUpTrayIcon className="w-4 h-4" />
                                Upload Asset
                            </h2>

                            <div className={`border-2 border-dashed transition-all duration-200 aspect-square flex flex-col items-center justify-center p-4 text-center cursor-pointer relative overflow-hidden group
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
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                            <span className="text-[10px] font-bold text-black bg-white/80 px-2 py-1 rounded">Change</span>
                                        </div>
                                    </>
                                ) : (
                                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                                        <PhotoIcon className="w-10 h-10 text-gray-300 mb-2" />
                                        <span className="text-[10px] font-bold text-gray-600">Click to Choose Image</span>
                                        <span className="text-[8px] text-gray-400 mt-1">Supports PNG, JPG, WEBP</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                                    </label>
                                )}
                            </div>

                            <button
                                onClick={handleUpload}
                                disabled={!newImage || uploading}
                                className="w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {uploading ? "Uploading to Cloudinary..." : "Upload to Cloudinary"}
                            </button>
                        </div>
                    </div>

                    {/* Right Panel: Media Gallery */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Filters Bar */}
                        <div className="bg-white border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative flex-1 w-full">
                                <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors font-mono"
                                    placeholder="Search assets by file name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <select
                                    className="w-full md:w-40 p-2 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors bg-white font-mono uppercase"
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                >
                                    <option value="all">All Formats</option>
                                    <option value="png">PNG</option>
                                    <option value="jpg">JPG / JPEG</option>
                                    <option value="webp">WEBP</option>
                                </select>
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10b981] mb-4"></div>
                                <p className="text-[10px] uppercase tracking-widest">Loading Media Assets...</p>
                            </div>
                        ) : (
                            <>
                                {/* Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    {filteredImages.map((img) => (
                                        <div key={img.public_id} className="group relative bg-white border border-gray-200 shadow-sm transition-all hover:shadow-md overflow-hidden flex flex-col">
                                            {/* Thumbnail Image */}
                                            <div className="aspect-square bg-gray-50 relative overflow-hidden flex items-center justify-center border-b border-gray-100">
                                                <img src={img.url} alt={img.public_id} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                
                                                {/* File Format Badge */}
                                                <div className="absolute top-2 left-2 z-10">
                                                    <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-sm border border-white/15">
                                                        {img.format}
                                                    </span>
                                                </div>

                                                {/* Action Overlays */}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleCopy(img.url)}
                                                        className="bg-white text-black p-2.5 rounded-full hover:bg-[#10b981] hover:text-white transition-all transform translate-y-3 group-hover:translate-y-0 duration-300"
                                                        title="Copy Secure URL"
                                                    >
                                                        <ClipboardDocumentIcon className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(img.public_id)}
                                                        className="bg-red-500 text-white p-2.5 rounded-full hover:bg-red-600 transition-all transform translate-y-3 group-hover:translate-y-0 duration-300"
                                                        title="Purge Asset"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Details Info */}
                                            <div className="p-3 bg-white flex-1 flex flex-col justify-between">
                                                <h3 className="text-[10px] font-bold text-gray-700 truncate font-mono uppercase" title={img.public_id}>
                                                    {img.public_id.replace(/^govigi\//, "")}
                                                </h3>
                                                <div className="flex justify-between items-center mt-2 border-t border-gray-100 pt-2 text-[8px] text-gray-400 font-mono">
                                                    <span>{formatBytes(img.bytes)}</span>
                                                    <span>{new Date(img.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Empty State */}
                                {filteredImages.length === 0 && (
                                    <div className="text-center py-24 bg-white border border-dashed border-gray-200">
                                        <PhotoIcon className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                                        <p className="text-[10px] uppercase tracking-widest text-gray-400">No matching media assets found</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
