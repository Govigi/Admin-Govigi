"use client";

import React from "react";
import { CustomerDashboardUrl } from "@/src/libs/utils/API/endpoints";
import StatCard from "@/src/components/statcard";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  FolderArrowDownIcon,
  PlusCircleIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import CustomersTable from "@/src/components/customers-dashboard/customers-table";

import { useState, useEffect } from "react";
import { FaCloudDownloadAlt, FaDownload } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function CustomersDashboard() {
  const router = useRouter();

  const [data, setData] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    pendingApprovals: 0,
    totalOrders: 0,
  });

  const [allCustomers, setAllCustomers] = useState([]);

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
        console.log(data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchData();
    customers();
  }, []);

  return (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Customers Dashboard
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Customers"
            value={data.totalCustomers}
            color="bg-blue-500"
            icon={<UserGroupIcon className="h-6 w-6 text-white" />}
          />
          <StatCard
            title="Active Customers"
            value={data.activeCustomers}
            color="bg-green-500"
            icon={<UserGroupIcon className="h-6 w-6 text-white" />}
          />
          <StatCard
            title="Pending Approvals"
            value={data.pendingApprovals}
            color="bg-yellow-500"
            icon={<UserGroupIcon className="h-6 w-6 text-white" />}
          />
          <StatCard
            title="Total Orders"
            value={data.totalOrders}
            color="bg-purple-500"
            icon={<ShoppingBagIcon className="h-6 w-6 text-white" />}
          />
        </div>
        <div className="mt-8">
          <div className="flex flex-row justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Customers</h2>
            <div className="flex flex-row gap-4">
              <button className="border border-gray-300 text-black p-2 text-sm rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center cursor-pointer">
                <ArrowDownTrayIcon className="h-4 w-4 inline-block mr-2" />
                Import
              </button>
              <div>
                <button className="border border-gray-300 text-black p-2 text-sm rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 flex items-center cursor-pointer">
                  <ArrowUpTrayIcon className="h-4 w-4 inline-block mr-2" />
                  Export
                </button>
              </div>
              <button
                className="bg-green-500 text-white p-2 text-sm rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center cursor-pointer"
                onClick={() => {
                  router.push("/Customers/AddCustomer");
                }}
              >
                <PlusCircleIcon className="h-5 w-5 inline-block mr-2" />
                Add Customer
              </button>
            </div>
          </div>
          <CustomersTable customers={allCustomers} />
        </div>
      </div>
    </>
  );
}
