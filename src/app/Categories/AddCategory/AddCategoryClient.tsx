"use client";

import React, { useEffect, useState } from "react";
import { CategoryManagementUrl } from "@/src/libs/utils/API/endpoints";
import {
    ArrowLeftIcon,
    UserPlusIcon,
    ArrowUpTrayIcon,
    XMarkIcon,
    PlusCircleIcon,
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

    useEffect(() => {
        if (id) {
            fetchCategoryDetails(id);
        }
    }, [id]);

    const fetchCategoryDetails = async (catId: string) => {
        try {
            showLoader("Loading...");
            // Using getAll and filtering as we did for Products, unless improved.
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
        } else if (isEditMode && !formData.imageUrl) {
            // Handle case where image is removed? Check backend.
        }

        // Determine URL and Method
        // Endpoints: createCategory exists. updateCategory might exist or need ID.
        // Let's assume updateCategory needs ID in URL or body.
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

    const InputField = ({ label, value, onChange, placeholder, type = "text", disabled = false, required = false }: any) => (
        <div className="mb-4">
            <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-mono">{label}</label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                disabled={disabled || isViewMode}
                required={required}
                placeholder={isViewMode ? "" : placeholder}
                className={`block w-full border-b border-gray-300 bg-transparent py-2 px-0 text-sm focus:border-black focus:ring-0 focus:outline-none transition-colors placeholder-gray-300 font-mono ${disabled || isViewMode ? "text-gray-500 cursor-not-allowed" : "text-black"}`}
            />
        </div>
    );

    return (
        <div className="min-h-screen bg-white p-6 md:p-8 font-mono text-gray-900">
            <div className="w-full max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-12 border-b border-gray-200 pb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeftIcon className="h-4 w-4 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold uppercase tracking-widest text-black">
                                {isViewMode ? "Category Details" : isEditMode ? "Edit Category" : "Add Category"}
                            </h1>
                            <p className="text-xs text-gray-400 mt-1">
                                {isViewMode ? "View category info" : "Enter category information"}
                            </p>
                        </div>
                    </div>

                    {!isViewMode && (
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase text-gray-400 font-mono mb-1 tracking-wider">Status</span>
                                <div className="flex items-center border border-gray-900 bg-white">
                                    <button
                                        type="button"
                                        onClick={() => setFormData((prev: any) => ({ ...prev, categoryStatus: "active" }))}
                                        className={`px-6 py-2 text-xs uppercase tracking-widest font-bold transition-all ${formData.categoryStatus === "active"
                                            ? "bg-[#10b981] text-white"
                                            : "bg-white text-gray-400 hover:text-black hover:bg-gray-50"
                                            }`}
                                    >
                                        Active
                                    </button>
                                    <div className="w-[1px] h-full bg-gray-900"></div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData((prev: any) => ({ ...prev, categoryStatus: "inactive" }))}
                                        className={`px-6 py-2 text-xs uppercase tracking-widest font-bold transition-all ${formData.categoryStatus === "inactive"
                                            ? "bg-red-500 text-white"
                                            : "bg-white text-gray-400 hover:text-black hover:bg-gray-50"
                                            }`}
                                    >
                                        Inactive
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={handleSubmit}
                                className="bg-black text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-[#10b981] transition-colors h-[42px] self-end"
                            >
                                {isEditMode ? "Save Changes" : "Create Category"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Form */}
                <form className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* LEFT SIDE */}
                    <div className="md:col-span-2 space-y-12">
                        <div>
                            <h2 className="text-xs font-bold uppercase tracking-widest text-[#10b981] mb-6 border-l-4 border-[#10b981] pl-3">
                                01. General Information
                            </h2>
                            <div className="grid grid-cols-1 gap-6">
                                <InputField
                                    label="Category Name"
                                    value={formData.categoryName}
                                    onChange={(e: any) => setFormData({ ...formData, categoryName: e.target.value })}
                                    placeholder="ENTER NAME"
                                    required
                                />

                                <div className="mb-4">
                                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-mono">Description</label>
                                    <textarea
                                        value={formData.categoryDescription}
                                        onChange={(e) => setFormData({ ...formData, categoryDescription: e.target.value })}
                                        disabled={isViewMode}
                                        className={`block w-full border-b border-gray-300 bg-transparent py-2 px-0 text-sm focus:border-black focus:ring-0 focus:outline-none transition-colors placeholder-gray-300 font-mono ${isViewMode ? "text-gray-500 cursor-not-allowed" : "text-black"}`}
                                        rows={3}
                                        placeholder={isViewMode ? "" : "ENTER DESCRIPTION"}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE: IMAGE UPLOAD */}
                    <div>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-[#10b981] mb-6 border-l-4 border-[#10b981] pl-3">
                            02. Media
                        </h2>

                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className={`relative flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed transition-all duration-300 ${image
                                ? "border-gray-300 bg-white"
                                : isViewMode ? "border-gray-200 bg-gray-50" : "border-gray-300 hover:border-green-400 hover:bg-green-50/10"
                                }`}
                        >
                            {!image ? (
                                <label
                                    htmlFor="imageUpload"
                                    className={`flex flex-col items-center justify-center w-full h-full ${isViewMode ? "cursor-default" : "cursor-pointer"}`}
                                >
                                    <div className="flex flex-col items-center p-6 text-center">
                                        <div className="mb-4">
                                            <ArrowUpTrayIcon className="h-8 w-8 text-gray-400" />
                                        </div>
                                        {!isViewMode && (
                                            <>
                                                <p className="text-xs font-mono uppercase text-gray-500 mb-4">
                                                    DRAG & DROP OR CLICK
                                                </p>
                                                <span className="inline-flex items-center text-[10px] uppercase font-bold bg-[#007e5d] text-white px-4 py-2 hover:bg-[#005f4f] transition-colors">
                                                    UPLOAD IMAGE
                                                </span>
                                            </>
                                        )}
                                        {isViewMode && <p className="text-xs font-mono text-gray-400">NO IMAGE</p>}
                                    </div>

                                    <input
                                        id="imageUpload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        disabled={isViewMode}
                                    />
                                </label>
                            ) : (
                                <div className="w-full h-full relative group">
                                    <img
                                        src={image.url}
                                        alt="Category"
                                        className="w-full h-full object-cover"
                                    />
                                    {!isViewMode && (
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="bg-red-500 text-white p-2 rounded-none hover:bg-red-600 transition-colors"
                                            >
                                                <XMarkIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {image && (
                            <div className="mt-2 text-center">
                                <p className="text-[10px] font-mono uppercase text-gray-400">{image.name || "Image Selected"}</p>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}