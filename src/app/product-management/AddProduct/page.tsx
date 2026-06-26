"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  CloudArrowUpIcon,
  DocumentDuplicateIcon,
  PhotoIcon,
  XMarkIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { CategoryManagementUrl, OrderSummaryUrl, SubCategoryManagementUrl } from "../../../libs/utils/API/endpoints";
import { useLoading } from "@/src/libs/Hooks/LoadingContext";
import { useUI } from "@/src/libs/Hooks/UIContext";
import axios from "axios";

interface ImageData {
  file?: File;
  url: string;
  name?: string;
  size?: number;
}

type FormState = {
  name: string;
  sku: string;
  category: string;
  subCategory: string;
  description: string;
  unit: string;
  pricePerKg: string;
  mrp: string;
  costPrice: string;
  maxOrderQuantity: string;
  trackStock: boolean;
  vendor: string;
  productType: "veggie" | "organic";
  seasonal: "yes" | "no";
  countryOfOrigin: string;
  status: "active" | "inactive";
  shelfLife: string;
  storageInstructions: string;
  tags: string;
  currentStock: string;
  minimumThreshold: string;
  image: File | null;
  imageUrl: string;
};

const unitOptions = [
  { value: "kg", label: "KG" },
  { value: "g", label: "GRAM" },
  { value: "bunch", label: "BUNCH" },
  { value: "pcs", label: "PIECES" },
  { value: "pack", label: "PACK" },
  { value: "ltr", label: "LITER" },
];

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`border border-gray-200 bg-white ${className}`}>{children}</section>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 border-b border-gray-100 pb-3">{children}</h2>;
}

function Field({
  label,
  required,
  optional,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-gray-400">
        {label} {required && <span className="text-red-500">*</span>} {optional && <span className="font-normal">(OPTIONAL)</span>}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "h-11 w-full border border-gray-200 bg-gray-55/30 px-4 text-xs font-bold uppercase tracking-wider text-gray-900 outline-none transition placeholder:text-gray-300 focus:border-black focus:bg-white";

const selectClass =
  "h-11 w-full appearance-none border border-gray-200 bg-gray-55/30 px-4 pr-10 text-xs font-bold uppercase tracking-wider text-gray-900 outline-none transition focus:border-black focus:bg-white";

export default function AddProduct() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const mode = searchParams.get("mode");
  const isEditMode = !!id;
  const isViewMode = mode === "view";
  const { showToast } = useUI();
  const { showLoader, hideLoader } = useLoading ? useLoading() : { showLoader: () => { }, hideLoader: () => { } };

  const [formData, setFormData] = useState<FormState>({
    name: "",
    sku: "PRD0001",
    category: "",
    subCategory: "",
    description: "",
    unit: "",
    pricePerKg: "",
    mrp: "",
    costPrice: "",
    maxOrderQuantity: "",
    trackStock: true,
    vendor: "",
    productType: "veggie",
    seasonal: "no",
    countryOfOrigin: "",
    status: "active",
    shelfLife: "",
    storageInstructions: "",
    tags: "",
    currentStock: "",
    minimumThreshold: "10",
    image: null,
    imageUrl: "",
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [images, setImages] = useState<ImageData[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
    if (id) {
      fetchProductDetails(id);
    }
  }, [id]);

  useEffect(() => {
    if (categories.length > 0 && formData.category) {
      const isIdValid = categories.some(c => c._id === formData.category);
      if (!isIdValid) {
        const matchedCat = categories.find(c => {
          const catName = String(c.categoryName || c.name || "").toUpperCase();
          const formCat = String(formData.category || "").toUpperCase();
          // If formCat looks like a MongoDB ID, don't use it for name-based lookup
          const isHexId = /^[0-9a-fA-F]{24}$/.test(formCat);
          if (isHexId) return false;
          return catName === formCat && formCat !== "";
        });
        
        if (matchedCat) {
          setFormData(prev => ({ ...prev, category: matchedCat._id }));
        }
      }
    }
  }, [categories, formData.category]);

  const updateForm = (field: keyof FormState, value: FormState[keyof FormState]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(CategoryManagementUrl.getAllCategories);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.categories || [];
        setCategories(list);
      }
    } catch (error) {
      showToast(`Error fetching categories: ${error}`, "error");
    }
  };

  const fetchSubCategories = async () => {
    try {
      const res = await fetch(SubCategoryManagementUrl.getAllSubCategories);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.subCategories || [];
        setSubCategories(list);
      }
    } catch (error) {
      showToast(`Error fetching subcategories: ${error}`, "error");
    }
  };

  const fetchProductDetails = async (productId: string) => {
    try {
      showLoader("Loading details...");
      const res = await fetch(`${OrderSummaryUrl.getAllProducts}?perPage=10000`);
      const data = await res.json();
      const product = data.products?.find((item: any) => item._id === productId);

      if (product) {
        const generatedSkuFallback = String(product.name || "PRD").replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() + String(product._id || "").slice(-3).toUpperCase();
        setFormData((prev) => ({
          ...prev,
          name: product.name || "",
          sku: product.sku || generatedSkuFallback,
          category: product.category?._id || product.category || "",
          subCategory: product.subCategory?._id || product.subCategory || "",
          description: product.description || "",
          pricePerKg: product.pricePerKg !== undefined && product.pricePerKg !== null ? String(product.pricePerKg) : "",
          mrp: product.mrp !== undefined && product.mrp !== null ? String(product.mrp) : "",
          costPrice: product.costPrice !== undefined && product.costPrice !== null ? String(product.costPrice) : "",
          maxOrderQuantity: product.maxOrderQuantity !== undefined && product.maxOrderQuantity !== null ? String(product.maxOrderQuantity) : "",
          trackStock: product.trackStock ?? true,
          vendor: product.vendor || "",
          productType: product.productType || "veggie",
          seasonal: product.seasonal || "no",
          countryOfOrigin: product.countryOfOrigin || "",
          unit: product.unit || "",
          status: product.status || "active",
          shelfLife: product.shelfLife !== undefined && product.shelfLife !== null ? String(product.shelfLife) : "",
          storageInstructions: product.storageInstructions || "",
          tags: Array.isArray(product.tags) ? product.tags.join(", ") : product.tags || "",
          currentStock: product.currentStock !== undefined && product.currentStock !== null ? String(product.currentStock) : "",
          minimumThreshold: product.minimumThreshold !== undefined && product.minimumThreshold !== null ? String(product.minimumThreshold) : "10",
          image: null,
          imageUrl: product.image?.url || "",
        }));

        if (product.image?.url) {
          setImages([{ url: product.image.url, name: "Existing Image" }]);
        }
      }
    } catch (error) {
      showToast(`Error fetching product: ${error}`, "error");
    } finally {
      hideLoader();
    }
  };

  const addFiles = (fileList: FileList | File[]) => {
    if (isViewMode) return;
    const incoming = Array.from(fileList)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, 5 - images.length)
      .map((file) => ({
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
      }));

    if (!incoming.length) return;

    setImages((prev) => {
      const nextImages = [...prev, ...incoming].slice(0, 5);
      const firstUpload = nextImages.find((image) => image.file)?.file || null;
      setFormData((current) => ({
        ...current,
        image: firstUpload,
        imageUrl: nextImages[0]?.url || "",
      }));
      return nextImages;
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(event.target.files);
  };

  const removeImage = (index: number) => {
    if (isViewMode) return;
    setImages((prev) => {
      const nextImages = prev.filter((_, imageIndex) => imageIndex !== index);
      const firstUpload = nextImages.find((image) => image.file)?.file || null;
      setFormData((current) => ({
        ...current,
        image: firstUpload,
        imageUrl: nextImages[0]?.url || "",
      }));
      return nextImages;
    });
  };

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (isViewMode) return;

    if (!formData.name?.trim()) {
      showToast("Product Name is required", "error");
      return;
    }
    if (!formData.category?.trim()) {
      showToast("Category is required", "error");
      return;
    }
    if (!formData.unit?.trim()) {
      showToast("Measurement Unit is required", "error");
      return;
    }
    if (!formData.pricePerKg?.trim() || isNaN(Number(formData.pricePerKg)) || Number(formData.pricePerKg) <= 0) {
      showToast("A valid Listing Price per Kg is required", "error");
      return;
    }
    if (!formData.currentStock?.trim() || isNaN(Number(formData.currentStock)) || Number(formData.currentStock) < 0) {
      showToast("A valid Current Stock quantity is required", "error");
      return;
    }

    showLoader(isEditMode ? "Updating Product..." : "Adding Product...");

    try {
      const token = localStorage.getItem("admin_token");
      const payload = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "image" && key !== "imageUrl") {
          payload.append(key, String(value));
        }
      });

      if (formData.image) {
        payload.append("image", formData.image);
      }

      const url = isEditMode ? `${OrderSummaryUrl.updateProduct}/${id}` : OrderSummaryUrl.createProduct;
      const method = isEditMode ? "patch" : "post";

      await axios({
        method,
        url,
        data: payload,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });

      showToast(`Product ${isEditMode ? "updated" : "created"} successfully`, "success");
      router.push("/product-management");
    } catch (error: any) {
      console.error("Save Error:", error);
      if (error.response?.data) {
        console.error("Response Data:", error.response.data);
      }
      const serverMsg = error.response?.data?.message || error.response?.data?.error?.message;
      showToast(serverMsg || error.message || "Failed to save product", "error");
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="h-full lg:h-full bg-gray-50/50 p-4 lg:p-6 lg:pb-4 font-mono text-gray-900 overflow-hidden flex flex-col">
      <div className="max-w-7xl w-full mx-auto flex flex-col flex-1 min-h-0 overflow-hidden">
        
        {/* Page Header */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-3 shrink-0">
          <div>
            <h1 className="text-lg font-bold uppercase tracking-widest text-[#10b981]">
              {isViewMode ? "PRODUCT PROFILE" : isEditMode ? "MODIFY PRODUCT" : "CATALOGUE ENTRY"}
            </h1>
            <p className="text-[10px] text-gray-400 mt-0.5">Configure and manage product listing, specifications, and stock status.</p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/product-management")}
            className="flex h-8 items-center gap-3 border border-gray-200 bg-white px-4 text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-black hover:border-black transition-all"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" />
            DISCARD & EXIT
          </button>
        </div>

        <form className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 lg:overflow-hidden">
          
          {/* Left Column: Asset Upload & Quick Status */}
          <div className="lg:col-span-1 lg:h-full lg:flex lg:flex-col lg:overflow-hidden">
            <div className="bg-white border border-gray-200 p-5 lg:h-full lg:overflow-y-auto rounded-none shadow-sm">
              <h2 className="text-sm font-bold uppercase mb-6 flex items-center gap-2 text-[#059669]">
                <PhotoIcon className="w-4 h-4" />
                Asset & Status Configuration
              </h2>

              {/* Main Image Selector / Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
                className={`border-2 border-dashed transition-all duration-200 aspect-video flex flex-col items-center justify-center p-4 text-center cursor-pointer relative overflow-hidden group mb-6
                  ${images[0] ? 'border-[#10b981] bg-emerald-50' : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'}`}
              >
                {images[0] ? (
                  <>
                    <img src={images[0].url} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    {/* Hover Actions Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-10">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setPreviewImage(images[0].url); }}
                        className="bg-white text-black p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center shadow-lg"
                        title="View Large"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      {!isViewMode && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeImage(0); }}
                          className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors flex items-center justify-center shadow-lg"
                          title="Remove Image"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    {/* Minimal Label when NOT hovered */}
                    <div className="absolute bottom-2 left-2 z-10 bg-white/95 px-2 py-0.5 border border-gray-200 group-hover:opacity-0 transition-opacity duration-200">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-gray-900 font-mono">Primary Image</span>
                    </div>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                    <CloudArrowUpIcon className="w-12 h-12 text-gray-300 mb-3" />
                    <span className="text-xs font-bold text-gray-600">Click or Drag Primary Image</span>
                    <span className="text-[10px] text-gray-400 mt-1">Square ratio recommended</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isViewMode} />
                  </label>
                )}
              </div>

              {/* Secondary Thumbnails */}
              <div className="grid grid-cols-5 gap-2 mb-6">
                {Array.from({ length: 5 }).map((_, idx) => {
                  const img = images[idx];
                  return (
                    <div key={idx} className="aspect-square bg-gray-50 border border-gray-100 relative group overflow-hidden flex items-center justify-center">
                      {img ? (
                        <>
                          <img src={img.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-10">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setPreviewImage(img.url); }}
                              className="bg-white text-black p-1 hover:bg-gray-100 transition-colors flex items-center justify-center shadow-md"
                              title="View Large"
                            >
                              <EyeIcon className="w-3.5 h-3.5" />
                            </button>
                            {!isViewMode && (
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="bg-red-500 text-white p-1 hover:bg-red-600 transition-colors flex items-center justify-center shadow-md"
                                title="Remove"
                              >
                                <XMarkIcon className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <label className={`w-full h-full flex items-center justify-center text-gray-300 font-bold text-sm ${isViewMode ? 'cursor-default' : 'cursor-pointer'}`}>
                          +
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isViewMode} />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Lifecycle Status Toggle */}
              <div className="flex items-center justify-between border-t border-b border-gray-100 py-4 mt-6">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Lifecycle Status</label>
                  <span className={`text-xs font-bold uppercase tracking-wider ${formData.status === "active" ? "text-emerald-600" : "text-amber-600"}`}>
                    {formData.status === "active" ? "Active" : "Archived"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => updateForm("status", formData.status === "active" ? "inactive" : "active")}
                  disabled={isViewMode}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                    formData.status === "active" ? "bg-emerald-500" : "bg-gray-200"
                  } ${isViewMode ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      formData.status === "active" ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Action Buttons */}
              {!isViewMode && (
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 bg-black text-white py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    {isEditMode ? "Commit Updates" : "Publish Product"}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/product-management")}
                    className="flex-1 border border-gray-200 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-black hover:border-black transition-colors text-center"
                  >
                    Abandon Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Columns: Specifications Forms Grouped Cleanly */}
          <div className="lg:col-span-2 lg:h-full lg:overflow-y-auto pr-2 space-y-6 scrollbar-thin">
            
            {/* Core Specifications */}
            <div className="bg-white border border-gray-200 p-6 rounded-none shadow-sm">
              <h2 className="text-sm font-bold uppercase mb-6 flex items-center gap-2 text-[#059669] border-b border-gray-100 pb-3">
                Core Specifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Product Name *</label>
                  <input
                    type="text"
                    className="w-full p-2 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors font-mono uppercase font-bold"
                    placeholder="e.g. Fresh Red Apple"
                    value={formData.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      updateForm("name", newName);
                      if (!isEditMode) {
                        const namePart = String(newName).replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase();
                        const randomPart = Math.floor(100 + Math.random() * 900);
                        const generatedSku = namePart ? `${namePart}${randomPart}` : "PRD0001";
                        updateForm("sku", generatedSku);
                      }
                    }}
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Stock Keeping Unit (SKU)</label>
                  <input
                    type="text"
                    className="w-full p-2 text-xs border border-gray-200 focus:border-[#10b981] outline-none font-mono uppercase font-bold bg-gray-50/30"
                    value={formData.sku}
                    onChange={(e) => updateForm("sku", e.target.value)}
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Category *</label>
                  <select
                    className="w-full p-2 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors bg-white font-mono uppercase font-bold"
                    value={formData.category}
                    onChange={(e) => updateForm("category", e.target.value)}
                    disabled={isViewMode}
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
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Sub-Classification</label>
                  {(() => {
                    const activeSubCategories = subCategories.filter((sub: any) => {
                      const catId = typeof sub.category === 'object' ? sub.category?._id : sub.category;
                      return catId === formData.category;
                    });
                    if (activeSubCategories.length > 0) {
                      return (
                        <select
                          className="w-full p-2 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors bg-white font-mono uppercase font-bold text-black"
                          value={formData.subCategory}
                          onChange={(e) => updateForm("subCategory", e.target.value)}
                          disabled={isViewMode}
                        >
                          <option value="">Select Sub Category</option>
                          {activeSubCategories.map((sub: any) => (
                            <option key={sub.id || sub._id} value={sub.id || sub._id}>
                              {String(sub.subCategoryName || sub.name).toUpperCase()}
                            </option>
                          ))}
                        </select>
                      );
                    } else {
                      return (
                        <input
                          type="text"
                          className="w-full p-2 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors font-mono uppercase font-bold text-black bg-gray-50/50"
                          placeholder="No subcategories found for category"
                          value=""
                          disabled
                        />
                      );
                    }
                  })()}
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Technical Description</label>
                  <textarea
                    className="w-full min-h-24 p-2 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors font-mono uppercase font-bold resize-none"
                    placeholder="Describe product quality, details, and features..."
                    value={formData.description}
                    onChange={(e) => updateForm("description", e.target.value.slice(0, 500))}
                    maxLength={500}
                    disabled={isViewMode}
                  />
                  <div className="mt-1 text-right text-[9px] font-bold text-gray-300 tracking-wider">
                    {formData.description.length}/500 CHARACTERS
                  </div>
                </div>
              </div>
            </div>

            {/* Commercial & Inventory */}
            <div className="bg-white border border-gray-200 p-6 rounded-none shadow-sm">
              <h2 className="text-sm font-bold uppercase mb-6 flex items-center gap-2 text-[#059669] border-b border-gray-100 pb-3">
                Commercial & Inventory
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Measurement Unit *</label>
                  <select
                    className="w-full p-2 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors bg-white font-mono uppercase font-bold"
                    value={formData.unit}
                    onChange={(e) => updateForm("unit", e.target.value)}
                    disabled={isViewMode}
                  >
                    <option value="">Select Unit</option>
                    {unitOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Listing Price (₹) *</label>
                  <input
                    type="number"
                    className="w-full p-2 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors font-mono uppercase font-bold"
                    placeholder="0.00"
                    value={formData.pricePerKg}
                    onChange={(e) => updateForm("pricePerKg", e.target.value)}
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Max Retail Price (MRP ₹)</label>
                  <input
                    type="number"
                    className="w-full p-2 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors font-mono uppercase font-bold"
                    placeholder="0.00"
                    value={formData.mrp}
                    onChange={(e) => updateForm("mrp", e.target.value)}
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Acquisition Cost (₹)</label>
                  <input
                    type="number"
                    className="w-full p-2 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors font-mono uppercase font-bold"
                    placeholder="0.00"
                    value={formData.costPrice}
                    onChange={(e) => updateForm("costPrice", e.target.value)}
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Current Stock *</label>
                  <input
                    type="number"
                    className="w-full p-2 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors font-mono uppercase font-bold"
                    placeholder="0"
                    value={formData.currentStock}
                    onChange={(e) => updateForm("currentStock", e.target.value)}
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Low Stock Alert Quantity</label>
                  <input
                    type="number"
                    className="w-full p-2 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors font-mono uppercase font-bold"
                    placeholder="10"
                    value={formData.minimumThreshold}
                    onChange={(e) => updateForm("minimumThreshold", e.target.value)}
                    disabled={isViewMode}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-6 pt-6 border-t border-gray-100">
                <input
                  type="checkbox"
                  id="trackStock"
                  className="accent-[#10b981]"
                  checked={formData.trackStock}
                  onChange={(e) => updateForm("trackStock", e.target.checked)}
                  disabled={isViewMode}
                />
                <label htmlFor="trackStock" className="text-[10px] uppercase font-bold text-gray-600 cursor-pointer">Enable Automated Stock Monitoring</label>
              </div>
            </div>

            {/* Technical & Lifecycle */}
            <div className="bg-white border border-gray-200 p-6 rounded-none shadow-sm">
              <h2 className="text-sm font-bold uppercase mb-6 flex items-center gap-2 text-[#059669] border-b border-gray-100 pb-3">
                Technical & Lifecycle
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Shelf Life (Days)</label>
                  <input
                    type="number"
                    className="w-full p-2 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors font-mono uppercase font-bold"
                    placeholder="3"
                    value={formData.shelfLife}
                    onChange={(e) => updateForm("shelfLife", e.target.value)}
                    disabled={isViewMode}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Storage Guidelines</label>
                  <input
                    type="text"
                    className="w-full p-2 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors font-mono uppercase font-bold"
                    placeholder="e.g. Keep refrigerated"
                    value={formData.storageInstructions}
                    onChange={(e) => updateForm("storageInstructions", e.target.value)}
                    disabled={isViewMode}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Metadata Tags</label>
                  <input
                    type="text"
                    className="w-full p-2 text-xs border border-gray-200 focus:border-[#10b981] outline-none transition-colors font-mono uppercase font-bold"
                    placeholder="ENTER TAGS SEPARATED BY COMMAS..."
                    value={formData.tags}
                    onChange={(e) => updateForm("tags", e.target.value)}
                    disabled={isViewMode}
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
