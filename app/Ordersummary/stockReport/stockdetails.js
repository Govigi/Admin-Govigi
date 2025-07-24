'use client';
import { useState, useMemo } from 'react';
import { MagnifyingGlassIcon, ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import { BarsArrowDownIcon } from "@heroicons/react/24/outline";
import { FaCircle, FaExclamationTriangle, FaTimesCircle } from "react-icons/fa";

const mockData = [
  { name: "Tomatoes", category: "Vegetables", currentStock: 45, minThreshold: 30, status: "Sufficient", lastUpdated: "14 Jul 2025, 10:45 AM" },
  { name: "Green Cabbage", category: "Vegetables", currentStock: 18, minThreshold: 20, status: "Low Stock", lastUpdated: "14 Jul 2025, 10:30 AM" },
  { name: "Carrots", category: "Vegetables", currentStock: 0, minThreshold: 25, status: "Out of Stock", lastUpdated: "14 Jul 2025, 10:20 AM" },
  ...Array(10).fill({
    name: "Apples", category: "Fruits", currentStock: 12, minThreshold: 20, status: "Low Stock", lastUpdated: "14 Jul 2025, 09:15 AM"
  }),
];

const ITEMS_PER_PAGE = 10;

export default function StockDetails() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  const filteredData = useMemo(() => {
    return mockData
      .filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
      .filter(item => (category ? item.category === category : true))
      .filter(item => (status ? (
        status === 'In Stock' ? item.status === 'Sufficient' : item.status === status
      ) : true));
  }, [search, category, status]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const currentData = filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const renderStatusIcon = (status) => {
    if (status === "Sufficient") return <FaCircle className="text-green-500 text-xs" />;
    if (status === "Low Stock") return <FaExclamationTriangle className="text-yellow-500 text-sm" />;
    if (status === "Out of Stock") return <FaTimesCircle className="text-red-500 text-sm" />;
  };

  const exportToCSV = () => {
    const csv = [
      ["Product Name", "Category", "Current Stock", "Min Threshold", "Status", "Last Updated"],
      ...filteredData.map(item =>
        [item.name, item.category, item.currentStock, item.minThreshold, item.status, item.lastUpdated]
      )
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "stock_report.csv";
    link.click();
  };

  return (
    <div className="bg-white shadow-sm rounded-sm p-4 m-3 text-gray-700">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className="font-bold text-xl">Stock Report</h2>

          <div className="relative w-64">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Product..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm"
            />
          </div>

          <select
            className="border text-sm rounded px-3 py-2"
            value={category}
            onChange={e => { setCategory(e.target.value); setPage(1); }}
          >
            <option value="">All Categories</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Fruits">Fruits</option>
            <option value="Others">Others</option>
          </select>

          <select
            className="border text-sm rounded px-3 py-2"
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All Stock Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded text-sm">
            + Add Stock
          </button>
          <button
            onClick={exportToCSV}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded text-sm flex items-center gap-1"
          >
            <ArrowDownTrayIcon className="h-5 w-5 text-gray-700" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 mt-4"></div>

      <div className="mt-4 overflow-x-auto">
        <table className="table-auto w-full text-sm border-collapse">
          <thead className="bg-gray-100 text-gray-700 text-left">
            <tr>
              <th className="p-2">Product</th>
              <th className="p-2">Category</th>
              <th className="p-2">Stock</th>
              <th className="p-2">Min Threshold</th>
              <th className="p-2">Status</th>
              <th className="p-2">Last Updated</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? currentData.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50 ">
                <td className="p-2">{item.name}</td>
                <td className="p-2">{item.category}</td>
                <td className="p-2">{item.currentStock} Kg</td>
                <td className="p-2">{item.minThreshold} Kg</td>
                <td className="p-2 flex items-center gap-2">{renderStatusIcon(item.status)}{item.status}</td>
                <td className="p-2">{item.lastUpdated}</td>
                <td className="p-2 text-blue-600 cursor-pointer">View / Edit</td>
              </tr>
            )) : (
              <tr><td colSpan="7" className="text-center py-6">No data found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-sm px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`text-sm px-3 py-1 rounded ${page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-sm px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
