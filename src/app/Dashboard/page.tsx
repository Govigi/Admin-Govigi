"use client";

import React, { useState, useEffect } from "react";
import {
    OrderSummaryUrl,
    CustomerDashboardUrl,
    AdminUrl,
    VendorUrl
} from "../../libs/utils/API/endpoints";

// Premium Components
import IndustrialKPIs from "../../components/Dashboard/IndustrialKPIs";
import DashboardChart from "../../components/Dashboard/DashboardChart";
import ActionRequired from "../../components/Dashboard/ActionRequired";
import LiveFeed from "../../components/Dashboard/LiveFeed";
import { useUI } from "@/src/libs/Hooks/UIContext";

export default function Dashboard() {
    const [orders, setOrders] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { isSidebarCollapsed } = useUI();

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        const token = localStorage.getItem("admin_token");
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        };

        try {
            const [ordersRes, productsRes, customersRes, driversRes, vendorsRes] = await Promise.all([
                fetch(OrderSummaryUrl.getOrderDetails, { headers }),
                fetch(OrderSummaryUrl.getAllProducts, { headers }),
                fetch(CustomerDashboardUrl.getAllCustomers, { headers }),
                fetch(AdminUrl.getAllDrivers, { headers }),
                fetch(VendorUrl.getAllVendors, { headers })
            ]);

            if (ordersRes.ok) {
                const data = await ordersRes.json();
                setOrders(Array.isArray(data) ? data : []);
            }
            
            if (productsRes.ok) {
                const data = await productsRes.json();
                setProducts(Array.isArray(data.products) ? data.products : (Array.isArray(data) ? data : []));
            }
            
            if (customersRes.ok) {
                const data = await customersRes.json();
                setCustomers(Array.isArray(data) ? data : []);
            }
            
            if (driversRes.ok) {
                const data = await driversRes.json();
                setDrivers(Array.isArray(data) ? data : []);
            }
            
            if (vendorsRes.ok) {
                const data = await vendorsRes.json();
                setVendors(Array.isArray(data) ? data : []);
            }

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center bg-white font-mono">
                <div className="text-sm animate-pulse tracking-widest text-gray-400">LOADING DATA...</div>
            </div>
        );
    }

    const lowStockProducts = products.filter(p => (p.currentStock || p.stock || 0) < 10);

    return (
        <div className="min-h-screen bg-white p-4 md:p-8 font-mono text-gray-900">
            {/* Header */}
            <div className="mb-8 border-b border-gray-200 pb-4">
                <h1 className="text-xl font-bold uppercase tracking-widest text-gray-950">Dashboard Overview</h1>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-tighter">
                    Real-time Operational Metrics & Performance
                </p>
            </div>

            {/* Top Stats - Industrial Style */}
            <IndustrialKPIs 
                orders={orders} 
                customersCount={customers.length} 
                driversCount={drivers.length} 
            />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Section - Chart & Feed */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="border border-gray-200 rounded-lg p-4 bg-white min-h-[400px]">
                        <div className="mb-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Order Trends</h3>
                        </div>
                        <DashboardChart orders={orders} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-[400px]">
                            <LiveFeed orders={orders} />
                        </div>
                        <div className="h-[400px]">
                            <ActionRequired orders={orders} lowStockProducts={lowStockProducts} />
                        </div>
                    </div>
                </div>

                {/* Right Section - System Status */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-6 border-b border-gray-200 pb-2">Operational Health</h3>
                        
                        <div className="space-y-6">
                            <div className="group">
                                <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Active Vendors</div>
                                <div className="text-3xl font-bold text-gray-950">{vendors.length}</div>
                                <div className="text-[10px] text-emerald-600 font-bold mt-1 uppercase tracking-tighter">Verified & Active</div>
                            </div>
                            
                            <div className="group">
                                <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Registered Users</div>
                                <div className="text-3xl font-bold text-gray-950">{customers.length}</div>
                                <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">Growth: +2.4%</div>
                            </div>

                            <div className="group">
                                <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Fleet Status</div>
                                <div className="text-3xl font-bold text-gray-950">{drivers.length}</div>
                                <div className="text-[10px] text-blue-600 font-bold mt-1 uppercase tracking-tighter">Drivers On Duty</div>
                            </div>
                        </div>

                        <div className="mt-10 pt-6 border-t border-gray-200">
                             <button className="w-full py-3 bg-gray-950 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">
                                View System logs
                             </button>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4 bg-white">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-2">
                             {["Add Product", "Add Vendor", "Reports", "Settings"].map(action => (
                                 <button key={action} className="p-3 border border-gray-100 bg-gray-50 text-[10px] font-bold uppercase tracking-tighter text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-all">
                                     {action}
                                 </button>
                             ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
