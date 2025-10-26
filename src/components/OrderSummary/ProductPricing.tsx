"use client";

import React from "react";

import { useRouter } from "next/navigation";

export default function ProductPricing({ productDetails, loading }) {
  const router = useRouter();

  return (
    <div className="text-gray-700 font-bold bg-white w-full md:w-[800px] shadow-sm rounded-sm m-3 p-2">
      <div className="flex m-3 justify-between items-center">
        <p className="text-sm">Products and Pricing</p>
        <p
          className="text-sm text-blue-600 cursor-pointer font-thin"
          onClick={() => router.push("/Ordersummary/showPricing")}
        >
          View all
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-xs text-left text-gray-700 border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Unit Type</th>
              <th className="px-4 py-2">Availability</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-6">
                  <div className="flex justify-center items-center space-x-2">
                    <div className="w-4 h-4 border-4 border-gray-500 border-dotted rounded-full animate-spin"></div>
                    <span className="text-gray-500">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : productDetails && productDetails.length > 0 ? (
              productDetails.slice(0, 5).map((row, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 border border-gray-200">
                    {row.name}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">
                    {row.pricePerKg}
                  </td>
                  <td className="px-4 py-2 border border-gray-200">KG</td>
                  <td className="px-4 py-2 border border-gray-200">
                    {row.stock === "Available" ? "✅" : "❌"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-8">
                  No Data Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
