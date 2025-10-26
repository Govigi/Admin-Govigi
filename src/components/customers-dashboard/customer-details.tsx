"use client";

import React from "react";

export default function CustomerDetails({ customer }) {
  if (!customer) {
    return <p className="text-gray-500 text-sm">No details available.</p>;
  }

  const date = new Date(customer.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-5 text-gray-700">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          {customer.customerName}
        </h2>
        <p className="text-sm text-gray-500">{customer.customerEmail}</p>
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-medium">Type:</span>
          <span className="capitalize bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {customer.customerType}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium">Status:</span>
          <span
            className={`capitalize px-2 py-1 rounded-full ${
              customer.customerStatus === "active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {customer.customerStatus}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium">Joined On:</span>
          <span>{date}</span>
        </div>
      </div>

      <div className="mt-6">
        <button className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700 transition">
          Send Message
        </button>
      </div>
    </div>
  );
}
