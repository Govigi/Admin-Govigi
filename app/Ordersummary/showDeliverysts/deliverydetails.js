'use client';

import { useState, useEffect } from 'react';
import { FaCircle } from 'react-icons/fa';
import { OrderSummaryUrl } from '../../API/endpoints';

const ITEMS_PER_PAGE = 10;

const DeliveryDetails = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [data, setOrders] = useState([]);
  const [orderLoading, setOrderLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await fetch(OrderSummaryUrl.getOrderDetails, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error(`Error! status: ${res.status}`);
        const json = await res.json();
        setOrders(json);
        setOrderLoading(false);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    getData();
  }, []);

  const formatAddress = (addressArr) => {
    const addr = addressArr[0] || {};
    return `${addr.name || ''}, ${addr.contact || ''}, ${addr.email || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`;
  };

  const rawFiltered = data.map((item, index) => ({
    orderId: index + 1,
    timestamp: new Date(item.createdAt).toLocaleString(),
    location: formatAddress(item.address),
    status: item.status?.toLowerCase(),
  }));

  const filteredData = rawFiltered.filter((item) => {
    const searchMatch =
      item.orderId.toString().includes(search) ||
      item.location.toLowerCase().includes(search.toLowerCase());

    const statusMatch = statusFilter === '' || item.status === statusFilter;

    const itemDate = new Date(item.timestamp);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    const dateMatch = (!from || itemDate >= from) && (!to || itemDate <= to);
    return searchMatch && statusMatch && dateMatch;
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const currentData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const downloadCSV = () => {
    const headers = ['Order ID', 'Timestamp', 'Location', 'Status'];
    const rows = filteredData.map((item) => [
      item.orderId,
      item.timestamp,
      item.location,
      item.status,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'delivery_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusColors = {
    delivered: 'text-green-600',
    'in transit': 'text-yellow-500',
    pending: 'text-red-600',
  };

  return (
    <div className="p-4 w-full">
      <div className="flex justify-between items-center flex-wrap mb-4">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2 md:mb-0">Delivery Updates</h1>

        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto text-black">
          <input
            type="text"
            placeholder="Search Order or Location"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm text-black"
          >
            <option value="">All Status</option>
            <option value="completed">Delivered</option>
            <option value="failed">In Transit</option>
            <option value="pending">Pending</option>
          </select>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm text-black"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm text-black"
          />

          <button
            onClick={downloadCSV}
            className="ml-auto md:ml-4 bg-gray-300 text-gray-700 px-4 py-1 rounded-md text-sm text-black"
          >
            Download Report
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-black border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-3 text-left border-b">Order ID</th>
              <th className="py-2 px-3 text-left border-b">Timestamp</th>
              <th className="py-2 px-3 text-left border-b">Location</th>
              <th className="py-2 px-3 text-left border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {orderLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-6">
                  <div className="flex justify-center items-center gap-2">
                    <div className="w-4 h-4 border-4 border-dotted border-gray-400 rounded-full animate-spin"></div>
                    <span>Loading orders...</span>
                  </div>
                </td>
              </tr>
            ) : currentData.length > 0 ? (
              currentData.map((item) => (
                <tr key={item.orderId} className="border-b">
                  <td className="py-2 px-3">{item.orderId}</td>
                  <td className="py-2 px-3">{item.timestamp}</td>
                  <td className="py-2 px-3 whitespace-pre-line">{item.location}</td>
                  <td className="py-2 px-3 flex items-center gap-2">
                    <FaCircle className={`${statusColors[item.status]} text-xs`} />
                    <span className={`${statusColors[item.status]} capitalize`}>{item.status}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  No data matches the filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!orderLoading && totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2 text-sm text-gray-700">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-gray-200 font-semibold' : ''}`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DeliveryDetails;
