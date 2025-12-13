"use client";

import React, { useEffect, useState } from "react";
import IndustrialKPIs from "@/src/components/Dashboard/IndustrialKPIs";
import LiveFeed from "@/src/components/Dashboard/LiveFeed";
import ActionRequired from "@/src/components/Dashboard/ActionRequired";
import { OrderSummaryUrl, CustomerDashboardUrl, AdminUrl } from "@/src/libs/utils/API/endpoints";

export default function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [customerStats, setCustomerStats] = useState<any>({ total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const [ordersRes, productsRes, customersRes] = await Promise.all([
        fetch(OrderSummaryUrl.getOrderDetails || "/api/orders", { headers }),
        fetch(OrderSummaryUrl.getAllProducts || "/api/products", { headers }),
        fetch(CustomerDashboardUrl.getAllCustomersStats, { headers })
      ]);

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        const rawOrders = Array.isArray(ordersData) ? ordersData : (ordersData.orders || []);
        // Sort by newest first
        setOrders(rawOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        const rawProducts = Array.isArray(productsData) ? productsData : (productsData.products || []);
        setProducts(rawProducts);
      }

      if (customersRes.ok) {
        const cData = await customersRes.json();
        setCustomerStats({ total: cData.totalCustomers || 0 });
      }

      // Drivers fetch (optional/mock)
      try {
        const driversRes = await fetch(AdminUrl.getAllDrivers, { headers });
        if (driversRes.ok) {
          const dData = await driversRes.json();
          setDrivers(Array.isArray(dData) ? dData : []);
        }
      } catch (e) {
        // Ignore driver fetch error
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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const lowStockProducts = products.filter(p => (p.stock || p.quantity || 0) < 10);

  return (
    <div className="min-h-screen bg-white p-6 md:p-8 font-sans text-gray-900">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold uppercase tracking-widest border-l-4 border-primary pl-4">
          Admin Overview
        </h1>
        <p className="text-xs text-gray-400 mt-1 pl-5 font-mono">
          System Status: ONLINE • {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* 1. Key Performance Indicators */}
      <IndustrialKPIs
        orders={orders}
        customersCount={customerStats.total}
        driversCount={drivers.length}
      />

      {/* 2. Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)] min-h-[500px]">

        {/* Left Column: Recent Activity / Feed */}
        <div className="lg:col-span-2 h-full">
          <LiveFeed orders={orders} />
        </div>

        {/* Right Column: Alerts & Action Items */}
        <div className="h-full">
          <ActionRequired
            orders={orders}
            lowStockProducts={lowStockProducts}
          />
        </div>
      </div>
    </div>
  );
}
