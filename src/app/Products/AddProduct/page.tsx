"use client";

import React from "react";
import {
  ArrowLeftIcon,
  ShoppingBagIcon,
  UserPlusIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  OrderSummaryUrl,
  ProductManagementUrl,
} from "../../../libs/utils/API/endpoints";

export default function AddProduct() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    pricePerKg: "",
    stock: "",
    status: "active",
    image: null,
  });

  const [image, setImage] = useState(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage({
        file,
        url: URL.createObjectURL(file),
      });
      setFormData({ ...formData, image: file });
    }
  };

  // Handle image removal
  const removeImage = () => {
    setImage(null);
    setFormData({ ...formData, image: null });
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setImage({
        file,
        url: URL.createObjectURL(file),
      });
      setFormData({ ...formData, image: file });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const backend_url = OrderSummaryUrl.createProduct;

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("category", formData.category);
    payload.append("pricePerKg", formData.pricePerKg);
    payload.append("stock", formData.stock);
    payload.append("status", formData.status);
    payload.append("image", formData.image);

    fetch(backend_url, {
      method: "POST",
      body: payload,
    })
      .then((response) => {
        if (response.ok) {
          console.log("Product added successfully");
          router.push("/Products");
        } else {
          console.error("Error adding product");
        }
      })
      .catch((error) => {
        console.error("Network error:", error);
      });
  };

  return (
    <div className="p-6 mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="h-9 w-9 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">
            Add New Product
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm"
        >
          <ShoppingBagIcon className="h-5 w-5" />
          Add Product
        </button>
      </div>

      {/* Form Section */}
      <form className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <div className="h-5 w-1.5 bg-green-600 rounded-full"></div>
              Product Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  name="name"
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  required
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  name="category"
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  required
                >
                  <option value="">Select category</option>
                  <option value="fruits">Fruits</option>
                  <option value="vegetables">Vegetables</option>
                </select>
              </div>
            </div>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <div className="h-5 w-1.5 bg-green-600 rounded-full"></div>
              Pricing & Stock
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price per Kg
                </label>
                <input
                  type="number"
                  value={formData.pricePerKg}
                  name="pricePerKg"
                  onChange={(e) =>
                    setFormData({ ...formData, pricePerKg: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  required
                  placeholder="Enter price per Kg"
                  min="15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock (in Kg)
                </label>
                <input
                  type="text"
                  value={formData.stock}
                  name="stock"
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                  required
                  placeholder="Enter stock quantity"
                  min="10"
                />
              </div>
            </div>
          </section>
        </div>
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <div className="h-5 w-1.5 bg-green-600 rounded-full"></div>
              Product Image
            </h2>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className={`relative flex flex-col items-center justify-center w-full max-w-md p-8 rounded-xl border-2 border-dashed transition-all duration-300 ${
                image
                  ? "border-gray-300 bg-white"
                  : "border-gray-300 hover:border-green-400 hover:bg-green-50/50"
              }`}
            >
              {!image ? (
                <label
                  htmlFor="imageUpload"
                  className="flex flex-col items-center justify-center w-full cursor-pointer"
                >
                  <div className="flex flex-col items-center">
                    {/* Upload Icon */}
                    <div className="mb-4">
                      <ArrowUpTrayIcon className="h-12 w-12 text-gray-400" />
                    </div>

                    {/* Text */}
                    <p className="text-gray-700 font-medium mb-1">
                      Click or drag to upload
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      PNG, JPG, JPEG, WEBP (Max 20 MB)
                    </p>

                    {/* Upload Button */}
                    <span className="inline-flex items-center gap-2 text-sm bg-[#007e5d] text-white px-4 py-2 rounded-md hover:bg-[#005f4f] transition-colors duration-200 shadow-sm font-medium">
                      <ArrowUpTrayIcon className="h-5 w-5" />
                      Upload Image
                    </span>
                  </div>

                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="w-full">
                  {/* Image Preview */}
                  <div className="relative inline-block">
                    <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 shadow-md">
                      <img
                        src={image.url}
                        alt="Category Preview"
                        className="w-48 h-48 object-cover"
                      />
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={removeImage}
                      className="cursor-pointer absolute top-0 right-0 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110"
                      title="Remove image"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Keep upload option visible */}
                  <label
                    htmlFor="imageUploadReplace"
                    className="flex flex-col items-center justify-center w-full cursor-pointer mt-6"
                  >
                    <span className="inline-flex items-center gap-2 bg-[#007e5d] border border-gray-300 text-white px-4 py-2 rounded-md hover:bg-gray-50 transition-colors duration-200 font-medium text-sm">
                      <ArrowUpTrayIcon className="h-5 w-5" />
                      Replace Image
                    </span>
                    <input
                      id="imageUploadReplace"
                      type="file"
                      name="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Image Info */}
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                      {image.name || "Category Image"}
                    </p>
                    {image.size && (
                      <p className="text-xs text-gray-400 mt-1">
                        {(image.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}
