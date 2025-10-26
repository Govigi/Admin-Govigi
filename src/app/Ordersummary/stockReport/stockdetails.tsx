"use client";

import React from "react";
import { useState, useMemo, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";
import { BarsArrowDownIcon } from "@heroicons/react/24/outline";
import { FaCircle, FaExclamationTriangle, FaTimesCircle } from "react-icons/fa";
import { OrderSummaryUrl } from "@/src/libs/utils/API/endpoints";
import { FaTrash } from "react-icons/fa";

const ITEMS_PER_PAGE = 10;

function AddStockModal({ open, onClose, onSubmit, loading }) {
  const [form, setForm] = useState<any>({
    name: "",
    category: "",
    currentStock: "",
    minimumThreshold: "",
    stock: "",
    pricePerKg: "",
    file: null,
  });
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    const errs: any = {};
    if (!form.name) errs.name = "Product name is required";
    if (!form.category) errs.category = "Category is required";
    if (!form.currentStock || isNaN(form.currentStock))
      errs.currentStock = "Current stock is required and must be a number";
    if (!form.minimumThreshold || isNaN(form.minimumThreshold))
      errs.minimumThreshold =
        "Minimum threshold is required and must be a number";
    if (!form.stock) errs.stock = "Stock status is required";
    if (!form.pricePerKg || isNaN(form.pricePerKg))
      errs.pricePerKg = "Price per Kg is required and must be a number";
    if (!form.file) errs.file = "Product image is required (JPG or PNG)";
    else if (form.file && !["image/jpeg", "image/png"].includes(form.file.type))
      errs.file = "Only JPG or PNG images are allowed";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setForm({ ...form, file: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form, setForm);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/10">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-lg font-bold mb-4">Add Stock</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Product Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            />
            {errors.name && (
              <div className="text-red-500 text-xs">{errors.name}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            >
              <option value="">Select category</option>
              <option value="Vegetable">Vegetable</option>
              <option value="Fruits">Fruits</option>
              <option value="Others">Others</option>
            </select>
            {errors.category && (
              <div className="text-red-500 text-xs">{errors.category}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">
              Current Stock (Kg)
            </label>
            <input
              name="currentStock"
              value={form.currentStock}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
              type="number"
            />
            {errors.currentStock && (
              <div className="text-red-500 text-xs">{errors.currentStock}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">
              Minimum Threshold (Kg)
            </label>
            <input
              name="minimumThreshold"
              value={form.minimumThreshold}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
              type="number"
            />
            {errors.minimumThreshold && (
              <div className="text-red-500 text-xs">
                {errors.minimumThreshold}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Stock Status</label>
            <select
              name="stock"
              value={form.stock}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
            >
              <option value="">Select status</option>
              <option value="Available">Available</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
            {errors.stock && (
              <div className="text-red-500 text-xs">{errors.stock}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">
              Price Per Kg (₹)
            </label>
            <input
              name="pricePerKg"
              value={form.pricePerKg}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
              type="number"
            />
            {errors.pricePerKg && (
              <div className="text-red-500 text-xs">{errors.pricePerKg}</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">
              Product Image{" "}
              <span className="text-red-500">(Upload JPG or PNG)</span>
            </label>
            <input
              name="file"
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleChange}
              className="w-full"
            />
            {errors.file && (
              <div className="text-red-500 text-xs">{errors.file}</div>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded mt-2"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Stock"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function StockDetails() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  // Helper to fetch all products
  const fetchProducts = async () => {
    try {
      const res = await fetch(OrderSummaryUrl.getAllProducts, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error(`Error! status: ${res.status}`);
      const json = await res.json();
      setProducts(json.products);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    setLoading(false);
  }, []);

  const filteredData = useMemo(() => {
    return products
      .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
      .filter((item) => (category ? item.category === category : true))
      .filter((item) =>
        status
          ? status === "In Stock"
            ? item.status === "Sufficient"
            : item.status === status
          : true
      );
  }, [products, search, category, status]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const currentData = filteredData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const renderStatusIcon = (status) => {
    if (status === "Available")
      return <FaCircle className="text-green-500 text-xs" />;
    // if (status === "Low Stock") return <FaExclamationTriangle className="text-yellow-500 text-sm" />;
    if (status === "Out of Stock")
      return <FaTimesCircle className="text-red-500 text-sm" />;
  };

  const exportToCSV = () => {
    const csv = [
      [
        "Product Name",
        "Category",
        "Current Stock",
        "Min Threshold",
        "Status",
        "Last Updated",
      ],
      ...filteredData.map((item) => [
        item.name,
        item.category,
        item.currentStock,
        item.minThreshold,
        item.status,
        item.lastUpdated,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "stock_report.csv";
    link.click();
  };

  const handleAddStock = async (form, resetForm) => {
    setAddLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("category", form.category);
      formData.append("currentStock", form.currentStock);
      formData.append("minimumThreshold", form.minimumThreshold);
      formData.append("stock", form.stock);
      formData.append("pricePerKg", form.pricePerKg);
      formData.append("image", form.file);
      const res = await fetch(OrderSummaryUrl.createProduct, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error("Failed to add product: " + errorText);
      }
      resetForm({
        name: "",
        category: "",
        currentStock: "",
        minimumThreshold: "",
        stock: "",
        pricePerKg: "",
        file: null,
      });
      setShowAddModal(false);
      await fetchProducts(); // Refresh products after add
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setAddLoading(false);
    }
  };

  // Edit modal state
  const [editProduct, setEditProduct] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  function EditStockModal({ open, onClose, product, onSubmit, loading }) {
    const [form, setForm] = useState(
      product || {
        name: "",
        category: "",
        currentStock: "",
        minimumThreshold: "",
        stock: "",
        pricePerKg: "",
        file: null,
        _id: "",
      }
    );
    const [errors, setErrors] = useState<any>({});
    useEffect(() => {
      if (product) setForm(product);
    }, [product]);
    const validate = () => {
      const errs: any = {};
      if (!form.name) errs.name = "Product name is required";
      if (!form.category) errs.category = "Category is required";
      if (!form.currentStock || isNaN(form.currentStock))
        errs.currentStock = "Current stock is required and must be a number";
      if (!form.minimumThreshold || isNaN(form.minimumThreshold))
        errs.minimumThreshold =
          "Minimum threshold is required and must be a number";
      if (!form.stock) errs.stock = "Stock status is required";
      if (!form.pricePerKg || isNaN(form.pricePerKg))
        errs.pricePerKg = "Price per Kg is required and must be a number";
      setErrors(errs);
      return Object.keys(errs).length === 0;
    };
    const handleChange = (e) => {
      const { name, value, files } = e.target;
      if (name === "file") {
        setForm({ ...form, file: files[0] });
      } else {
        setForm({ ...form, [name]: value });
      }
    };
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validate()) return;
      await onSubmit(form, setForm);
    };
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/10">
        <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
          <button
            className="absolute top-2 right-2 text-gray-500"
            onClick={onClose}
          >
            &times;
          </button>
          <h2 className="text-lg font-bold mb-4">Edit Stock</h2>
          <form
            onSubmit={handleSubmit}
            className="space-y-3"
            encType="multipart/form-data"
          >
            <div>
              <label className="block text-sm font-medium">Product Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
              />
              {errors.name && (
                <div className="text-red-500 text-xs">{errors.name}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
              >
                <option value="">Select category</option>
                <option value="Vegetable">Vegetable</option>
                <option value="Fruits">Fruits</option>
                <option value="Others">Others</option>
              </select>
              {errors.category && (
                <div className="text-red-500 text-xs">{errors.category}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">
                Current Stock (Kg)
              </label>
              <input
                name="currentStock"
                value={form.currentStock}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
                type="number"
              />
              {errors.currentStock && (
                <div className="text-red-500 text-xs">
                  {errors.currentStock}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">
                Minimum Threshold (Kg)
              </label>
              <input
                name="minimumThreshold"
                value={form.minimumThreshold}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
                type="number"
              />
              {errors.minimumThreshold && (
                <div className="text-red-500 text-xs">
                  {errors.minimumThreshold}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Stock Status</label>
              <select
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
              >
                <option value="">Select status</option>
                <option value="Available">Available</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
              {errors.stock && (
                <div className="text-red-500 text-xs">{errors.stock}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">
                Price Per Kg (₹)
              </label>
              <input
                name="pricePerKg"
                value={form.pricePerKg}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
                type="number"
              />
              {errors.pricePerKg && (
                <div className="text-red-500 text-xs">{errors.pricePerKg}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">
                Product Image{" "}
                <span className="text-gray-500">
                  (Upload JPG or PNG to update)
                </span>
              </label>
              <input
                name="file"
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleChange}
                className="w-full"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded mt-2"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Stock"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleEditStock = async (form, resetForm) => {
    setEditLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("category", form.category);
      formData.append("currentStock", form.currentStock);
      formData.append("minimumThreshold", form.minimumThreshold);
      formData.append("stock", form.stock);
      formData.append("pricePerKg", form.pricePerKg);
      if (form.file) formData.append("image", form.file);
      const res = await fetch(`${OrderSummaryUrl.updateProduct}/${form._id}`, {
        method: "PATCH",
        body: formData,
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error("Failed to update product: " + errorText);
      }
      resetForm({});
      setEditProduct(null);
      await fetchProducts(); // Refresh products after update
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteProduct = async (productId, public_id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    setDeleteLoadingId(productId);
    try {
      const res = await fetch(`${OrderSummaryUrl.deleteProduct}/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ public_id }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error("Failed to delete product: " + errorText);
      }
      await fetchProducts(); // Refresh products after delete
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-sm p-4 m-3 text-gray-700">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className="font-bold text-xl">Stock Report</h2>

          <div className="relative w-64">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Product..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm"
            />
          </div>

          <select
            className="border text-sm rounded px-3 py-2"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Categories</option>
            <option value="Vegetable">Vegetables</option>
            <option value="Fruits">Fruits</option>
            <option value="Others">Others</option>
          </select>

          <select
            className="border text-sm rounded px-3 py-2"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Stock Status</option>
            <option value="Available">In Stock</option>
            {/* <option value="Low Stock">Low Stock</option> */}
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded text-sm"
            onClick={() => setShowAddModal(true)}
          >
            + Add Stock
          </button>
          <button
            onClick={exportToCSV}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded text-sm flex items-center gap-1"
          >
            <ArrowDownTrayIcon className="h-5 w-5 text-gray-700" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 mt-4"></div>

      <div className="mt-4 overflow-x-auto">
        <table className="table-auto w-full text-sm border-collapse">
          <thead className="bg-gray-100 text-gray-700 text-left">
            <tr>
              <th className="p-2">Product</th>
              <th className="p-2">Category</th>
              <th className="p-2">Stock</th>
              <th className="p-2">Min Threshold</th>
              <th className="p-2">Status</th>
              <th className="p-2">Last Updated</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-6">
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-4 h-4 border-4 border-dotted border-gray-400 rounded-full animate-spin"></div>
                    <span>Loading orders...</span>
                  </div>
                </td>
              </tr>
            ) : currentData.length > 0 ? (
              currentData.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 ">
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.category}</td>
                  <td className="p-2">{item.currentStock} Kg</td>
                  <td className="p-2">{item.minimumThreshold} Kg</td>
                  <td className="p-2 flex items-center gap-2">
                    {renderStatusIcon(item.stock)}
                    {item.stock}
                  </td>
                  <td className="p-2">
                    {item.timestamp
                      ? `${new Date(item.timestamp).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          }
                        )} ${new Date(item.timestamp).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true,
                          }
                        )}`
                      : ""}
                  </td>
                  <td className="p-2 flex gap-3 items-center">
                    <span
                      className="text-blue-600 cursor-pointer"
                      onClick={() => setEditProduct(item)}
                    >
                      View / Edit
                    </span>
                    <button
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      onClick={() =>
                        handleDeleteProduct(item._id, item.public_id)
                      }
                      disabled={deleteLoadingId === item._id}
                      title="Delete Product"
                    >
                      {deleteLoadingId === item._id ? (
                        <span className="w-4 h-4 border-2 border-dotted border-red-400 rounded-full animate-spin inline-block"></span>
                      ) : (
                        <FaTrash />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-6">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-sm px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`text-sm px-3 py-1 rounded ${
                page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-sm px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <AddStockModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddStock}
        loading={addLoading}
      />
      <EditStockModal
        open={!!editProduct}
        onClose={() => setEditProduct(null)}
        product={editProduct}
        onSubmit={handleEditStock}
        loading={editLoading}
      />
    </div>
  );
}
