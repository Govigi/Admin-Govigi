"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeftIcon,
  ShoppingBagIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { OrderSummaryUrl, CategoryManagementUrl } from "../../../libs/utils/API/endpoints";
import { useLoading } from "@/src/libs/Hooks/LoadingContext";
import { useUI } from "@/src/libs/Hooks/UIContext";

interface ImageData {
  file: File;
  url: string;
  name?: string;
  size?: number;
}




const InputField = ({ label, value, onChange, placeholder, type = "text", disabled = false, isViewMode = false }: any) => (
  <div className="mb-4">
    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-mono">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled || isViewMode}
      placeholder={isViewMode ? "" : placeholder}
      className={`block w-full border-b border-gray-300 bg-transparent py-2 px-0 text-sm focus:border-black focus:ring-0 focus:outline-none transition-colors placeholder-gray-300 font-mono ${disabled || isViewMode ? "text-gray-500 cursor-not-allowed" : "text-black"}`}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, disabled = false, isViewMode = false }: any) => (
  <div className="mb-4">
    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1 font-mono">{label}</label>
    <select
      value={value}
      onChange={onChange}
      disabled={disabled || isViewMode}
      className={`block w-full border-b border-gray-300 bg-transparent py-2 px-0 text-sm focus:border-black focus:ring-0 focus:outline-none transition-colors font-mono uppercase ${disabled || isViewMode ? "text-gray-500 cursor-not-allowed" : "text-black"}`}
    >
      <option value="">-- Select --</option>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

export default function AddProduct() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const mode = searchParams.get("mode");
  const isEditMode = !!id;
  const isViewMode = mode === "view";
  const { showToast } = useUI();

  const { showLoader, hideLoader } = useLoading ? useLoading() : { showLoader: () => { }, hideLoader: () => { } };

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    pricePerKg: "",
    stock: "",
    unit: "kg",
    status: "active",
    image: null as File | null,
    imageUrl: "", // For existing image URL
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [image, setImage] = useState<ImageData | null>(null);



  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchProductDetails(id);
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(CategoryManagementUrl.getAllCategories);
      if (res.ok) {
        const data = await res.json();
        const catList = Array.isArray(data) ? data : (data.categories || []);
        setCategories(catList);
      }
    } catch (error) {
      showToast(`Error fetching categories: ${error}`, "error");
    }
  };

  const fetchProductDetails = async (productId: string) => {
    try {
      showLoader("Loading details...");
      const res = await fetch(OrderSummaryUrl.getAllProducts);
      const data = await res.json();
      const product = data.products.find((p: any) => p._id === productId);

      if (product) {
        setFormData({
          name: product.name || "",
          category: product.category?._id || product.category || "",
          pricePerKg: product.pricePerKg || "",
          stock: product.stock || "",
          unit: product.unit || "kg",
          status: product.status || "active",
          image: null,
          imageUrl: product.image?.url || "",
        });
        if (product.image?.url) {
          setImage({
            file: new File([], "existing_image"), // Dummy
            url: product.image.url,
            name: "Existing Image",
          });
        }
      }

    } catch (err) {
      showToast(`Error fetching product: ${err}`, "error");
    } finally {
      hideLoader();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage({
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
      });
      setFormData({ ...formData, image: file });
    }
  };

  const removeImage = () => {
    setImage(null);
    setFormData({ ...formData, image: null, imageUrl: "" });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isViewMode) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setImage({
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
      });
      setFormData({ ...formData, image: file });
    }
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    showLoader(isEditMode ? "Updating Product..." : "Adding Product...");

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("category", formData.category);
    payload.append("pricePerKg", formData.pricePerKg);
    payload.append("stock", formData.stock);

    payload.append("status", formData.status);
    payload.append("unit", formData.unit);

    if (formData.image) {
      payload.append("image", formData.image);
    }

    const url = isEditMode
      ? `${OrderSummaryUrl.updateProduct}/${id}`
      : OrderSummaryUrl.createProduct;

    const method = isEditMode ? "PATCH" : "POST";

    fetch(url, {
      method: method,
      body: payload,
    })
      .then((response) => {
        if (response.ok) {
          router.push("/product-management");
        } else {
          showToast("Error saving product", "error");
        }
      })
      .catch((error) => {
        showToast("Network error:", "error");
      })
      .finally(() => {
        hideLoader();
      });
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 font-mono text-gray-900">
      <div className="w-full max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-gray-200 pb-6 gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold uppercase tracking-widest text-black">
                {isViewMode ? "Product Details" : isEditMode ? "Edit Product" : "Add Product"}
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                {isViewMode ? "View product info" : "Enter product information"}
              </p>
            </div>
          </div>

          {!isViewMode && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 w-full md:w-auto">
              <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
                <span className="text-[10px] uppercase text-gray-400 font-mono mb-1 tracking-wider">Status</span>
                <div className="flex items-center border border-gray-900 bg-white w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: "active" }))}
                    className={`flex-1 sm:flex-none px-6 py-2 text-xs uppercase tracking-widest font-bold transition-all ${formData.status === "active"
                      ? "bg-[#10b981] text-white"
                      : "bg-white text-gray-400 hover:text-black hover:bg-gray-50"
                      }`}
                  >
                    Active
                  </button>
                  <div className="w-[1px] h-full bg-gray-900"></div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, status: "inactive" }))}
                    className={`flex-1 sm:flex-none px-6 py-2 text-xs uppercase tracking-widest font-bold transition-all ${formData.status === "inactive"
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
                className="bg-black text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-[#10b981] transition-colors h-[42px] self-end sm:self-auto w-full sm:w-auto"
              >
                {isEditMode ? "Save Changes" : "Create Product"}
              </button>
            </div>
          )}
        </div>

        <form className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2 space-y-12">
            {/* General Info */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#10b981] mb-6 border-l-4 border-[#10b981] pl-3">
                01. General Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                <InputField
                  isViewMode={isViewMode}
                  label="Product Name"
                  value={formData.name}
                  onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ENTER NAME"
                />
                <SelectField
                  isViewMode={isViewMode}
                  label="Category"
                  value={formData.category}
                  onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
                  options={categories.map((cat: any) => ({
                    value: cat.categoryName,
                    label: cat.categoryName.toUpperCase()
                  }))}
                />
              </div>
            </div>

            {/* Pricing & Stock */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#10b981] mb-6 border-l-4 border-[#10b981] pl-3">
                02. Pricing & Stock
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-2">
                <InputField
                  isViewMode={isViewMode}
                  label="Price"
                  type="number"
                  value={formData.pricePerKg}
                  onChange={(e: any) => setFormData({ ...formData, pricePerKg: e.target.value })}
                  placeholder="0.00"
                />
                <SelectField
                  isViewMode={isViewMode}
                  label="Unit"
                  value={formData.unit}
                  onChange={(e: any) => setFormData({ ...formData, unit: e.target.value })}
                  options={[
                    { value: "kg", label: "Kg" },
                    { value: "g", label: "Gram" },
                    { value: "bunch", label: "Bunch" },
                    { value: "pcs", label: "Pieces" },
                    { value: "pack", label: "Pack" },
                    { value: "ltr", label: "Liter" },
                  ]}
                />
                <SelectField
                  isViewMode={isViewMode}
                  label="Stock Status"
                  value={formData.stock}
                  onChange={(e: any) => setFormData({ ...formData, stock: e.target.value })}
                  options={[
                    { value: "Available", label: "Available" },
                    { value: "Out of Stock", label: "Out of Stock" },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Image */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#10b981] mb-6 border-l-4 border-[#10b981] pl-3">
              03. Media
            </h2>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className={`relative flex flex-col items-center justify-center w-full max-w-sm mx-auto aspect-square border-2 border-dashed transition-all duration-300 ${image
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
                    accept=".jpg, .jpeg, .png"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isViewMode}
                  />
                </label>
              ) : (
                <div className="w-full h-full relative group">
                  <img
                    src={image.url}
                    alt="Product"
                    className="w-full h-full object-contain"
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
                <p className="text-[10px] font-mono uppercase text-gray-400">{image.name}</p>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
