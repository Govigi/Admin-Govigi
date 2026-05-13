"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ArrowPathIcon,
  ShoppingBagIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  Squares2X2Icon,
  UserIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { OrderSummaryUrl, VendorUrl, SourcingUrl, CategoryManagementUrl } from "../../libs/utils/API/endpoints";

interface CategoryItem {
  key: string;
  qty: string;
  vendorId: string | null;
  products: { name: string; qty: string; image: string }[];
}

interface Order {
  id: string;
  customer: string;
  date: string;
  categories: CategoryItem[];
  location?: { lat: number; lng: number };
  address?: string;
}

interface Vendor {
  id: string;
  name: string;
  tag: string;
  distance?: number;
}

export default function OrderAssignmentPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [vendorOptions, setVendorOptions] = useState<Record<string, Vendor[]>>({});
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  useEffect(() => {
    fetchOrders();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedOrder) {
      selectedOrder.categories.forEach((cat) => {
        fetchVendorsByCategory(cat.key, selectedOrder.location);
      });
    }
  }, [selectedOrderId]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(CategoryManagementUrl.getAllCategories);
      const map: Record<string, string> = {};
      res.data.forEach((cat: any) => {
        map[cat.categoryName.toLowerCase()] = cat.categoryImage?.url;
      });
      setCategoryImages(map);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await axios.get(OrderSummaryUrl.getOrderDetails, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const mappedOrders: Order[] = res.data.map((item: any) => ({
        id: item._id,
        customer: item.customerId?.customerName || "Unknown Customer",
        date: new Date(item.createdAt).toLocaleDateString(),
        address: item.addressId?.formattedAddress || "",
        location: item.addressId?.location?.coordinates
          ? { lat: item.addressId.location.coordinates[1], lng: item.addressId.location.coordinates[0] }
          : undefined,
        categories: (item.items || []).reduce((acc: CategoryItem[], it: any) => {
          const rawCat = it.category || it.productId?.category || "General";
          const catKey = rawCat.toLowerCase();
          const qty = parseFloat(it.quantityKg || it.quantity || 1);
          const productName = it.name || it.productId?.name || "Product";
          const productImage = it.image || (typeof it.productId?.image === 'string' ? it.productId.image : it.productId?.image?.url) || "";
          
          const existing = acc.find((a) => a.key === catKey);
          if (existing) {
            existing.qty = (parseFloat(existing.qty) + qty).toString();
            existing.products.push({ name: productName, qty: qty.toString(), image: productImage });
          } else {
            acc.push({ 
              key: catKey, 
              qty: qty.toString(), 
              vendorId: it.vendorId || null,
              products: [{ name: productName, qty: qty.toString(), image: productImage }]
            });
          }
          return acc;
        }, []),
      }));
      setOrders(mappedOrders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorsByCategory = async (category: string, location?: { lat: number; lng: number }) => {
    try {
      const token = localStorage.getItem("admin_token");

      const hasValidLocation =
        location &&
        !isNaN(location.lat) &&
        !isNaN(location.lng) &&
        location.lat !== 0 &&
        location.lng !== 0;

      let vendors: Vendor[] = [];

      try {
        let url = `${SourcingUrl.getNearbyVendors}?categories=${encodeURIComponent(category)}`;
        if (hasValidLocation) url += `&lat=${location!.lat}&lng=${location!.lng}`;
        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        vendors = (res.data || []).map((v: any) => ({
          id: v._id,
          name: v.businessName || v.name,
          tag: v.recommendationTags?.[0] || (v.isVerified ? "Verified" : "Regular"),
          distance: v.distance,
        })).slice(0, 2);
      } catch {
        // Sourcing endpoint failed — fall back to plain vendor list
        const res = await axios.get(`${VendorUrl.getAllVendors}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        vendors = (res.data || [])
          .filter((v: any) =>
            (v.supportedCategories || []).some(
              (sc: string) => sc.toLowerCase() === category.toLowerCase()
            )
          )
          .slice(0, 2)
          .map((v: any) => ({
            id: v._id,
            name: v.businessName || v.name,
            tag: v.isVerified ? "Verified" : "Regular",
            distance: undefined,
          }));
      }

      setVendorOptions((prev) => ({ ...prev, [category]: vendors }));
    } catch (err) {
      console.error(`Failed to fetch vendors for ${category}:`, err);
    }
  };

  const handleAssign = (orderId: string, categoryKey: string, vendorId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id !== orderId
          ? o
          : { ...o, categories: o.categories.map((c) => (c.key === categoryKey ? { ...c, vendorId } : c)) }
      )
    );
  };

  const handleUnassign = (orderId: string, categoryKey: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id !== orderId
          ? o
          : { ...o, categories: o.categories.map((c) => (c.key === categoryKey ? { ...c, vendorId: null } : c)) }
      )
    );
    // Re-fetch vendors for this category if not already cached
    const order = orders.find((o) => o.id === orderId);
    if (!(categoryKey in vendorOptions)) {
      fetchVendorsByCategory(categoryKey, order?.location);
    }
  };

  const handleConfirmSave = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      const assignments = selectedOrder.categories.reduce((acc, cat) => {
        acc[cat.key] = cat.vendorId;
        return acc;
      }, {} as Record<string, string | null>);
      await axios.patch(
        `${OrderSummaryUrl.getOrderById}/${selectedOrderId}/assignments`,
        { assignments },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Assignments saved!");
      fetchOrders();
    } catch (err) {
      alert("Failed to save assignments.");
    } finally {
      setSaving(false);
    }
  };

  const getProgress = (order: Order) => {
    const assigned = order.categories.filter((c) => c.vendorId).length;
    const total = order.categories.length;
    return { assigned, total, percent: total > 0 ? (assigned / total) * 100 : 0 };
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-inter text-gray-900 relative">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Left Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="px-4 py-4 border-b border-gray-100 flex justify-between items-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-govigi-green">Order Queue</p>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-gray-400">
              <ChevronRightIcon className="w-5 h-5 rotate-180" />
            </button>
          </div>
          <div className="px-4 py-4 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 text-xs focus:outline-none focus:border-gray-400 transition-colors bg-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-4 h-4 border-2 border-gray-100 border-t-govigi-green rounded-full animate-spin" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <p className="text-center text-gray-400 text-[10px] py-8">No orders</p>
            ) : (
              filteredOrders.map((order) => {
                const { assigned, total, percent } = getProgress(order);
                const isSelected = selectedOrderId === order.id;
                return (
                  <div
                    key={order.id}
                    onClick={() => {
                      setSelectedOrderId(order.id);
                      if (window.innerWidth < 1024) setIsSidebarOpen(false);
                    }}
                    className={`px-4 py-3 cursor-pointer border-b border-gray-50 transition-colors ${isSelected ? "bg-emerald-50 border-l-2 border-l-govigi-green" : "hover:bg-gray-50"
                      }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase">#{order.id.slice(-6)}</span>
                      <span
                        className={`text-[8px] font-bold px-1.5 py-0.5 uppercase ${percent === 100
                            ? "text-green-700 bg-green-50"
                            : percent > 0
                              ? "text-blue-700 bg-blue-50"
                              : "text-amber-700 bg-amber-50"
                          }`}
                      >
                        {percent === 100 ? "Done" : percent > 0 ? `${assigned}/${total}` : "Pending"}
                      </span>
                    </div>
                    <p className="text-xs font-semibold truncate">{order.customer}</p>
                    {order.address && (
                      <p className="text-[9px] text-gray-400 truncate mt-0.5">{order.address}</p>
                    )}
                    <div className="mt-2 h-0.5 bg-gray-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        className={`h-full ${percent === 100 ? "bg-govigi-green" : "bg-blue-400"}`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <p className="text-xs font-bold uppercase tracking-widest text-govigi-green">Assignment</p>
          <div className="w-10" />
        </div>

        <AnimatePresence mode="wait">
          {!selectedOrder ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-gray-300"
            >
              <ShoppingBagIcon className="w-8 h-8 mb-3" />
              <p className="text-xs font-medium">Select an order to start</p>
            </motion.div>
          ) : (
            <motion.div
              key={selectedOrder.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              {/* Header */}
              <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-bold text-govigi-green uppercase tracking-widest">
                      #{selectedOrder.id.slice(-8).toUpperCase()}
                    </span>
                    <span className="text-gray-200">·</span>
                    <span className="text-[9px] text-gray-400">{selectedOrder.date}</span>
                  </div>
                  <h2 className="text-lg font-bold uppercase tracking-tight">{selectedOrder.customer}</h2>
                  {selectedOrder.address && (
                    <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                      <MapPinIcon className="w-3 h-3" />
                      {selectedOrder.address}
                    </p>
                  )}
                </div>
                <button
                  onClick={fetchOrders}
                  className="p-2 border border-gray-200 hover:border-gray-400 text-gray-400 hover:text-black transition-all"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Category Grid */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {selectedOrder.categories.map((cat) => {
                    const isAssigned = !!cat.vendorId;
                    const assignedVendor = vendorOptions[cat.key]?.find((v) => v.id === cat.vendorId);
                    const imgUrl = categoryImages[cat.key];

                    return (
                      <div
                        key={cat.key}
                        className={`bg-white border transition-all flex flex-col ${isAssigned ? "border-govigi-green" : "border-gray-200 hover:border-gray-300"
                          }`}
                      >
                        {/* Category identity */}
                        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                          <div className="w-10 h-10 bg-gray-100 flex-shrink-0 relative overflow-hidden">
                            {imgUrl ? (
                              <Image src={imgUrl} alt={cat.key} fill className="object-cover" />
                            ) : (
                              <Squares2X2Icon className="w-5 h-5 m-auto mt-2.5 text-gray-300" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold uppercase truncate">{cat.key}</p>
                            <p className="text-[9px] text-gray-400">{cat.qty} units</p>
                          </div>
                          {isAssigned && (
                            <span className="ml-auto w-4 h-4 flex-shrink-0 bg-govigi-green text-white flex items-center justify-center">
                              <CheckIcon className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                        {/* Products List */}
                        <div className="px-4 py-2.5 bg-gray-50/50 border-b border-gray-100 max-h-32 overflow-y-auto custom-scrollbar">
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-2">Items</p>
                          {cat.products.map((prod, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-2 mb-2 last:mb-0">
                              <div className="flex items-center gap-2 min-w-0">
                                {prod.image && (
                                  <div className="w-6 h-6 relative flex-shrink-0 bg-white border border-gray-100">
                                    <Image src={prod.image} alt={prod.name} fill className="object-cover rounded-sm" />
                                  </div>
                                )}
                                <span className="text-[10px] font-medium text-gray-600 truncate">{prod.name}</span>
                              </div>
                              <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap">{prod.qty} KG</span>
                            </div>
                          ))}
                        </div>

                        {/* Vendor area */}
                        <div className="p-3 flex-1">
                          {isAssigned ? (
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-semibold truncate max-w-[120px]">
                                  {assignedVendor?.name || "Vendor"}
                                </p>
                                {assignedVendor?.distance != null && (
                                  <p className="text-[9px] text-govigi-green font-medium">{assignedVendor.distance} km</p>
                                )}
                              </div>
                              <button
                                onClick={() => handleUnassign(selectedOrder.id, cat.key)}
                                className="text-[9px] text-gray-400 hover:text-red-500 transition-colors underline"
                              >
                                Reset
                              </button>
                            </div>
                          ) : vendorOptions[cat.key] === undefined ? (
                            <div className="flex items-center gap-2 py-1">
                              <div className="w-3 h-3 border-2 border-gray-100 border-t-govigi-green rounded-full animate-spin flex-shrink-0" />
                              <span className="text-[9px] text-gray-400">Finding vendors...</span>
                            </div>
                          ) : vendorOptions[cat.key].length > 0 ? (
                            <div className="space-y-1.5">
                              {vendorOptions[cat.key].map((vendor) => (
                                <button
                                  key={vendor.id}
                                  onClick={() => handleAssign(selectedOrder.id, cat.key, vendor.id)}
                                  className="w-full flex items-center justify-between px-2.5 py-2 border border-gray-100 hover:border-govigi-green text-left group transition-all"
                                >
                                  <div className="min-w-0">
                                    <p className="text-[10px] font-semibold truncate group-hover:text-govigi-green">
                                      {vendor.name}
                                    </p>
                                    {vendor.distance != null && (
                                      <p className="text-[8px] text-gray-400">{vendor.distance} km away</p>
                                    )}
                                  </div>
                                  <ChevronRightIcon className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[9px] text-gray-400 py-1">No vendors found for this category.</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-white border-t border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="text-sm font-bold text-gray-900 whitespace-nowrap">
                    {getProgress(selectedOrder).assigned}/{getProgress(selectedOrder).total}
                  </div>
                  <div className="flex-1 sm:w-32 h-1 bg-gray-100 overflow-hidden">
                    <motion.div
                      animate={{ width: `${getProgress(selectedOrder).percent}%` }}
                      className="h-full bg-govigi-green"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide whitespace-nowrap">assigned</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedOrderId(null)}
                    className="flex-1 sm:flex-none px-4 py-2 text-xs text-gray-400 hover:text-black transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={getProgress(selectedOrder).percent < 100 || saving}
                    onClick={handleConfirmSave}
                    className="flex-1 sm:flex-none px-6 py-2 bg-govigi-green text-white text-xs font-semibold hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 transition-all flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <CheckIcon className="w-3.5 h-3.5" />
                    )}
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}