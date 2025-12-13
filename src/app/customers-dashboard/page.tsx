"use client";

import React, { useState, useEffect, useMemo } from "react";
import { CustomerDashboardUrl } from "@/src/libs/utils/API/endpoints";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import CustomersTable from "@/src/components/customers-dashboard/customers-table";
import { useRouter } from "next/navigation";

export default function CustomersDashboard() {
  const router = useRouter();

  const [data, setData] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    pendingApprovals: 0,
    totalOrders: 0,
  });

  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      const backendUrl = CustomerDashboardUrl.getAllCustomersStats;

      try {
        const response = await fetch(backendUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error("Error fetching customer stats:", error);
      }
    };

    const customers = async () => {
      const backendUrl = CustomerDashboardUrl.getAllCustomers;

      try {
        const response = await fetch(backendUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setAllCustomers(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchData();
    customers();
  }, []);

  const filteredCustomers = useMemo(() => {
    return allCustomers.filter((customer) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        (customer.customerName?.toLowerCase() || "").includes(searchLower) ||
        (customer.customerEmail?.toLowerCase() || "").includes(searchLower) ||
        (customer.customerPhone?.toLowerCase() || "").includes(searchLower);

      const matchesStatus =
        statusFilter === "all" ||
        (customer.customerStatus?.toLowerCase() || "") === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [allCustomers, searchQuery, statusFilter]);

  const stats = [
    { label: "TOTAL CUSTOMERS", value: data.totalCustomers },
    { label: "ACTIVE", value: data.activeCustomers },
    { label: "PENDING", value: data.pendingApprovals },
    { label: "TOTAL ORDERS", value: data.totalOrders },
  ];

  return (
    <div className="min-h-screen bg-white p-2 md:p-8 font-mono text-gray-900 w-full max-w-[100vw] overflow-x-hidden">
      <div className="grid grid-cols-2 md:flex items-center gap-4 md:gap-8 py-4 border-b border-gray-200 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="flex-shrink-0 p-3 bg-gray-50 md:bg-transparent rounded-lg md:rounded-none border md:border-none border-gray-100">
            <div className="text-[10px] md:text-xs text-gray-400 tracking-widest uppercase">{stat.label}</div>
            <div className="text-lg md:text-xl font-bold text-gray-900 mt-0.5 truncate">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="mb-6 pb-4 border-b border-gray-200 flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-widest text-[#10b981] break-words">
            Customers Dashboard
          </h1>
          <p className="text-xs text-gray-400 mt-1">Manage Customer Accounts</p>
        </div>

        <div className="flex flex-col gap-3">
          {/* Search & Filter Row */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Bar */}
            <div className="relative group flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
              <input
                type="text"
                placeholder="SEARCH NAME, EMAIL, PHONE..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 text-xs w-full focus:outline-none focus:border-black transition-colors uppercase placeholder-gray-300"
              />
            </div>

            {/* Status Filter */}
            <div className="relative md:w-48">
              <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-8 py-2 border border-gray-200 text-xs w-full focus:outline-none focus:border-black appearance-none bg-transparent uppercase cursor-pointer"
              >
                <option value="all">Status: All</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Actions Row */}
          <div className="grid grid-cols-2 md:flex md:items-center gap-2 mt-2 md:mt-0">
            <button className="border border-gray-200 hover:border-black text-xs px-4 py-2 uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
              <ArrowDownTrayIcon className="w-4 h-4" />
              Import
            </button>
            <button className="border border-gray-200 hover:border-black text-xs px-4 py-2 uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
              <ArrowUpTrayIcon className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => router.push("/Customers/AddCustomer")}
              className="col-span-2 md:col-auto bg-black text-white hover:bg-[#10b981] text-xs px-4 py-2 uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
            >
              <PlusCircleIcon className="w-4 h-4" />
              Add New
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-none p-0">
        <CustomersTable customers={filteredCustomers} />
      </div>
    </div>
  );
}
