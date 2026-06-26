"use client";

import React, { useEffect, useState } from "react";
import { ReportUrl, CategoryManagementUrl } from "@/src/libs/utils/API/endpoints";

export default function StockDetails() {
  const [reportType, setReportType] = useState("sales");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({ summary: {}, data: [] });

  const fetchCategories = async () => {
    try {
      const res = await fetch(CategoryManagementUrl.getAllCategories);
      if (res.ok) {
        const json = await res.json();
        setCategories(json.categories || json || []);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: reportType,
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(status && { status }),
        ...(category && { category })
      });

      const res = await fetch(`${ReportUrl.generateReport}?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to generate report");
      const json = await res.json();
      setReportData(json);
    } catch (err) {
      console.error("Error generating report:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFilter = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  const exportToCSV = () => {
    if (!reportData.data || reportData.data.length === 0) return;
    
    const headers = Object.keys(reportData.data[0]);
    const csvRows = [];
    csvRows.push(headers.join(","));

    for (const row of reportData.data) {
      const values = headers.map(header => {
        const val = row[header];
        const escaped = ("" + (val === null || val === undefined ? "" : val)).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(","));
    }

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportType}_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    document.title = "Custom Reports - Admin | Govigi";
    fetchCategories();
    generateReport();
  }, [reportType]);

  const renderSummaryCards = () => {
    const summary = reportData.summary || {};
    if (reportType === "sales") {
      return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 font-sans">
          <div className="p-4 border border-gray-200 bg-white rounded-lg">
            <div className="text-[10px] text-gray-400 tracking-widest uppercase mb-1">TOTAL REVENUE</div>
            <div className="text-2xl font-bold text-gray-900 truncate">₹{(summary.totalRevenue || 0).toLocaleString("en-IN")}</div>
            <div className="text-xs mt-1 text-gray-400">All payment channels</div>
          </div>
          <div className="p-4 border border-gray-200 bg-white rounded-lg">
            <div className="text-[10px] text-gray-400 tracking-widest uppercase mb-1">TOTAL ORDERS</div>
            <div className="text-2xl font-bold text-gray-900 truncate">{summary.totalOrders || 0}</div>
            <div className="text-xs mt-1 text-gray-400">Placed in date range</div>
          </div>
          <div className="p-4 border border-gray-200 bg-white rounded-lg">
            <div className="text-[10px] text-gray-400 tracking-widest uppercase mb-1">AVERAGE ORDER VALUE</div>
            <div className="text-2xl font-bold text-gray-900 truncate">₹{(summary.averageOrderValue || 0).toLocaleString("en-IN")}</div>
            <div className="text-xs mt-1 text-gray-400">Per customer order</div>
          </div>
          <div className="p-4 border border-gray-200 bg-white rounded-lg">
            <div className="text-[10px] text-gray-400 tracking-widest uppercase mb-1">ONLINE / COD SPLIT</div>
            <div className="text-2xl font-bold text-gray-900 truncate">{summary.onlineOrders || 0} / {summary.codOrders || 0}</div>
            <div className="text-xs mt-1 text-gray-400">Digital vs cash payments</div>
          </div>
        </div>
      );
    }

    if (reportType === "products") {
      return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6 font-sans">
          <div className="p-4 border border-gray-200 bg-white rounded-lg">
            <div className="text-[10px] text-gray-400 tracking-widest uppercase mb-1">TOTAL SOURCED QTY</div>
            <div className="text-2xl font-bold text-gray-900 truncate">{summary.totalProductsSold || 0} Kg</div>
            <div className="text-xs mt-1 text-gray-400">Total volume sourced</div>
          </div>
          <div className="p-4 border border-gray-200 bg-white rounded-lg">
            <div className="text-[10px] text-gray-400 tracking-widest uppercase mb-1">TOTAL SALES VALUE</div>
            <div className="text-2xl font-bold text-gray-900 truncate">₹{(summary.totalRevenue || 0).toLocaleString("en-IN")}</div>
            <div className="text-xs mt-1 text-gray-400">Product gross revenue</div>
          </div>
          <div className="p-4 border border-gray-200 bg-white rounded-lg col-span-2 lg:col-span-1">
            <div className="text-[10px] text-gray-400 tracking-widest uppercase mb-1">UNIQUE ITEMS SOLD</div>
            <div className="text-2xl font-bold text-gray-900 truncate">{summary.uniqueProductsSold || 0}</div>
            <div className="text-xs mt-1 text-gray-400">Distinct catalog items</div>
          </div>
        </div>
      );
    }

    if (reportType === "customers") {
      return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6 font-sans">
          <div className="p-4 border border-gray-200 bg-white rounded-lg">
            <div className="text-[10px] text-gray-400 tracking-widest uppercase mb-1">TOTAL REGISTERED</div>
            <div className="text-2xl font-bold text-gray-900 truncate">{summary.totalCustomers || 0}</div>
            <div className="text-xs mt-1 text-gray-400">Signed up accounts</div>
          </div>
          <div className="p-4 border border-gray-200 bg-white rounded-lg">
            <div className="text-[10px] text-gray-400 tracking-widest uppercase mb-1">ACTIVE BUYERS</div>
            <div className="text-2xl font-bold text-gray-900 truncate text-emerald-600">{summary.activeCustomers || 0}</div>
            <div className="text-xs mt-1 text-emerald-600 font-bold">Placed orders in range</div>
          </div>
          <div className="p-4 border border-gray-200 bg-white rounded-lg col-span-2 lg:col-span-1">
            <div className="text-[10px] text-gray-400 tracking-widest uppercase mb-1">INACTIVE CUSTOMERS</div>
            <div className="text-2xl font-bold text-gray-900 truncate">{summary.inactiveCustomers || 0}</div>
            <div className="text-xs mt-1 text-gray-400">No recent order history</div>
          </div>
        </div>
      );
    }

    if (reportType === "vendors") {
      return (
        <div className="grid grid-cols-2 gap-4 mb-6 font-sans">
          <div className="p-4 border border-gray-200 bg-white rounded-lg">
            <div className="text-[10px] text-gray-400 tracking-widest uppercase mb-1">REGISTERED VENDORS</div>
            <div className="text-2xl font-bold text-gray-900 truncate">{summary.totalVendors || 0}</div>
            <div className="text-xs mt-1 text-gray-400">Onboarded merchant accounts</div>
          </div>
          <div className="p-4 border border-gray-200 bg-white rounded-lg">
            <div className="text-[10px] text-gray-400 tracking-widest uppercase mb-1">ACTIVE SOURCING VENDORS</div>
            <div className="text-2xl font-bold text-gray-900 truncate text-emerald-600">{summary.activeVendors || 0}</div>
            <div className="text-xs mt-1 text-emerald-600 font-bold">Currently supplying stock</div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 font-sans text-gray-900">
      {/* Header */}
      <div className="mb-8 border-b border-gray-200 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-widest text-gray-950">Custom Reports</h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-tighter">
            Generate dynamic business summaries and export data reports
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <button
            onClick={() => handleQuickFilter(7)}
            className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 font-bold px-3 py-1.5 text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => handleQuickFilter(30)}
            className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 font-bold px-3 py-1.5 text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
          >
            Last 30 Days
          </button>
          <button
            onClick={() => {
              const startOfMonth = new Date();
              startOfMonth.setDate(1);
              setStartDate(startOfMonth.toISOString().split("T")[0]);
              setEndDate(new Date().toISOString().split("T")[0]);
            }}
            className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 font-bold px-3 py-1.5 text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
          >
            This Month
          </button>
        </div>
      </div>

      {/* Filter Controls Panel */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-6 font-sans">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                setReportData({ summary: {}, data: [] });
              }}
              className="w-full bg-white border border-gray-200 text-gray-900 text-xs rounded p-2 focus:outline-none focus:ring-1 focus:ring-gray-950"
            >
              <option value="sales">Sales & Orders</option>
              <option value="products">Product Sales</option>
              <option value="customers">Customers</option>
              <option value="vendors">Vendors</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-white border border-gray-200 text-gray-900 text-xs rounded p-2 focus:outline-none focus:ring-1 focus:ring-gray-950"
            />
          </div>

          <div>
            <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-white border border-gray-200 text-gray-900 text-xs rounded p-2 focus:outline-none focus:ring-1 focus:ring-gray-950"
            />
          </div>

          {reportType === "sales" && (
            <div>
              <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Order Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 text-xs rounded p-2 focus:outline-none focus:ring-1 focus:ring-gray-950"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Order Placed">Order Placed</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          )}

          {reportType === "products" && (
            <div>
              <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Product Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 text-xs rounded p-2 focus:outline-none focus:ring-1 focus:ring-gray-950"
              >
                <option value="">All Categories</option>
                {categories.map((cat, idx) => {
                  const name = cat.categoryName || cat.name || (typeof cat === "string" ? cat : "");
                  return (
                    <option key={idx} value={name}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <div className="flex items-end lg:col-span-1">
            <button
              onClick={generateReport}
              className="w-full bg-gray-950 hover:bg-gray-800 text-white font-bold text-[10px] uppercase tracking-widest py-2.5 rounded transition-colors cursor-pointer"
            >
              Generate
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-4 border-dotted border-gray-400 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {renderSummaryCards()}

          {/* Dynamic Table Card */}
          <div className="border border-gray-200 rounded-lg bg-white overflow-hidden font-sans mt-6">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-600">{reportType} Details</h3>
              <button
                onClick={exportToCSV}
                disabled={!reportData.data || reportData.data.length === 0}
                className="bg-gray-950 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors px-3 py-1.5 rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Export CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase tracking-widest border-b border-gray-200">
                  <tr>
                    {reportType === "sales" && (
                      <>
                        <th className="px-4 py-3 font-bold">Order No.</th>
                        <th className="px-4 py-3">Customer Name</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Payment</th>
                      </>
                    )}
                    {reportType === "products" && (
                      <>
                        <th className="px-4 py-3 font-bold">Product Name</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3 text-right">Qty Sold</th>
                        <th className="px-4 py-3 text-right">Total Revenue</th>
                        <th className="px-4 py-3 text-right">Avg Price/Kg</th>
                      </>
                    )}
                    {reportType === "customers" && (
                      <>
                        <th className="px-4 py-3 font-bold">Customer Name</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3">Customer Type</th>
                        <th className="px-4 py-3 text-right">Total Orders</th>
                        <th className="px-4 py-3 text-right">Total Spent</th>
                        <th className="px-4 py-3">Joined Date</th>
                      </>
                    )}
                    {reportType === "vendors" && (
                      <>
                        <th className="px-4 py-3 font-bold">Vendor Name</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3 text-right">Assigned Items</th>
                        <th className="px-4 py-3 text-right">Sourced Qty</th>
                        <th className="px-4 py-3 text-right">Pending Sourcing</th>
                        <th className="px-4 py-3 text-right">Revenue Earned</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {reportData.data && reportData.data.length > 0 ? (
                    reportData.data.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/75 transition-colors">
                        {reportType === "sales" && (
                          <>
                            <td className="px-4 py-3 font-bold text-gray-950">{row.orderNumber}</td>
                            <td className="px-4 py-3">{row.customerName}</td>
                            <td className="px-4 py-3 text-[11px] text-gray-500">
                              {new Date(row.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                              })}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-gray-950">₹{row.totalAmount}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide rounded ${
                                row.status === "Delivered" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                row.status === "Cancelled" ? "bg-red-50 text-red-700 border border-red-100" : "bg-yellow-50 text-yellow-700 border border-yellow-100"
                              }`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[10px] text-gray-500 uppercase tracking-tighter">
                              {row.paymentMethod} ({row.paymentStatus})
                            </td>
                          </>
                        )}
                        {reportType === "products" && (
                          <>
                            <td className="px-4 py-3 font-bold text-gray-950">{row.productName}</td>
                            <td className="px-4 py-3 text-gray-500">{row.category}</td>
                            <td className="px-4 py-3 text-right font-medium text-gray-950">{row.quantitySoldKg} Kg</td>
                            <td className="px-4 py-3 text-right font-bold text-emerald-600">₹{row.revenue}</td>
                            <td className="px-4 py-3 text-right text-gray-500">₹{row.averagePricePerKg}</td>
                          </>
                        )}
                        {reportType === "customers" && (
                          <>
                            <td className="px-4 py-3 font-bold text-gray-950">{row.customerName}</td>
                            <td className="px-4 py-3 text-gray-500">{row.phone}</td>
                            <td className="px-4 py-3 text-gray-500 uppercase tracking-tighter">{row.customerType}</td>
                            <td className="px-4 py-3 text-right font-medium text-gray-950">{row.totalOrders}</td>
                            <td className="px-4 py-3 text-right font-bold text-gray-950">₹{row.totalSpent}</td>
                            <td className="px-4 py-3 text-[11px] text-gray-500">
                              {new Date(row.joinedDate).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric"
                              })}
                            </td>
                          </>
                        )}
                        {reportType === "vendors" && (
                          <>
                            <td className="px-4 py-3 font-bold text-gray-950">{row.businessName}</td>
                            <td className="px-4 py-3 text-gray-500">{row.vendorPhone}</td>
                            <td className="px-4 py-3 text-right font-medium text-gray-950">{row.totalAssignedItems}</td>
                            <td className="px-4 py-3 text-right font-medium text-gray-950">{row.totalSourcedQty} Kg</td>
                            <td className="px-4 py-3 text-right font-medium text-gray-950">{row.pendingSourcingQty} Kg</td>
                            <td className="px-4 py-3 text-right font-bold text-emerald-600">₹{row.revenueEarned}</td>
                          </>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                        No report data found matching selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
