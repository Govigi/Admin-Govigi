"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  CloudArrowUpIcon,
  DocumentDuplicateIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { CategoryManagementUrl, OrderSummaryUrl } from "../../../libs/utils/API/endpoints";
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
  "h-11 w-full border border-gray-200 bg-gray-50/30 px-4 text-xs font-bold uppercase tracking-wider text-gray-900 outline-none transition placeholder:text-gray-300 focus:border-black focus:bg-white";

const selectClass =
  "h-11 w-full appearance-none border border-gray-200 bg-gray-50/30 px-4 pr-10 text-xs font-bold uppercase tracking-wider text-gray-900 outline-none transition focus:border-black focus:bg-white";

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
  const [images, setImages] = useState<ImageData[]>([]);

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchProductDetails(id);
    }
  }, [id]);

  const updateForm = (field: keyof FormState, value: FormState[keyof FormState]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(CategoryManagementUrl.getAllCategories);
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : data.categories || []);
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
      const product = data.products?.find((item: any) => item._id === productId);

      if (product) {
        setFormData((prev) => ({
          ...prev,
          name: product.name || "",
          sku: product.sku || "PRD0001",
          category: product.category?._id || product.category?.categoryName || product.category || "",
          subCategory: product.subCategory || "",
          description: product.description || "",
          pricePerKg: product.pricePerKg || "",
          mrp: product.mrp || "",
          costPrice: product.costPrice || "",
          maxOrderQuantity: product.maxOrderQuantity || "",
          trackStock: product.trackStock ?? true,
          vendor: product.vendor || "",
          productType: product.productType || "veggie",
          seasonal: product.seasonal || "no",
          countryOfOrigin: product.countryOfOrigin || "",
          unit: product.unit || "",
          status: product.status || "active",
          shelfLife: product.shelfLife || "",
          storageInstructions: product.storageInstructions || "",
          tags: Array.isArray(product.tags) ? product.tags.join(", ") : product.tags || "",
          currentStock: product.currentStock || "",
          minimumThreshold: product.minimumThreshold || "10",
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
      console.error("Save Error:", error.response?.data || error.message);
      showToast(error.response?.data?.message || "Failed to save product", "error");
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-8 font-inter text-gray-900 overflow-x-hidden">
      
      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-[0.2em] text-[#10b981]">
            {isViewMode ? "PRODUCT PROFILE" : isEditMode ? "MODIFY PRODUCT" : "CATALOGUE ENTRY"}
          </h1>
          <div className="mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <span>INVENTORY</span>
            <ChevronRightIcon className="h-3 w-3" />
            <span>PRODUCTS</span>
            <ChevronRightIcon className="h-3 w-3" />
            <span className="text-black">{isEditMode ? "EDIT" : "ADD"}</span>
          </div>
        </div>

        <button
          onClick={() => router.push("/product-management")}
          className="flex h-9 items-center gap-3 border border-gray-200 bg-white px-5 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black hover:border-black transition-all"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          DISCARD & EXIT
        </button>
      </div>

      <form className="grid grid-cols-1 gap-8 xl:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          
          <Panel className="p-8">
            <SectionTitle>Core Specifications</SectionTitle>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Field label="PRODUCT NAME" required>
                <input
                  value={formData.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  disabled={isViewMode}
                  className={inputClass}
                />
              </Field>

              <Field label="STOCK KEEPING UNIT (SKU)">
                <input value={formData.sku} disabled className={`${inputClass} opacity-50`} />
              </Field>

              <Field label="CATEGORY" required>
                <select 
                  value={formData.category} 
                  onChange={(e) => updateForm("category", e.target.value)} 
                  disabled={isViewMode} 
                  className={selectClass}
                >
                  <option value="">SELECT CATEGORY</option>
                  {categories.map((cat: any) => (
                    <option key={cat._id} value={cat._id || cat.categoryName || cat.name}>
                      {String(cat.categoryName || cat.name).toUpperCase()}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="SUB-CLASSIFICATION" optional>
                <select 
                  value={formData.subCategory} 
                  onChange={(e) => updateForm("subCategory", e.target.value)} 
                  disabled={isViewMode} 
                  className={selectClass}
                >
                  <option value="">SELECT SUB CATEGORY</option>
                  <option value="leafy-greens">LEAFY GREENS</option>
                  <option value="root-vegetables">ROOT VEGETABLES</option>
                  <option value="seasonal-produce">SEASONAL PRODUCE</option>
                </select>
              </Field>

              <div className="md:col-span-2">
                <Field label="TECHNICAL DESCRIPTION" optional>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateForm("description", e.target.value.slice(0, 300))}
                    disabled={isViewMode}
                    className="min-h-32 w-full border border-gray-200 bg-gray-50/30 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-900 outline-none transition focus:border-black focus:bg-white resize-none"
                  />
                  <div className="mt-2 text-right text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    {formData.description.length}/300 CHARACTERS
                  </div>
                </Field>
              </div>
            </div>
          </Panel>

          <Panel className="p-8">
            <SectionTitle>Commercial & Inventory</SectionTitle>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Field label="MEASUREMENT UNIT" required>
                <select 
                  value={formData.unit} 
                  onChange={(e) => updateForm("unit", e.target.value)} 
                  disabled={isViewMode} 
                  className={selectClass}
                >
                  <option value="">SELECT UNIT</option>
                  {unitOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </Field>

              <Field label="LISTING PRICE (₹)" required>
                <input
                  type="number"
                  value={formData.pricePerKg}
                  onChange={(e) => updateForm("pricePerKg", e.target.value)}
                  disabled={isViewMode}
                  className={inputClass}
                />
              </Field>

              <Field label="MAX RETAIL PRICE (₹)" optional>
                <input
                  type="number"
                  value={formData.mrp}
                  onChange={(e) => updateForm("mrp", e.target.value)}
                  disabled={isViewMode}
                  className={inputClass}
                />
              </Field>

              <Field label="ACQUISITION COST (₹)" optional>
                <input
                  type="number"
                  value={formData.costPrice}
                  onChange={(e) => updateForm("costPrice", e.target.value)}
                  disabled={isViewMode}
                  className={inputClass}
                />
              </Field>

              <Field label="CURRENT STOCK" required={formData.trackStock}>
                <input
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) => updateForm("currentStock", e.target.value)}
                  disabled={isViewMode}
                  className={inputClass}
                />
              </Field>

              <Field label="LOW STOCK ALERT (QTY)" optional>
                <input
                  type="number"
                  value={formData.minimumThreshold}
                  onChange={(e) => updateForm("minimumThreshold", e.target.value)}
                  disabled={isViewMode}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 flex items-center gap-4">
              <input
                type="checkbox"
                checked={formData.trackStock}
                onChange={(e) => updateForm("trackStock", e.target.checked)}
                disabled={isViewMode}
                className="h-4 w-4 border-gray-300 text-black focus:ring-black"
              />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900">Enable Automated Stock Monitoring</span>
            </div>
          </Panel>

          <Panel className="p-8">
            <SectionTitle>Technical & Lifecycle</SectionTitle>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Field label="SHELF LIFE (DAYS)" optional>
                <input
                  type="number"
                  value={formData.shelfLife}
                  onChange={(e) => updateForm("shelfLife", e.target.value)}
                  disabled={isViewMode}
                  className={inputClass}
                />
              </Field>

              <Field label="STORAGE GUIDELINES" optional>
                <input
                  value={formData.storageInstructions}
                  onChange={(e) => updateForm("storageInstructions", e.target.value)}
                  disabled={isViewMode}
                  className={inputClass}
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="METADATA TAGS" optional>
                  <input
                    value={formData.tags}
                    onChange={(e) => updateForm("tags", e.target.value)}
                    disabled={isViewMode}
                    placeholder="ENTER TAGS SEPARATED BY COMMAS..."
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>
          </Panel>
        </div>

        <aside className="space-y-8">
          <Panel className="p-8">
            <SectionTitle>Asset Upload</SectionTitle>
            <div
              onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
              onDragOver={(e) => e.preventDefault()}
              className="border border-dashed border-gray-200 bg-gray-50/30 p-8 text-center hover:border-black transition-all"
            >
              <label className={`flex flex-col items-center justify-center ${isViewMode ? "cursor-default" : "cursor-pointer"}`}>
                <CloudArrowUpIcon className="h-8 w-8 text-gray-300 mb-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900 mb-1">DROP MEDIA HERE</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">MAX 5 IMAGES (JPG, PNG)</span>
                {!isViewMode && (
                  <div className="mt-6 border border-black bg-white px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-black hover:bg-black hover:text-white transition-all">
                    BROWSE FILES
                  </div>
                )}
                <input type="file" multiple onChange={handleImageUpload} disabled={isViewMode} className="hidden" />
              </label>
            </div>

            <div className="mt-4 grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }).map((_, idx) => {
                const img = images[idx];
                return (
                  <div key={idx} className="aspect-square bg-gray-50 border border-gray-100 relative group overflow-hidden">
                    {img ? (
                      <>
                        <img src={img.url} className="w-full h-full object-cover" />
                        {!isViewMode && (
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-white p-1 shadow-xl opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200 font-bold">+</div>
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel className="p-8">
            <SectionTitle>Lifecycle Status</SectionTitle>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => updateForm("status", "active")}
                className={`flex-1 py-3 border text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
                  formData.status === "active" ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-gray-200 text-gray-400"
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => updateForm("status", "inactive")}
                className={`flex-1 py-3 border text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
                  formData.status === "inactive" ? "bg-amber-50 border-amber-500 text-amber-700" : "bg-white border-gray-200 text-gray-400"
                }`}
              >
                Archived
              </button>
            </div>
          </Panel>

          {!isViewMode && (
            <div className="grid grid-cols-1 gap-4">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full bg-black py-4 text-[11px] font-bold uppercase tracking-[0.3em] text-white shadow-2xl shadow-black/10 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3"
              >
                <PhotoIcon className="w-4 h-4" />
                {isEditMode ? "COMMIT UPDATES" : "FINALIZE ENTRY"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/product-management")}
                className="w-full border border-gray-200 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-black hover:border-black transition-all"
              >
                ABANDON CHANGES
              </button>
            </div>
          )}
        </aside>
      </form>
    </div>
  );
}
