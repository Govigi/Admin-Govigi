"use client";

import React, { useEffect, useState } from "react";
import { SubCategoryManagementUrl, CategoryManagementUrl } from "@/src/libs/utils/API/endpoints";
import {
    ArrowLeftIcon,
    ArrowUpTrayIcon,
    XMarkIcon,
    EyeIcon,
} from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { useLoading } from "@/src/libs/Hooks/LoadingContext";
import { useUI } from "@/src/libs/Hooks/UIContext";

export default function AddSubcategoryClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const mode = searchParams.get("mode");
    const isEditMode = !!id;
    const isViewMode = mode === "view";

    const { showLoader, hideLoader } = useLoading ? useLoading() : { showLoader: () => { }, hideLoader: () => { } };
    const { showToast } = useUI();

    const [categories, setCategories] = useState<any[]>([]);
    const [formData, setFormData] = useState<any>({
        subCategoryName: "",
        subCategoryDescription: "",
        subCategoryStatus: "active",
        category: "",
        subCategoryImage: null,
        imageUrl: "",
    });

    const [image, setImage] = useState<any>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const fetchCategories = async () => {
        try {
            const res = await fetch(CategoryManagementUrl.getAllCategories);
            if (res.ok) {
                const json = await res.json();
                const list = Array.isArray(json) ? json : json.categories || [];
                setCategories(list);
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    };

    const fetchSubCategoryDetails = async (subCatId: string) => {
        try {
            showLoader("Loading...");
            const res = await fetch(SubCategoryManagementUrl.getAllSubCategories);
            const json = await res.json();
            let data = [];
            if (Array.isArray(json)) data = json;
            else if (json.subCategories) data = json.subCategories;
            else if (json.data) data = json.data;

            const subcategory = data.find((c: any) => c._id === subCatId);
            if (subcategory) {
                const parentId = typeof subcategory.category === 'object' ? subcategory.category?._id : subcategory.category;
                setFormData({
                    subCategoryName: subcategory.subCategoryName || "",
                    subCategoryDescription: subcategory.subCategoryDescription || "",
                    subCategoryStatus: subcategory.subCategoryStatus || "active",
                    category: parentId || "",
                    subCategoryImage: null,
                    imageUrl: subcategory.subCategoryImage?.url || "",
                });
                if (subcategory.subCategoryImage?.url) {
                    setImage({
                        url: subcategory.subCategoryImage.url,
                        name: "Existing Image"
                    });
                }
            }
        } catch (err) {
            console.error("Error fetching subcategory details:", err);
            showToast("Failed to fetch subcategory details.", "error");
        } finally {
            hideLoader();
        }
    };

    useEffect(() => {
        fetchCategories();
        if (id) {
            fetchSubCategoryDetails(id);
        }
    }, [id]);

    const handleImageUpload = (e: any) => {
        const file = e.target.files[0];
        if (file) {
            setImage({
                file,
                url: URL.createObjectURL(file),
                name: file.name
            });
            setFormData({ ...formData, subCategoryImage: file });
        }
    };

    const removeImage = () => {
        setImage(null);
        setFormData({ ...formData, subCategoryImage: null, imageUrl: "" });
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
            setFormData({ ...formData, subCategoryImage: file });
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!formData.subCategoryName.trim()) {
            showToast("Subcategory Name is required", "error");
            return;
        }
        if (!formData.category) {
            showToast("Parent Category is required", "error");
            return;
        }

        showLoader(isEditMode ? "Updating..." : "Creating...");

        const data = new FormData();
        data.append("subCategoryName", formData.subCategoryName);
        data.append("subCategoryDescription", formData.subCategoryDescription);
        data.append("subCategoryStatus", formData.subCategoryStatus);
        data.append("category", formData.category);
        if (formData.subCategoryImage) {
            data.append("image", formData.subCategoryImage);
        }

        let url = SubCategoryManagementUrl.createSubCategory;
        let method = "POST";

        if (isEditMode) {
            url = `${SubCategoryManagementUrl.updateSubCategory}/${id}`;
            method = "PUT";
        }

        try {
            const response = await fetch(url, {
                method: method,
                body: data,
            });
            if (response.ok) {
                showToast(`Subcategory ${isEditMode ? "updated" : "created"} successfully!`, "success");
                router.push("/Subcategories");
            } else {
                const errorData = await response.json();
                console.error("Failed:", errorData);
                showToast("Failed to save subcategory.", "error");
            }
        } catch (error) {
            console.error("Error saving subcategory:", error);
            showToast("Error saving subcategory.", "error");
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
                        <h1 className="text-xl font-bold uppercase tracking-widest text-[#10b981]">
                            {isViewMode ? "Subcategory Profile" : isEditMode ? "Modify Subcategory" : "Create Subcategory"}
                        </h1>
                        <p className="text-xs text-gray-400 mt-1">Configure and manage sub-classifications for inventory catalogue.</p>
                    </div>

                    <button
                        onClick={() => router.push("/Subcategories")}
                        className="flex h-9 items-center gap-2 border border-gray-200 bg-white px-4 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black hover:border-black transition-all"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Discard & Exit
                    </button>
                </div>

                {/* Form Content */}
                <form className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Panel: Image Dropzone */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-gray-200 p-6">
                            <h2 className="text-sm font-bold uppercase mb-6 flex items-center gap-2 text-[#059669]">
                                Subcategory Image
                            </h2>

                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed aspect-square flex flex-col items-center justify-center p-6 text-center cursor-pointer relative overflow-hidden group mb-6
                                    ${image ? 'border-[#10b981] bg-emerald-50' : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'}`}
                            >
                                {image ? (
                                    <>
                                        <img src={image.url} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-10">
                                            <button
                                                type="button"
                                                onClick={() => setPreviewImage(image.url)}
                                                className="bg-white text-black p-2 rounded-full hover:bg-gray-100 transition-colors"
                                            >
                                                <EyeIcon className="w-5 h-5" />
                                            </button>
                                            {!isViewMode && (
                                                <button
                                                    type="button"
                                                    onClick={removeImage}
                                                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                                >
                                                    <XMarkIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                                        <ArrowUpTrayIcon className="w-12 h-12 text-gray-300 mb-4" />
                                        <span className="text-xs font-bold text-gray-600">Upload Subcategory Image</span>
                                        <span className="text-[10px] text-gray-400 mt-2 font-mono">PNG, JPG, WEBP (Square Recommended)</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isViewMode} />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Fields */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-gray-200 p-6">
                            <h2 className="text-sm font-bold uppercase mb-6 flex items-center gap-2 text-[#059669] border-b border-gray-100 pb-4">
                                General Details
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-2">Subcategory Name *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Milk & Dairy"
                                        value={formData.subCategoryName}
                                        onChange={(e) => setFormData({ ...formData, subCategoryName: e.target.value })}
                                        disabled={isViewMode}
                                        className="w-full p-3 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors uppercase font-bold text-black"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-2">Parent Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        disabled={isViewMode}
                                        className="w-full p-3 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors uppercase font-bold text-black bg-white"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat: any) => (
                                            <option key={cat._id} value={cat._id}>
                                                {String(cat.categoryName || cat.name).toUpperCase()}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-2">Description</label>
                                    <textarea
                                        placeholder="Write details about what this subcategory encompasses..."
                                        rows={4}
                                        value={formData.subCategoryDescription}
                                        onChange={(e) => setFormData({ ...formData, subCategoryDescription: e.target.value })}
                                        disabled={isViewMode}
                                        className="w-full p-3 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors uppercase font-bold text-black resize-none"
                                    />
                                </div>

                                {/* Status Toggle */}
                                <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Status</label>
                                        <span className={`text-xs font-bold uppercase tracking-wider ${formData.subCategoryStatus === "active" ? "text-emerald-600" : "text-amber-600"}`}>
                                            {formData.subCategoryStatus === "active" ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, subCategoryStatus: formData.subCategoryStatus === "active" ? "inactive" : "active" })}
                                        disabled={isViewMode}
                                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                                            formData.subCategoryStatus === "active" ? "bg-emerald-500" : "bg-gray-200"
                                        } ${isViewMode ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                                                formData.subCategoryStatus === "active" ? "translate-x-6" : "translate-x-1"
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        {!isViewMode && (
                            <div className="flex gap-4">
                                <button
                                    onClick={handleSubmit}
                                    className="flex-1 bg-black text-white hover:bg-emerald-600 py-4 text-xs font-bold uppercase tracking-widest transition-colors shadow-lg"
                                >
                                    {isEditMode ? "Save Changes" : "Create Subcategory"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.push("/Subcategories")}
                                    className="flex-1 border border-gray-250 hover:border-black text-gray-500 hover:text-black py-4 text-xs font-bold uppercase tracking-widest transition-colors bg-white"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </form>
            </div>

            {/* Preview Modal */}
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
                        <img src={previewImage} className="max-w-full max-h-[80vh] object-contain" alt="" />
                    </div>
                </div>
            )}
        </div>
    );
}
