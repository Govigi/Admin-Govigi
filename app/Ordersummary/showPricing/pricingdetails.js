'use client';
import { useState, useMemo, useEffect } from 'react';
import { MagnifyingGlassIcon, ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import { FaCircle, FaTimesCircle } from "react-icons/fa";
import { OrderSummaryUrl } from "../../API/endpoints";

const ITEMS_PER_PAGE = 10;

export default function PricingDetails() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const res = await fetch(OrderSummaryUrl.getAllProducts, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error(`Error! status: ${res.status}`);

        const json = await res.json();
        setProducts(json);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setLoading(false);
      }
    };
    getProducts();
  }, []);

  const filteredData = useMemo(() => {
    return products
      .filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
      .filter(item => category ? item.category === category : true)
      .filter(item => status ? item.stock === status : true);
  }, [search, category, status, products]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const currentData = filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const renderStatusIcon = (status) => {
    if (status === "In Stock") return <FaCircle className="text-green-500 text-xs" />;
    if (status === "Out of Stock") return <FaTimesCircle className="text-red-500 text-sm" />;
  };

  const exportToCSV = () => {
    const csv = [
      ["Name", "Price", "Unit Type", "Stock Status"],
      ...filteredData.map(item => [item.name, item.pricePerKg, item.unitType || 'KG', item.stock])
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
            <option value="Vegetable">Vegetables</option>
            <option value="Fruits">Fruits</option>
            <option value="Others">Others</option>
          </select>

          <select
            className="border text-sm rounded px-3 py-2"
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
          >
            <option value="">All Stock Status</option>
            <option value="Available">In Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {/* <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded text-sm">
            + Add Stock
          </button> */}
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
              <th className="p-2">Name</th>
              <th className="p-2">Price</th>
              <th className="p-2">Unit Type</th>
              <th className="p-2">Stock Status</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
            <tbody className="text-sm text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-6">
                    <div className="flex justify-center items-center space-x-2">
                      <div className="w-4 h-4 border-4 border-gray-500  border-dotted rounded-full animate-spin"></div>
                      <span className="text-gray-500">Loading data...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                currentData.map((item, idx) => (
                  <tr key={idx} className="">
                    <td className="p-3">{item.name}</td>
                    <td className="p-3">{item.pricePerKg}</td>
                    <td className="p-3">{item.unitType || 'KG'}</td>
                    {/* <td className="p-3">{item.category}</td> */}
                    <td className="p-3">
                      {item.stock === 'Available' ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <FaCircle className="text-xs" /> {item.stock}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-500">
                          <FaTimesCircle className="text-xs" /> {item.stock}
                        </div>
                      )}
                    </td>
                    <td className='p-3'>{"Edit"}</td>
                    <td className="p-3 max-w-xs break-words">{item.deliveryUpdate}</td>
                    {/* add more columns as needed */}
                  </tr>
                ))
              )}
            </tbody>

        </table>
      </div>

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
