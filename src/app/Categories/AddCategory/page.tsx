"use client";

import React from "react";
import { CategoryManagementUrl } from "@/src/libs/utils/API/endpoints";
import {
  ArrowLeftIcon,
  UserPlusIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AddCategory() {
  const router = useRouter();
  const backend_url = CategoryManagementUrl.createCategory;

  const [formData, setFormData] = useState<any>({
    categoryName: "",
    categoryDescription: "",
    categoryStatus: "active",
    categoryImage: null,
  });

  const [image, setImage] = useState<any>(null);

  // Handle image upload
  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setImage({
        file,
        url: URL.createObjectURL(file),
      });
      setFormData({ ...formData, categoryImage: file });
    }
  };

  // Handle image removal
  const removeImage = () => {
    setImage(null);
    setFormData({ ...formData, categoryImage: null });
  };

  // Handle drag and drop
  const handleDrop = (e: any) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setImage({
        file,
        url: URL.createObjectURL(file),
      });
      setFormData({ ...formData, categoryImage: file });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: any) => {
    console.log("Submitting form with data:", formData);

    e.preventDefault();
    const data = new FormData();
    data.append("categoryName", formData.categoryName);
    data.append("categoryDescription", formData.categoryDescription);
    data.append("categoryStatus", formData.categoryStatus);
    data.append("image", formData.categoryImage);
    try {
      const response = await fetch(backend_url, {
        method: "POST",
        body: data,
      });
      if (response.ok) {
        alert("Category added successfully!");
        router.push("/Categories");
      } else {
        const errorData = await response.json();
        alert(
          "Failed to add category: " + (errorData.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category. Please try again.");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="h-9 w-9 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-700" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">
            Add New Category
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm"
        >
          <UserPlusIcon className="h-5 w-5" />
          Add Category
        </button>
      </div>

      {/* Form */}
      <form className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* LEFT SIDE */}
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <div className="h-5 w-1.5 bg-green-600 rounded-full"></div>
              General Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={formData.categoryName}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryName: e.target.value })
                  }
                  className="w-full border text-sm border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.categoryStatus}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryStatus: e.target.value })
                  }
                  className="w-full border text-sm border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Description
                </label>
                <textarea
                  value={formData.categoryDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categoryDescription: e.target.value,
                    })
                  }
                  className="w-full border text-sm border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-400"
                  rows={2}
                  placeholder="Enter category description"
                ></textarea>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT SIDE: IMAGE UPLOAD */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <div className="h-5 w-1.5 bg-green-600 rounded-full"></div>
            Category Image
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
      </form>
    </div>
  );
}
