"use client";

import React, { useState, useEffect } from "react";
import { BellIcon, PaperAirplaneIcon, UsersIcon, GlobeAsiaAustraliaIcon } from "@heroicons/react/24/outline";
import { useUI } from "@/src/libs/Hooks/UIContext";
import axios from "axios";
import { AdminUrl } from "@/src/libs/utils/API/endpoints";

interface Segment {
    _id: string;
    typeName: string;
    description?: string;
    discountPercentage?: number;
}

const VENDOR_BUSINESS_TYPES = [
    { value: "all", label: "Broadcast to All Vendors" },
    { value: "Retailer", label: "Retailer Vendors" },
    { value: "Wholesaler", label: "Wholesaler Vendors" },
    { value: "RETAIL_STORE", label: "Retail Store Vendors" },
    { value: "WHOLESALE", label: "Wholesale Vendors" },
    { value: "MANUFACTURER", label: "Manufacturer Vendors" },
    { value: "DISTRIBUTOR", label: "Distributor Vendors" },
    { value: "IMPORTER", label: "Importer Vendors" },
    { value: "EXPORTER", label: "Exporter Vendors" },
    { value: "SERVICE_PROVIDER", label: "Service Provider Vendors" },
    { value: "FARMER", label: "Farmer Vendors" },
    { value: "OTHER", label: "Other Vendors" }
];

export default function PushNotificationsPage() {
    const { showToast } = useUI();
    const [segments, setSegments] = useState<Segment[]>([]);
    const [loadingSegments, setLoadingSegments] = useState(true);
    const [sending, setSending] = useState(false);

    const [activeAudience, setActiveAudience] = useState<"customer" | "vendor">("customer");
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [selectedSegment, setSelectedSegment] = useState("all");
    const [imageUrl, setImageUrl] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [uploadingImage, setUploadingImage] = useState(false);
    const [existingImages, setExistingImages] = useState<any[]>([]);
    const [loadingImages, setLoadingImages] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const token = localStorage.getItem("admin_token");
            const formData = new FormData();
            formData.append("image", file);
            formData.append("folder", "govigi/notifications");

            const response = await axios.post(AdminUrl.uploadMedia, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });

            if (response.data?.url) {
                const newAsset = {
                    url: response.data.url,
                    public_id: response.data.public_id || `govigi/notifications/${Date.now()}`
                };
                setImageUrl(newAsset.url);
                setExistingImages((prev) => [newAsset, ...prev]);
                showToast("Image uploaded successfully to Cloudinary!", "success");
            } else {
                throw new Error("Invalid response format");
            }
        } catch (error: any) {
            console.error("Image upload failed:", error);
            showToast(error.response?.data?.message || "Failed to upload image asset", "error");
        } finally {
            setUploadingImage(false);
        }
    };

    // Fetch dynamic customer segments and existing notification banners on mount
    useEffect(() => {
        const fetchInitialData = async () => {
            const token = localStorage.getItem("admin_token");
            
            // 1. Fetch Segments
            try {
                setLoadingSegments(true);
                const response = await axios.get(AdminUrl.getAllCustomerTypes, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const fetchedData = response.data?.types || response.data;
                setSegments(Array.isArray(fetchedData) ? fetchedData : []);
            } catch (error) {
                console.error("Failed to load customer segments:", error);
            } finally {
                setLoadingSegments(false);
            }

            // 2. Fetch Banners inside "govigi/notifications"
            try {
                setLoadingImages(true);
                const response = await axios.get(AdminUrl.getMedia, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const filtered = (response.data || []).filter((item: any) =>
                    item.public_id?.startsWith("govigi/notifications")
                );
                setExistingImages(filtered);
            } catch (error) {
                console.error("Failed to load saved notification banners:", error);
            } finally {
                setLoadingImages(false);
            }
        };

        fetchInitialData();
    }, []);

    const handleBroadcast = async () => {
        if (!title.trim() || !body.trim()) {
            showToast("Title and Body are required", "error");
            return;
        }

        setSending(true);
        try {
            const token = localStorage.getItem("admin_token");
            const endpoint = activeAudience === "customer" ? AdminUrl.sendPushNotification : AdminUrl.sendVendorPushNotification;
            const response = await axios.post(
                endpoint,
                {
                    title: title.trim(),
                    body: body.trim(),
                    segmentId: selectedSegment,
                    imageUrl: imageUrl.trim() || undefined,
                    linkUrl: linkUrl.trim() || undefined
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            showToast(response.data?.message || "Notification broadcast successfully sent!", "success");
            setTitle("");
            setBody("");
            setSelectedSegment("all");
            setImageUrl("");
            setLinkUrl("");
        } catch (error: any) {
            console.error("Broadcast failed:", error);
            showToast(error.response?.data?.message || "Failed to broadcast notifications", "error");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-8 font-mono">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 border-b border-gray-200 pb-4">
                    <h1 className="text-2xl font-bold uppercase tracking-widest text-[#10b981]">Push Broadcasts</h1>
                    <p className="text-xs text-gray-400 mt-1">Compose and send real-time push notifications to customer devices globally.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Input Config Panel */}
                    <div className="lg:col-span-2">
                        <div className="bg-white border border-gray-200 p-6 rounded-none shadow-sm space-y-6">
                            <h2 className="text-sm font-bold uppercase flex items-center gap-2 text-[#059669]">
                                <BellIcon className="w-5 h-5" />
                                Compose Notification
                            </h2>

                            {/* Audience Switcher Tabs */}
                            <div className="flex border-b border-gray-200">
                                <button
                                    onClick={() => {
                                        setActiveAudience("customer");
                                        setSelectedSegment("all");
                                    }}
                                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all ${
                                        activeAudience === "customer"
                                            ? "border-[#10b981] text-[#10b981]"
                                            : "border-transparent text-gray-400 hover:text-gray-600"
                                    }`}
                                >
                                    Customer Audience
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveAudience("vendor");
                                        setSelectedSegment("all");
                                    }}
                                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all ${
                                        activeAudience === "vendor"
                                            ? "border-[#10b981] text-[#10b981]"
                                            : "border-transparent text-gray-400 hover:text-gray-600"
                                    }`}
                                >
                                    Vendor Audience
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Segment dropdown */}
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Target Audience</label>
                                    <div className="relative">
                                        {activeAudience === "customer" ? (
                                            <select
                                                className="w-full p-2.5 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors bg-white font-mono uppercase"
                                                value={selectedSegment}
                                                onChange={(e) => setSelectedSegment(e.target.value)}
                                            >
                                                <option value="all">Broadcast to All Customers</option>
                                                {loadingSegments ? (
                                                    <option disabled>Loading dynamic segments...</option>
                                                ) : (
                                                    segments.map((seg) => (
                                                        <option key={seg._id} value={seg._id}>
                                                            Segment: {seg.typeName.toUpperCase()} ({seg.discountPercentage}% OFF)
                                                        </option>
                                                    ))
                                                )}
                                            </select>
                                        ) : (
                                            <select
                                                className="w-full p-2.5 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors bg-white font-mono uppercase"
                                                value={selectedSegment}
                                                onChange={(e) => setSelectedSegment(e.target.value)}
                                            >
                                                {VENDOR_BUSINESS_TYPES.map((bt) => (
                                                    <option key={bt.value} value={bt.value}>
                                                        {bt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </div>

                                {/* Title Input */}
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Notification Title</label>
                                    <input
                                        type="text"
                                        maxLength={60}
                                        className="w-full p-2.5 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors font-mono"
                                        placeholder="e.g. Fresh Summer Fruits have arrived!"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                    <div className="text-right text-[9px] text-gray-400 mt-1">
                                        {title.length}/60 CHARS
                                    </div>
                                </div>

                                {/* Message Body Input */}
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Message Body</label>
                                    <textarea
                                        rows={4}
                                        maxLength={160}
                                        className="w-full p-2.5 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors font-mono resize-none"
                                        placeholder="e.g. Treat yourself to our organic, farm-fresh mangoes and strawberries with an extra 10% discount this weekend only!"
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                    />
                                    <div className="text-right text-[9px] text-gray-400 mt-1">
                                        {body.length}/160 CHARS
                                    </div>
                                </div>

                                 {/* Notification Image URL Input */}
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Notification Image URL (Optional)</label>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            className="w-full p-2.5 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors font-mono"
                                            placeholder="e.g. https://res.cloudinary.com/your-cloud/image/upload/v1234/mangoes.jpg"
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                        />
                                        
                                        {/* Direct File Uploader Selector */}
                                        <div className="border border-dashed border-gray-200 p-4 bg-gray-50/50 flex flex-col items-center justify-center">
                                            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-2 w-full text-left">Or Upload Image Directly</label>
                                            
                                            {uploadingImage ? (
                                                <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                                                    <svg className="animate-spin h-4 w-4 text-[#10b981]" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Uploading asset to Cloudinary...
                                                </div>
                                            ) : (
                                                <div className="w-full flex items-center justify-between gap-4">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        id="direct-notification-upload"
                                                        className="hidden"
                                                        onChange={handleImageUpload}
                                                    />
                                                    <label
                                                        htmlFor="direct-notification-upload"
                                                        className="cursor-pointer bg-white border border-gray-200 hover:border-[#10b981] px-4 py-2 text-[10px] uppercase font-bold text-gray-600 transition-colors inline-block font-mono"
                                                    >
                                                        Select File
                                                    </label>
                                                    
                                                    {imageUrl ? (
                                                        <div className="text-[10px] text-[#10b981] font-bold uppercase truncate max-w-[200px] flex items-center gap-1 font-mono">
                                                            ✓ Asset Linked
                                                        </div>
                                                    ) : (
                                                        <span className="text-[9px] text-gray-400 font-mono">JPG, PNG, WEBP max 5MB</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Selectable Gallery Grid of Saved Banners */}
                                    <div className="mt-3 border border-gray-200 p-4 bg-white space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] uppercase font-bold text-gray-400 block font-mono">Or Select from Saved Banners</label>
                                            {loadingImages && (
                                                <span className="text-[9px] text-gray-400 font-mono animate-pulse">Loading...</span>
                                            )}
                                        </div>
                                        
                                        {existingImages.length === 0 ? (
                                            <p className="text-[9px] text-gray-400 font-mono italic">No saved banners found inside "govigi/notifications" yet.</p>
                                        ) : (
                                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[140px] overflow-y-auto pr-1">
                                                {existingImages.map((img) => (
                                                    <button
                                                        key={img.public_id}
                                                        type="button"
                                                        onClick={() => setImageUrl(img.url)}
                                                        className={`aspect-[2/1] relative border group overflow-hidden bg-gray-50 focus:outline-none transition-all ${
                                                            imageUrl === img.url
                                                                ? "border-[#10b981] ring-1 ring-[#10b981]"
                                                                : "border-gray-200 hover:border-gray-400"
                                                        }`}
                                                    >
                                                        <img
                                                            src={img.url.replace("/upload/", "/upload/w_200,c_limit,q_auto,f_auto/")}
                                                            alt="Saved Banner"
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                            <span className="text-[8px] text-white font-bold uppercase tracking-wider font-mono">Use This</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <p className="text-[9px] text-gray-400 mt-2">Provide an image link, select a file, or choose from a saved banner to show a rich banner inside the push alert.</p>
                                </div>

                                {/* Deep Link Redirect URL Input */}
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">App Redirect Action Link (Optional)</label>
                                    <input
                                        type="text"
                                        className="w-full p-2.5 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors font-mono"
                                        placeholder="e.g. /category/organic or /product/12345"
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                    />
                                    <p className="text-[9px] text-gray-400 mt-1">Automatically redirects the customer when they tap the notification.</p>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={handleBroadcast}
                                disabled={sending || !title.trim() || !body.trim()}
                                className="w-full bg-black text-white py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <PaperAirplaneIcon className="w-4 h-4" />
                                {sending ? "Broadcasting message..." : "Send Broadcast Now"}
                            </button>
                        </div>
                    </div>

                    {/* Right: Live Preview Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-gray-200 p-6 rounded-none shadow-sm sticky top-8 flex flex-col items-center">
                            <h2 className="text-sm font-bold uppercase mb-6 flex items-center gap-2 text-gray-700 w-full">
                                <GlobeAsiaAustraliaIcon className="w-4 h-4 text-gray-400" />
                                Live Device Mockup
                            </h2>

                            {/* iOS / Smartphone Mock Frame */}
                            <div className="w-64 h-[420px] bg-slate-950 rounded-[36px] border-4 border-slate-800 relative shadow-xl overflow-hidden p-3 flex flex-col justify-start">
                                {/* Notch */}
                                <div className="w-24 h-4 bg-slate-900 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl z-20" />

                                {/* Mock Status Bar */}
                                <div className="flex justify-between items-center text-[8px] text-white/60 px-2 pt-1 font-sans">
                                    <span>9:41 AM</span>
                                    <div className="flex items-center gap-1">
                                        <span>5G</span>
                                        <div className="w-3 h-1.5 border border-white/60 rounded-sm" />
                                    </div>
                                </div>

                                {/* Mock Notification Center */}
                                <div className="mt-8 space-y-3 flex-1 flex flex-col justify-start">
                                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 shadow-lg text-white font-sans transition-all duration-300 transform scale-100">
                                        <div className="flex justify-between items-center mb-1 text-[8px] text-white/60">
                                            <div className="flex items-center gap-1">
                                                <div className="w-3.5 h-3.5 rounded bg-[#10b981] flex items-center justify-center text-white text-[7px] font-bold">G</div>
                                                <span className="font-bold tracking-wide uppercase text-[7px]">{activeAudience === "customer" ? "GOVIGI" : "GOVIGI VENDOR"}</span>
                                            </div>
                                            <span>now</span>
                                        </div>
                                        <p className="text-[10px] font-bold text-white leading-tight">
                                            {title.trim() || "Notification Title"}
                                        </p>
                                        <p className="text-[9px] text-white/80 mt-0.5 leading-snug">
                                            {body.trim() || "Your message body will be displayed in real time here on target mobile devices..."}
                                        </p>
                                        {imageUrl.trim() && (
                                            <div className="mt-2 w-full aspect-[2/1] rounded-lg overflow-hidden border border-white/10 bg-slate-900/50">
                                                <img src={imageUrl.trim()} alt="Push Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Lock Screen Clock & Date */}
                                <div className="absolute bottom-6 left-0 right-0 items-center justify-center flex flex-col text-white/40 text-[9px] font-sans">
                                    <span className="font-light">SWIPE UP TO UNLOCK</span>
                                    <div className="w-20 h-1 bg-white/40 rounded-full mt-2" />
                                </div>
                            </div>

                            {/* Extra Info */}
                            <div className="mt-6 text-center space-y-1 w-full border-t border-gray-100 pt-4">
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Notification Channels</p>
                                <p className="text-[9px] text-gray-500">{activeAudience === "customer" ? "Delivered via Expo Push Token Gateway." : "Delivered via Native FCM / Expo Gateway."}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
