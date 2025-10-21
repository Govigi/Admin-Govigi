"use client";
import React from "react";
import { useSidePanel } from "../../Hooks/sidePanelContext";
import ViewCustomerSidepanel from "../customers-dashboard/view-customer-sidepanel";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function SidePanel() {
    const { isOpen, data, closeSidePanel } = useSidePanel();

    const looksLikeCustomer = Boolean(
        data && (
            data.customerName || data.customerEmail || data.name || data.email || data.phone || data.address || data.customerStatus || data.status || data.customerType || data.type || data.joinedOn || data.createdAt
        )
    );

    const customer = looksLikeCustomer
        ? {
            name: data.customerName ?? data.name ?? "",
            email: data.customerEmail ?? data.email ?? "",
            phone: data.customerPhone ?? data.phone ?? "",
            address: data.customerAddress ?? data.address ?? "",
            status: data.customerStatus ?? data.status ?? "",
            type: data.customerType?.typeName ?? data.type ?? "",
            joinedOn: data.createdAt ?? data.joinedOn ?? data.joined_on ?? null,
            id:data._id ?? data.customerId ?? data.customer_id ?? data.id ?? null,
            sidePanelheader: "Customer Details",
        }
        : null;

    return (
        <>
            <div
                className={`fixed inset-0 z-40 transition-all duration-300 ${isOpen ? "bg-black/30 visible opacity-100" : "invisible opacity-0"
                    }`}
                onClick={closeSidePanel} 
            ></div>
            <div
                aria-hidden={!isOpen}
                className={`p-2 fixed inset-y-0 right-0 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
                style={{ width: "min(420px, 90vw)" }}
            >
                <div className="h-full rounded-lg bg-white shadow-xl border-l border-gray-200 flex flex-col">
                    <div className="p-4 flex items-center justify-between border-b h-16">
                        <h3 className="text-md font-medium text-gray-900">
                            {customer?.sidePanelheader || "Details"}
                        </h3>
                        <button
                            onClick={closeSidePanel}
                            className="text-gray-500 hover:text-gray-700 px-2 py-1"
                            aria-label="Close side panel"
                        >
                            <XMarkIcon className="h-6 w-6 hover:bg-gray-100 rounded-full" />
                        </button>
                    </div>
                    <div className="overflow-y-auto">
                        {looksLikeCustomer && customer ? (
                            <ViewCustomerSidepanel customer={customer} />
                        ) : data ? (
                            <pre className="text-sm text-gray-800 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
                        ) : (
                            <div className="text-sm text-gray-500">No details to show</div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
