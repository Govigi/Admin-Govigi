"use client";

import React, { useEffect, useState } from "react";
import { CategoryManagementUrl } from "@/src/libs/utils/API/endpoints";
import {
    ArrowLeftIcon,
    ArrowUpTrayIcon,
    XMarkIcon,
    PlusCircleIcon,
    EyeIcon,
} from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { useLoading } from "@/src/libs/Hooks/LoadingContext";
import { useUI } from "@/src/libs/Hooks/UIContext";

export default function AddCategory() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const mode = searchParams.get("mode");
    const isEditMode = !!id;
    const isViewMode = mode === "view";

    const { showLoader, hideLoader } = useLoading ? useLoading() : { showLoader: () => { }, hideLoader: () => { } };
    const { showToast } = useUI();

    const [formData, setFormData] = useState<any>({
        categoryName: "",
        categoryDescription: "",
        categoryStatus: "active",
        categoryImage: null,
        imageUrl: "",
    });

    const [image, setImage] = useState<any>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchCategoryDetails(id);
        }
    }, [id]);

    const fetchCategoryDetails = async (catId: string) => {
        try {
            showLoader("Loading...");
            const res = await fetch(CategoryManagementUrl.getAllCategories);
            const json = await res.json();
            let data = [];
            if (Array.isArray(json)) data = json;
            else if (json.categories) data = json.categories;
            else if (json.data) data = json.data;

            const category = data.find((c: any) => c._id === catId);
            if (category) {
                setFormData({
                    categoryName: category.categoryName || "",
                    categoryDescription: category.categoryDescription || "",
                    categoryStatus: category.categoryStatus || "active",
                    categoryImage: null,
                    imageUrl: category.categoryImage?.url || "",
                });
                if (category.categoryImage?.url) {
                    setImage({
                        url: category.categoryImage.url,
                        name: "Existing Image"
                    });
                }
            }
        } catch (err) {
            console.error("Error fetching details:", err);
            showToast("Failed to fetch category details.", "error");
        } finally {
            hideLoader();
        }
    };

    const handleImageUpload = (e: any) => {
        const file = e.target.files[0];
        if (file) {
            setImage({
                file,
                url: URL.createObjectURL(file),
                name: file.name
            });
            setFormData({ ...formData, categoryImage: file });
        }
    };

    const removeImage = () => {
        setImage(null);
        setFormData({ ...formData, categoryImage: null, imageUrl: "" });
    };

    const handleDrop = (e: any) => {
        e.preventDefault();
        if (isViewMode) return;
        const file = e.dataTransfer.files[0];
        if (file) {
            setImage({
                file,
                url: URL.createObjectURL(file),
                name: file.name
            });
            setFormData({ ...formData, categoryImage: file });
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        showLoader(isEditMode ? "Updating..." : "Creating...");

        const data = new FormData();
        data.append("categoryName", formData.categoryName);
        data.append("categoryDescription", formData.categoryDescription);
        data.append("categoryStatus", formData.categoryStatus);
        if (formData.categoryImage) {
            data.append("image", formData.categoryImage);
        }

        let url = CategoryManagementUrl.createCategory;
        let method = "POST";

        if (isEditMode) {
            url = `${CategoryManagementUrl.updateCategory}/${id}`;
            method = "PUT";
        }

        try {
            const response = await fetch(url, {
                method: method,
                body: data,
            });
            if (response.ok) {
                showToast(`Category ${isEditMode ? "updated" : "created"} successfully!`, "success");
                router.push("/Categories");
            } else {
                const errorData = await response.json();
                console.error("Failed:", errorData);
                showToast("Failed to save category.", "error");
            }
        } catch (error) {
            console.error("Error saving category:", error);
            showToast("Error saving category.", "error");
        } finally {
            hideLoader();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-8 font-mono text-gray-900 overflow-x-hidden">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-6">
                    <div>
                        <h1 className="text-2xl font-bold uppercase tracking-widest text-[#10b981]">
                            {isViewMode ? "CATEGORY DETAILS" : isEditMode ? "EDIT CATEGORY" : "ADD CATEGORY"}
                        </h1>
                        <p className="text-xs text-gray-400 mt-1">Configure and manage catalogue categories, descriptions, and active status.</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.push("/Categories")}
                        className="flex h-9 items-center gap-3 border border-gray-200 bg-white px-5 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black hover:border-black transition-all"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        DISCARD & EXIT
                    </button>
                </div>

                {/* Form Wrapper */}
                <form className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Asset Upload & Quick Status */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white border border-gray-200 p-6 sticky top-8 rounded-none shadow-sm">
                            <h2 className="text-sm font-bold uppercase mb-6 flex items-center gap-2 text-[#059669]">
                                <PlusCircleIcon className="w-4 h-4" />
                                Asset & Status Configuration
                            </h2>

                            {/* Main Image Dropzone */}
                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed transition-all duration-200 aspect-video flex flex-col items-center justify-center p-4 text-center cursor-pointer relative overflow-hidden group mb-6
                                    ${image ? 'border-[#10b981] bg-emerald-50' : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'}`}
                            >
                                {image ? (
                                    <>
                                        <img src={image.url} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        {/* Hover Actions Overlay */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-10">
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setPreviewImage(image.url); }}
                                                className="bg-white text-black p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center shadow-lg"
                                                title="View Large"
                                            >
                                                <EyeIcon className="w-5 h-5" />
                                            </button>
                                            {!isViewMode && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); removeImage(); }}
                                                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors flex items-center justify-center shadow-lg"
                                                    title="Remove Image"
                                                >
                                                    <XMarkIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                        {/* Minimal Label when NOT hovered */}
                                        <div className="absolute bottom-2 left-2 z-10 bg-white/95 px-2 py-0.5 border border-gray-200 group-hover:opacity-0 transition-opacity duration-200">
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-900 font-mono">Category Image</span>
                                        </div>
                                    </>
                                ) : (
                                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                                        <ArrowUpTrayIcon className="w-12 h-12 text-gray-300 mb-3" />
                                        <span className="text-xs font-bold text-gray-600">Click or Drag Category Image</span>
                                        <span className="text-[10px] text-gray-400 mt-1">Recommended ratio: aspect-video</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isViewMode} />
                                    </label>
                                )}
                            </div>

                            {/* Lifecycle Status Toggle */}
                            <div className="space-y-4">
                                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Lifecycle Status</label>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData((prev: any) => ({ ...prev, categoryStatus: "active" }))}
                                        disabled={isViewMode}
                                        className={`flex-1 py-3 border text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
                                            formData.categoryStatus === "active" ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-bold" : "bg-white border-gray-200 text-gray-400"
                                        }`}
                                    >
                                        Active
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData((prev: any) => ({ ...prev, categoryStatus: "inactive" }))}
                                        disabled={isViewMode}
                                        className={`flex-1 py-3 border text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
                                            formData.categoryStatus === "inactive" ? "bg-amber-50 border-amber-500 text-amber-700 font-bold" : "bg-white border-gray-200 text-gray-400"
                                        }`}
                                    >
                                        Inactive
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {!isViewMode && (
                                <div className="mt-6 space-y-3">
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        className="w-full bg-black text-white py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isEditMode ? "Commit Updates" : "Publish Category"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => router.push("/Categories")}
                                        className="w-full border border-gray-200 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-black hover:border-black transition-colors"
                                    >
                                        Abandon Changes
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Specification Forms Grouped Cleanly */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-gray-200 p-6 rounded-none shadow-sm">
                            <h2 className="text-sm font-bold uppercase mb-6 flex items-center gap-2 text-[#059669] border-b border-gray-100 pb-3">
                                Category Information
                            </h2>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Category Name *</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors font-mono uppercase font-bold"
                                        placeholder="e.g. Fruits"
                                        value={formData.categoryName}
                                        onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                                        disabled={isViewMode}
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Description</label>
                                    <textarea
                                        className="w-full min-h-32 p-2 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors font-mono uppercase font-bold resize-none"
                                        placeholder="Enter category description..."
                                        value={formData.categoryDescription}
                                        onChange={(e) => setFormData({ ...formData, categoryDescription: e.target.value })}
                                        disabled={isViewMode}
                                        rows={4}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </form>
            </div>
            {previewImage && (
                <div 
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] bg-white p-2 border border-gray-200" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={() => setPreviewImage(null)}
                            className="absolute -top-10 right-0 bg-white/10 hover:bg-white/20 text-white p-2 border border-white/20 transition-all font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                        >
                            <XMarkIcon className="w-4 h-4" /> Close
                        </button>
                        <img src={previewImage} className="max-w-full max-h-[80vh] object-contain" alt="Large Preview" />
                    </div>
                </div>
            )}
        </div>
    );
}