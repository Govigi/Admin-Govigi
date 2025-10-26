import React from "react";
export default function ViewCustomerSidepanel({ customer }) {
  if (!customer) {
    return (
      <div className="w-96 bg-white p-6 border-l border-gray-200 flex items-center justify-center text-gray-500">
        No customer selected
      </div>
    );
  }

  return (
    <div className="w-96 bg-white h-full flex flex-col border-l border-gray-200">
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Profile Section */}
        <div className="flex items-center space-x-4 pb-4 border-b">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold text-gray-600">
            {customer.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {customer.name}
            </h3>
            <p className="text-sm text-gray-500">{customer.email}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide">
              Phone
            </p>
            <p className="font-medium text-gray-800">{customer.phone || "—"}</p>
          </div>

          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide">
              Status
            </p>
            <span
              className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
                customer.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  customer.status === "active" ? "bg-green-500" : "bg-red-500"
                }`}
              ></span>
              {customer.status}
            </span>
          </div>

          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide">
              Type
            </p>
            <p className="font-medium text-gray-800 capitalize">
              {customer.type || "—"}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wide">
              Joined On
            </p>
            <p className="font-medium text-gray-800">
              {customer.joinedOn
                ? new Date(customer.joinedOn).toLocaleDateString()
                : "—"}
            </p>
          </div>

          <div className="col-span-2">
            <p className="text-gray-500 text-xs uppercase tracking-wide">
              Address
            </p>
            <p className="font-medium text-gray-800 whitespace-pre-wrap">
              {customer.address || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
        <button className="px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300 text-gray-700">
          Edit
        </button>
        <button className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600">
          Delete
        </button>
      </div>
    </div>
  );
}
