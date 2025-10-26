import React from "react";
import { useRouter } from "next/navigation";

export default function StockReport({ stockData, loading }) {
  const router = useRouter();
  return (
    <div className="text-gray-700 font-bold bg-white h-65 w-200 shadow-sm rounded-sm m-3 p-2">
      <div className="flex m-3 justify-between items-center">
        <p className="text-sm">Stock Report</p>
        <p
          className="text-sm text-blue-600 cursor-pointer font-thin"
          onClick={() => router.push("/Ordersummary/stockReport")}
        >
          View all
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs text-left text-gray-700 border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 ">Product Name</th>
              <th className="px-4 py-2 ">Current Stock</th>
              <th className="px-4 py-2 ">Minimum Threshold</th>
              <th className="px-4 py-2 ">Stock Status</th>
            </tr>
          </thead>
          {loading ? (
            <tbody>
              <tr>
                <td colSpan={4} className="text-center py-6">
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-4 h-4 border-4 border-dotted border-gray-400 rounded-full animate-spin"></div>
                    <span>Loading orders...</span>
                  </div>
                </td>
              </tr>
            </tbody>
          ) : stockData.length > 0 ? (
            <tbody>
              {stockData.slice(0, 5).map((row, index) => (
                <tr key={index}>
                  <td className="px-4 py-2 border-r-1 border-gray-200">
                    {row.name}
                  </td>
                  <td className="px-4 py-2 border-r-1 border-gray-200">
                    {row.currentStock + " KG"}
                  </td>
                  <td className="px-4 py-2 border-r-1 border-gray-200">
                    {row.minimumThreshold + " KG"}
                  </td>
                  {/* <td className="px-4 py-2 border-r-1 border-gray-200">{row.price}</td> */}
                  <td
                    className={`px-4 py-2  ${
                      row.stock === "Available"
                        ? "text-green-600"
                        : row.stock === "Low Stock"
                        ? "text-yellow-500"
                        : "text-red-500"
                    }`}
                  >
                    {row.stock}
                  </td>
                </tr>
              ))}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td colSpan={4} className="text-center py-8">
                  No Data Available
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}
