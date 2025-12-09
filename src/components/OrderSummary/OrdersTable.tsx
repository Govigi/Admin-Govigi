"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface Order {
  id: string;
  orderId: string;
  customer: string;
  products: any[];
  totalAmount: number;
  status: string;
  date: string;
  deliveryDate?: string | null;
}

interface OrdersTableProps {
  orders: Order[];
  onRefresh?: () => void;
  statusFilter?: string;
}

export default function OrdersTable({
  orders,
  onRefresh,
  statusFilter = "All",
}: OrdersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const itemsPerPage = 10;

  // Filter and search
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [orders, searchTerm]);

  // Sort
  const sortedOrders = useMemo(() => {
    const sorted = [...filteredOrders].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Order];
      const bValue = b[sortConfig.key as keyof Order];

      if (aValue === undefined || aValue === null || bValue === undefined || bValue === null) return 0;

      if (sortConfig.direction === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    return sorted;
  }, [filteredOrders, sortConfig]);

  // Pagination
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedOrders, currentPage]);

  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig.key !== column)
      return <ChevronDownIcon className="w-4 h-4 text-gray-400" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUpIcon className="w-4 h-4 text-[#007e5d]" />
    ) : (
      <ChevronDownIcon className="w-4 h-4 text-[#007e5d]" />
    );
  };

  const ActionMenu = ({ orderId }: { orderId: string }) => (
    <div className="relative">
      <button
        onClick={() => setOpenMenuId(openMenuId === orderId ? null : orderId)}
        className="p-1 hover:bg-gray-100 rounded-lg"
      >
        <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" />
      </button>
      {openMenuId === orderId && (
        <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <EyeIcon className="w-4 h-4" />
            View Details
          </button>
          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <PencilIcon className="w-4 h-4" />
            Edit Order
          </button>
          <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
            <TrashIcon className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );

  if (orders.length === 0) {
    return (
      <div className="p-12 text-center">
        <ShoppingBagIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No orders found
        </h3>
        <p className="text-gray-600">
          Start by creating your first order or check back later
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by Order ID or Customer Name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007e5d]"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort("orderId")}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-[#007e5d]"
                >
                  Order ID
                  <SortIcon column="orderId" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort("customer")}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-[#007e5d]"
                >
                  Customer
                  <SortIcon column="customer" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort("totalAmount")}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-[#007e5d]"
                >
                  Amount
                  <SortIcon column="totalAmount" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort("status")}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-[#007e5d]"
                >
                  Status
                  <SortIcon column="status" />
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort("date")}
                  className="flex items-center gap-2 font-semibold text-gray-700 hover:text-[#007e5d]"
                >
                  Date
                  <SortIcon column="date" />
                </button>
              </th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((order) => (
              <React.Fragment key={order.id}>
                <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        setExpandedRow(
                          expandedRow === order.id ? null : order.id
                        )
                      }
                      className="text-[#007e5d] font-semibold hover:underline flex items-center gap-2"
                    >
                      {order.orderId}
                      {order.products && order.products.length > 0 && (
                        <ChevronDownIcon
                          className={`w-4 h-4 transition-transform ${expandedRow === order.id ? "rotate-180" : ""
                            }`}
                        />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{order.customer}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    ₹{order.totalAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {formatDate(order.date)}
                  </td>
                  <td className="px-6 py-4">
                    <ActionMenu orderId={order.id} />
                  </td>
                </tr>

                {/* Expanded Row - Products */}
                {expandedRow === order.id && order.products?.length > 0 && (
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-700 mb-3">
                          Products in this order:
                        </h4>
                        <div className="space-y-2">
                          {order.products.map((product: any, idx: number) => (
                            <div
                              key={idx}
                              className="bg-white p-3 rounded-lg flex justify-between items-center border border-gray-200"
                            >
                              <div>
                                <p className="font-medium text-gray-900">
                                  {product.productName || product.name || "N/A"}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Qty: {product.quantity || 1} × ₹
                                  {product.price || 0}
                                </p>
                              </div>
                              <p className="font-semibold text-gray-900">
                                ₹
                                {(
                                  (product.quantity || 1) * (product.price || 0)
                                ).toLocaleString("en-IN")}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, sortedOrders.length)} of{" "}
            {sortedOrders.length} orders
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(
                  Math.max(0, currentPage - 2),
                  Math.min(totalPages, currentPage + 1)
                )
                .map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${currentPage === page
                        ? "bg-[#007e5d] text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    {page}
                  </button>
                ))}
            </div>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const ShoppingBagIcon = ({ className }: { className: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M7 4V3a1 1 0 011-1h8a1 1 0 011 1v1h4a1 1 0 011 1v2a1 1 0 01-.293.707L19.414 9h-.707l.293.293V19a2 2 0 01-2 2H7a2 2 0 01-2-2V9.293L4.586 9h-.707L5.293 7.707A1 1 0 015 7V5a1 1 0 011-1h4zm2 0h6V3H9v1z" />
  </svg>
);
