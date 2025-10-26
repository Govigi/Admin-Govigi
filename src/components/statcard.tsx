import React from "react";

export default function StatCard({ title, color, value, icon }) {
  return (
    <div className="bg-white shadow-sm rounded-lg p-6 flex items-center space-x-4 border border-gray-100">
      <div className={`p-3 ${color} rounded-full`}>{icon}</div>
      <div>
        <h3 className="text-xs font-small text-gray-700">{title}</h3>
        <p className="text-xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
