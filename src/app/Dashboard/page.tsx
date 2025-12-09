"use client";

import React, { useEffect, useState } from "react";
import DashboardStats from "@/src/components/Dashboard/DashboardStats";
import DashboardChart from "@/src/components/Dashboard/DashboardChart";
import DashboardTable from "@/src/components/Dashboard/DashboardTable";
import PathShower from "@/src/components/pathShower";
import { MagnifyingGlassIcon, FunnelIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { OrderSummaryUrl } from "@/src/libs/utils/API/endpoints";

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const headers: any = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Fetch Orders & Products
      const [ordersRes, productsRes] = await Promise.all([
        fetch(OrderSummaryUrl.getOrderDetails || "/api/orders", { headers }),
        fetch(OrderSummaryUrl.getAllProducts || "/api/products", { headers })
      ]);

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        console.log("Dashboard Orders:", ordersData);
        // Ensure orders is an array (some APIs wrap it)
        setOrders(Array.isArray(ordersData) ? ordersData : (ordersData.orders || []));
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        console.log("Dashboard Products:", productsData);
        // Ensure products is an array
        setProducts(Array.isArray(productsData) ? productsData : (productsData.products || []));
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#10b981]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 p-6 md:p-8 font-sans">

      {/* 1. Header & Breadcrumbs Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="mb-2">
            <PathShower pathList={[["dashboard", "Main Menu"], ["overview", "Overview"]]} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
          <p className="text-gray-500 mt-1">Manage and monitoring your sales with one page</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2.5 w-full bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
            <FunnelIcon className="w-5 h-5" />
            Sort
          </button>
        </div>
      </div>

      {/* 2. Low Stock Alert Banner (Mock Logic: can be dynamic based on products.stock < 5) */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 mb-8 flex items-start gap-4">
        <div className="bg-white p-2 rounded-full shadow-sm mt-0.5">
          <InformationCircleIcon className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-gray-800 font-medium text-sm md:text-base">
            Your product stock with code <span className="font-bold">#M0169</span> is running low already below 5 Pcs.
          </p>
          <button className="text-blue-600 font-bold text-sm hover:underline mt-1">
            Please request a new shipment
          </button>
        </div>
      </div>

      {/* 3. Stats Cards */}
      <DashboardStats orders={orders} products={products} />

      {/* 4. Chart & History Area */}
      <DashboardChart orders={orders} />

      {/* 5. Latest Transactions Table */}
      <DashboardTable orders={orders} />
    </div>
  );
}
